/* ============================================
   /test — After the paper

   The last screen of the funnel, and the one that
   turns a finished test into an appointment: the
   applicant picks the hour in which CIT's
   Counselling Officer will call them, inside the 24
   hours after they submitted.

   NO SCORE, EVER. The server never sends one and
   this screen never asks — every applicant reads the
   same conditional sentence, because the cutoff is
   the admission team's to apply, not this page's.

   THE PICKER IS CONVENIENCE, NOT AUTHORITY. The
   chips are drawn from `completed_at`, but test.php
   re-derives the window and re-checks the chosen
   hour; a tab left open past a slot gets
   `invalid_slot` back and the list is redrawn rather
   than the booking silently landing in the past.

   Booking is WRITE-ONCE from here. A second attempt
   answers the slot that is already stored — changing
   an appointment is a conversation with the
   telecaller, not a form.

   Route-bundle discipline, same as the rest of
   /test: no framer-motion, no sweetalert2, no
   iconify, no MUI. 360 px first.
   ============================================ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  IconAlert,
  IconCalendarCheck,
  IconCalendarClock,
  IconDocument,
  IconFamily,
  IconPhone,
  IconWhatsApp,
} from './fields';
import { trackApplicationStep } from '../../utils/gtm';
import { trackContactClick } from '../../utils/contactTracking';
import { SUPPORT_PHONE } from '../../utils/applicationSubmit';

import styles from './Test.module.css';

const HOUR_MS = 3600 * 1000;

/** How far ahead of the submission the applicant may book. Mirrors test.php. */
const WINDOW_HOURS = 24;

/**
 * How long a slot stays offered after its hour has started. Mirrors
 * CIT_TEST_SLOT_PAST_GRACE_SECONDS — a chip this screen still shows must be one
 * the server will still accept, or Confirm fails for no reason the applicant
 * can see.
 */
const PAST_GRACE_MS = 5 * 60 * 1000;

/** How often the list re-checks the wall clock, so an hour that has passed
    stops being offered on a screen left open. */
const REFRESH_MS = 60 * 1000;

const SUPPORT_PHONE_HREF = `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`;

const WHATSAPP_LINK =
  'https://wa.me/918069645014?text=Hi%20CIT%20Admissions%2C%0AI%20have%20finished%20my%2030-Minute%20Online%20Merit%20Assessment%20Test%20and%20need%20help%20with%20my%20counselling%20call.';

const ERROR_MESSAGES = {
  invalid_slot:
    'That time has just passed. We have refreshed the list — please pick a time again.',
  not_completed:
    "We couldn't find your submitted test. Call us and our team will book your counselling call for you.",
  network:
    "We couldn't reach our server. Check your connection and try again — your test is already submitted, only the call time is left.",
  unavailable:
    'Our server is busy for a moment. Please try again — your test is already submitted.',
};

/* ----- Time formatting -----
   Slots are chosen and read in the device's local time (an IST audience) and
   stored as ISO UTC. Everything below formats; nothing below decides. */

/**
 * Split a locale time string into its clock part and its meridiem, so a slot
 * can render as "4:00 – 5:00 PM" rather than repeating "PM" twice in a chip
 * that has to fit two-across on a 360 px screen.
 * @param {Date} date
 * @returns {{time: string, meridiem: string}}
 */
const splitTime = (date) => {
  let raw;
  try {
    raw = date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    // No Intl data for en-IN (very old Android WebView) — build it by hand
    // rather than print a 24-hour string an applicant has to translate.
    const hours = date.getHours();
    const display = hours % 12 === 0 ? 12 : hours % 12;
    raw = `${display}:${String(date.getMinutes()).padStart(2, '0')} ${
      hours < 12 ? 'AM' : 'PM'
    }`;
  }
  // Engines disagree on "4:00 pm" vs "4:00 PM"; a row where half the chips
  // shout and half whisper looks broken.
  const match = raw.match(/^(.*?)\s*([ap])\.?m\.?$/i);
  if (!match) return { time: raw.trim(), meridiem: '' };
  return { time: match[1].trim(), meridiem: `${match[2].toUpperCase()}M` };
};

/**
 * The label on a slot chip: the hour the officer will call in.
 * @param {Date} start - Start of the hour
 * @returns {string} e.g. "4:00 – 5:00 PM", or "11:00 AM – 12:00 PM"
 */
const slotLabel = (start) => {
  const from = splitTime(start);
  const to = splitTime(new Date(start.getTime() + HOUR_MS));
  const fromText =
    from.meridiem && from.meridiem === to.meridiem
      ? from.time
      : `${from.time} ${from.meridiem}`.trim();
  const toText = `${to.time} ${to.meridiem}`.trim();
  return `${fromText} – ${toText}`;
};

/** Local midnight for a date, as epoch ms — the basis for Today / Tomorrow. */
const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/**
 * Which day a slot falls on, from the applicant's point of view.
 * @param {Date} date - Slot start
 * @param {number} nowMs - Current wall clock
 * @returns {string} 'Today', 'Tomorrow', or a written date
 */
const dayLabel = (date, nowMs) => {
  const offset = Math.round((startOfDay(date) - startOfDay(nowMs)) / 86400000);
  if (offset <= 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  try {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  } catch (error) {
    return date.toDateString();
  }
};

/**
 * The confirmed appointment, written out in full — this is the sentence the
 * applicant screenshots and shows their parents.
 * @param {string} iso - Stored slot
 * @returns {string} e.g. "Tuesday, 11 August, 4:00 – 5:00 PM", or ''
 */
const formatBookedSlot = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  let day;
  try {
    day = date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch (error) {
    day = date.toDateString();
  }
  return `${day}, ${slotLabel(date)}`;
};

/**
 * Every hour the applicant may still book, in order.
 *
 * Starts at the first full hour AFTER they submitted (a call cannot be booked
 * for the minute they finished) and runs to 24 hours after submission — the
 * same bounds test.php enforces. Hours already gone are dropped, so a screen
 * left open never offers a time that would be refused.
 *
 * @param {string} completedAtIso - The attempt's completion time
 * @param {number} nowMs - Current wall clock
 * @returns {Array<Date>} Slot starts, oldest first (empty if the window closed)
 */
const buildSlots = (completedAtIso, nowMs) => {
  if (!completedAtIso) return [];
  const completed = new Date(completedAtIso);
  if (Number.isNaN(completed.getTime())) return [];

  const windowEnd = completed.getTime() + WINDOW_HOURS * HOUR_MS;
  const earliest = nowMs - PAST_GRACE_MS;

  // Stepped with setHours rather than by adding milliseconds, so the chips stay
  // on local hour boundaries even across a daylight-saving change (India has
  // none; a phone set to another zone is not this code's problem to create).
  const cursor = new Date(completed);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1);

  const slots = [];
  while (cursor.getTime() <= windowEnd && slots.length < WINDOW_HOURS) {
    if (cursor.getTime() >= earliest) slots.push(new Date(cursor.getTime()));
    cursor.setHours(cursor.getHours() + 1);
  }
  return slots;
};

/**
 * Group consecutive slots by the day they fall on, preserving order.
 * @param {Array<Date>} slots
 * @param {number} nowMs
 * @returns {Array<{label: string, slots: Array<Date>}>}
 */
const groupSlots = (slots, nowMs) => {
  const groups = [];
  slots.forEach((slot) => {
    const label = dayLabel(slot, nowMs);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.slots.push(slot);
    } else {
      groups.push({ label, slots: [slot] });
    }
  });
  return groups;
};

// ============================================
// Pieces
// ============================================

/** What to bring to the call. Same three lines whether they just booked or came
    back to check — this is the part they need to act on. */
const PREP_ITEMS = [
  { icon: IconDocument, text: 'Keep your 10th & 12th marksheets with you.' },
  {
    icon: IconFamily,
    text: 'Have your parents with you — the officer speaks to the family too.',
  },
  {
    icon: IconPhone,
    text: 'Keep your phone reachable; the call takes about 15 minutes.',
  },
];

const PrepChecklist = () => (
  <ul className={styles.prepList}>
    {PREP_ITEMS.map((item) => {
      const PrepIcon = item.icon;
      return (
        <li key={item.text} className={styles.prepItem}>
          <span className={styles.prepIcon}>
            <PrepIcon size={20} />
          </span>
          <span>{item.text}</span>
        </li>
      );
    })}
  </ul>
);

/** Phone and WhatsApp, on every branch of this screen — an applicant who
    cannot book must never be left without a way to reach a human. */
const SupportRow = () => (
  <div className={styles.supportRow}>
    <a
      className={styles.supportBtn}
      href={SUPPORT_PHONE_HREF}
      onClick={() => trackContactClick('phone', 'test_post')}
    >
      <IconPhone size={18} />
      <span>Call {SUPPORT_PHONE}</span>
    </a>
    <a
      className={styles.supportBtn}
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackContactClick('whatsapp', 'test_post')}
    >
      <IconWhatsApp size={18} />
      <span>WhatsApp us</span>
    </a>
  </div>
);

// ============================================
// Screen
// ============================================

const PostTestScreen = ({
  apiUrl,
  testKey,
  studentName,
  completedAt,
  initialSlot,
  returning,
}) => {
  // The submission time the whole window is measured from. Normally arrives
  // with the response that completed the test; fetched below if it did not.
  const [windowStart, setWindowStart] = useState(completedAt || '');
  const [bookedSlot, setBookedSlot] = useState(initialSlot || '');
  const [chosen, setChosen] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [errorKind, setErrorKind] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  const mountedRef = useRef(true);
  const syncedRef = useRef(false);

  // Set on the way in as well as out — StrictMode's development double-mount
  // would otherwise leave every later response silently dropped.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const slots = useMemo(() => buildSlots(windowStart, nowMs), [windowStart, nowMs]);

  // An hour that scrolled into the past takes the selection with it, so Confirm
  // can never post a chip that is no longer on the screen.
  useEffect(() => {
    if (!chosen) return;
    if (slots.some((slot) => slot.toISOString() === chosen)) return;
    setChosen('');
  }, [slots, chosen]);

  // Keep the list honest on a screen left open — one cheap tick a minute, and
  // only while there is still a picker to keep honest.
  useEffect(() => {
    if (bookedSlot) return undefined;
    const id = setInterval(() => setNowMs(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, [bookedSlot]);

  /**
   * POST one action to the test API.
   * @param {string} action - 'state' | 'book_slot'
   * @param {Object} body - Action-specific fields (the key is added here)
   * @returns {Promise<Object|null>} Parsed response, or null on a transport error
   */
  const post = useCallback(
    async (action, body) => {
      const response = await fetch(`${apiUrl}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: testKey, ...body }),
      });
      if (!response.ok) throw new Error(`${action} returned ${response.status}`);
      return response.json();
    },
    [apiUrl, testKey]
  );

  /**
   * Ask the server where this attempt stands. Only needed when the response
   * that brought us here carried no `completed_at` — the picker cannot draw a
   * window without one.
   */
  const syncState = useCallback(async () => {
    setIsBusy(true);
    setErrorKind('');
    let data = null;
    try {
      data = await post('state', {});
    } catch (error) {
      if (!mountedRef.current) return;
      setIsBusy(false);
      setErrorKind('network');
      return;
    }
    if (!mountedRef.current) return;
    setIsBusy(false);

    if (!data || data.success !== true || data.state !== 'completed') {
      setErrorKind(data && data.error === 'unavailable' ? 'unavailable' : 'not_completed');
      return;
    }
    setNowMs(Date.now());
    if (data.completed_at) setWindowStart(data.completed_at);
    if (data.slot) setBookedSlot(data.slot);
  }, [post]);

  useEffect(() => {
    if (syncedRef.current) return;
    if (bookedSlot || windowStart) return;
    syncedRef.current = true;
    syncState();
  }, [bookedSlot, windowStart, syncState]);

  const handleConfirm = useCallback(async () => {
    if (!chosen || isBusy) return;
    setIsBusy(true);
    setErrorKind('');

    let data = null;
    try {
      data = await post('book_slot', { slot: chosen });
    } catch (error) {
      if (!mountedRef.current) return;
      setIsBusy(false);
      setErrorKind('network');
      return;
    }
    if (!mountedRef.current) return;
    setIsBusy(false);

    if (data && data.success === true && data.slot) {
      // `already_booked` means the appointment was made on an earlier request
      // (a double tap, a second tab) — show it, but do not count it twice.
      if (!data.already_booked) {
        // No key, no name, no time — the container only needs to know that a
        // slot was booked.
        trackApplicationStep('counselling_slot_booked');
      }
      setBookedSlot(data.slot);
      setChosen('');
      return;
    }

    const reason = data && data.error ? data.error : 'network';
    if (reason === 'invalid_slot') {
      // The window moved under the applicant — most often a chip that expired
      // while they were deciding. Redraw from the current clock and let them
      // pick again rather than blaming their choice.
      setNowMs(Date.now());
      setChosen('');
    }
    setErrorKind(ERROR_MESSAGES[reason] ? reason : 'network');
  }, [chosen, isBusy, post]);

  const heading = studentName ? `Test submitted, ${studentName}.` : 'Test submitted.';

  // ---- Booked: the appointment, and what to have ready ---------------------
  if (bookedSlot) {
    const booked = formatBookedSlot(bookedSlot);
    return (
      <div className={styles.screen}>
        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.intro}>
          Your answers are being evaluated. If you qualify, CIT&apos;s
          Counselling Officer will tele-counsel you at the time you chose.
        </p>

        <div className={styles.bookedBox}>
          <span className={styles.bookedIcon}>
            <IconCalendarCheck size={22} />
          </span>
          <span>
            Your tele-counselling call is booked for{' '}
            <strong className={styles.bookedTime}>{booked}</strong>.
          </span>
        </div>

        <h2 className={styles.subHeading}>Before the call</h2>
        <PrepChecklist />

        <p className={styles.supportNote}>
          Need to change the time, or have a question? Talk to our admission
          team.
        </p>
        <SupportRow />
      </div>
    );
  }

  // ---- Not booked, and no window to draw one from --------------------------
  if (!windowStart) {
    return (
      <div className={styles.screen}>
        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.intro}>
          Your answers are being evaluated. If you qualify, CIT&apos;s
          Counselling Officer will tele-counsel you within the next 24 hours.
        </p>

        {errorKind && (
          <div className={styles.errorBanner} role="alert">
            <span className={styles.bannerIcon}>
              <IconAlert size={18} />
            </span>
            <span>{ERROR_MESSAGES[errorKind]}</span>
          </div>
        )}

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={syncState}
          disabled={isBusy}
        >
          {isBusy ? 'Loading…' : 'Choose your call time'}
        </button>

        <p className={styles.supportNote}>
          Or let our team fix a time with you directly.
        </p>
        <SupportRow />
      </div>
    );
  }

  // ---- The 24 hours have run out ------------------------------------------
  if (slots.length === 0) {
    return (
      <div className={styles.screen}>
        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.intro}>
          Your answers are being evaluated. The 24-hour window for choosing your
          own call time has closed — our Counselling Officer will call you on the
          number in your application.
        </p>

        <h2 className={styles.subHeading}>Before the call</h2>
        <PrepChecklist />

        <p className={styles.supportNote}>
          Want a specific time instead? Tell our team.
        </p>
        <SupportRow />
      </div>
    );
  }

  // ---- The picker ----------------------------------------------------------
  const groups = groupSlots(slots, nowMs);

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>{heading}</h1>
      <p className={styles.intro}>
        Your answers are being evaluated. If you qualify, CIT&apos;s Counselling
        Officer will tele-counsel you within the next 24 hours — at the time you
        choose below.
      </p>

      <div className={styles.slotNotice}>
        <span className={styles.slotNoticeIcon}>
          <IconCalendarClock size={20} />
        </span>
        <span>
          Pick the hour that suits you best. The call takes about 15 minutes and
          your parents should be with you.
        </span>
      </div>

      {returning && (
        <p className={styles.resumeNote}>
          Your key has already been used for its one attempt — only your call
          time is left to choose.
        </p>
      )}

      <div
        className={styles.slotGroups}
        role="radiogroup"
        aria-label="Choose the time for your tele-counselling call"
      >
        {groups.map((group) => (
          <div key={group.label} className={styles.slotGroup}>
            <h2 className={styles.slotGroupTitle}>{group.label}</h2>
            <div className={styles.slotGrid}>
              {group.slots.map((slot) => {
                const value = slot.toISOString();
                const selected = value === chosen;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={styles.slotChip}
                    data-selected={selected ? 'true' : undefined}
                    onClick={() => setChosen(value)}
                    disabled={isBusy}
                  >
                    {slotLabel(slot)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {errorKind && (
        <div className={styles.errorBanner} role="alert">
          <span className={styles.bannerIcon}>
            <IconAlert size={18} />
          </span>
          <span>{ERROR_MESSAGES[errorKind]}</span>
        </div>
      )}

      <button
        type="button"
        className={styles.primaryBtn}
        onClick={handleConfirm}
        disabled={!chosen || isBusy}
      >
        {isBusy ? 'Booking…' : 'Confirm my call time'}
      </button>

      <p className={styles.engineNote}>
        You can choose your call time once. After that, any change goes through
        our admission team.
      </p>

      <p className={styles.supportNote}>Prefer to talk to us instead?</p>
      <SupportRow />
    </div>
  );
};

export default PostTestScreen;
