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

   ONLY HOURS THE DESK IS STAFFED. The 24-hour window
   is intersected with the counselling office's day —
   10:00 to 19:00 IST, every day of the week — so a
   paper finished at 11 PM offers 10 AM tomorrow
   rather than midnight tonight. The hours are the
   OFFICER'S, computed from a fixed IST offset and
   never from the device's timezone.

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
const DAY_MS = 24 * HOUR_MS;

/** How far ahead of the submission the applicant may book. Mirrors test.php. */
const WINDOW_HOURS = 24;

/**
 * The counselling desk's clock, and the working day inside it.
 *
 * MIRRORS test.php — `CIT_TEST_SLOT_TZ_OFFSET_SECONDS`,
 * `CIT_TEST_SLOT_FIRST_HOUR`, `CIT_TEST_SLOT_LAST_HOUR`. Every chip drawn here
 * is re-checked against those three before a booking is written, so a chip this
 * screen shows that they would refuse is a Confirm that fails for no reason the
 * applicant can see. Change the two files together.
 *
 * The officers sit in Tumkur and work 10:00–19:00 IST, all seven days, so
 * these are IST hours — derived from a fixed offset rather than the device's
 * own timezone. A phone left on the wrong zone would otherwise be offered a
 * 10 AM chip that is the middle of the night at the desk. India keeps no
 * daylight saving, so a constant offset is exact rather than an approximation.
 */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const OFFICE_FIRST_HOUR = 10;
const OFFICE_LAST_HOUR = 18; // the last hour a call may START in — it runs to 19:00

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
  'https://wa.me/918453623233?text=Hi%20CIT%20Admissions%2C%0AI%20have%20finished%20my%2030-Minute%20Online%20Merit%20Assessment%20Test%20and%20need%20help%20with%20my%20counselling%20call.';

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
   Slots are stored as ISO UTC and read here in IST, the counselling desk's own
   clock. Everything below formats; nothing below decides.

   Formatting is hand-rolled from the fixed offset rather than handed to
   `toLocaleString`, because the one thing that must never happen is a chip
   quietly rendering in the device's timezone: an applicant who reads "4:00 PM"
   and is called at what their phone thinks is 4:00 PM has been told the wrong
   time. `timeZone: 'Asia/Kolkata'` would say it exactly, but budget Android
   WebViews ship without the timezone data to honour it — and the failure is
   silent. Slots are always whole hours, so there is little to build anyway. */

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * An instant read on the officers' clock. Shifting by the offset and reading
 * with getUTC* keeps the device's own timezone out of every string below.
 * @param {number} ms - Epoch ms
 * @returns {{hour: number, weekday: string, day: number, month: string, dayIndex: number}}
 */
const istParts = (ms) => {
  const shifted = ms + IST_OFFSET_MS;
  const date = new Date(shifted);
  return {
    hour: date.getUTCHours(),
    weekday: WEEKDAYS[date.getUTCDay()],
    day: date.getUTCDate(),
    month: MONTHS[date.getUTCMonth()],
    // Days since the epoch in IST — equal for two instants on the same IST
    // date, which is all Today / Tomorrow needs to know.
    dayIndex: Math.floor(shifted / DAY_MS),
  };
};

/**
 * A whole hour on the clock, split so a chip can render "4:00 – 5:00 PM"
 * rather than repeating "PM" twice in a box that has to fit two-across on a
 * 360 px screen.
 * @param {number} hour - Hour of the day, 0–23
 * @returns {{time: string, meridiem: string}}
 */
const hourParts = (hour) => ({
  time: `${hour % 12 === 0 ? 12 : hour % 12}:00`,
  meridiem: hour < 12 ? 'AM' : 'PM',
});

/**
 * The label on a slot chip: the hour the officer will call in.
 * @param {number} ms - Start of the hour, epoch ms
 * @returns {string} e.g. "4:00 – 5:00 PM", or "11:00 AM – 12:00 PM"
 */
const slotLabel = (ms) => {
  const from = hourParts(istParts(ms).hour);
  const to = hourParts(istParts(ms + HOUR_MS).hour);
  const fromText =
    from.meridiem === to.meridiem ? from.time : `${from.time} ${from.meridiem}`;
  return `${fromText} – ${to.time} ${to.meridiem}`;
};

/**
 * Which day a slot falls on, from the applicant's point of view.
 * @param {number} ms - Slot start, epoch ms
 * @param {number} nowMs - Current wall clock
 * @returns {string} 'Today', 'Tomorrow', or a written date
 */
const dayLabel = (ms, nowMs) => {
  const offset = istParts(ms).dayIndex - istParts(nowMs).dayIndex;
  if (offset <= 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  const parts = istParts(ms);
  return `${parts.weekday}, ${parts.day} ${parts.month.slice(0, 3)}`;
};

/**
 * The confirmed appointment, written out in full — this is the sentence the
 * applicant screenshots and shows their parents.
 * @param {string} iso - Stored slot
 * @returns {string} e.g. "Tuesday, 11 August, 4:00 – 5:00 PM", or ''
 */
const formatBookedSlot = (iso) => {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const parts = istParts(ms);
  return `${parts.weekday}, ${parts.day} ${parts.month}, ${slotLabel(ms)}`;
};

/**
 * Every hour the applicant may still book, in order.
 *
 * Three bounds, all of which test.php re-applies:
 *   - starts at the first IST hour AFTER they submitted — a call cannot be
 *     booked for the minute they finished;
 *   - runs to 24 hours after submission;
 *   - keeps only the hours the desk is staffed, so a paper finished outside
 *     office hours offers the next morning rather than the small hours.
 *
 * Hours already gone are dropped too, so a screen left open never offers a time
 * that would be refused.
 *
 * The three bounds always overlap: any 24-hour window spans a whole office day,
 * so an applicant who has just finished is never shown an empty picker,
 * whatever time of night they sat the paper.
 *
 * @param {string} completedAtIso - The attempt's completion time
 * @param {number} nowMs - Current wall clock
 * @returns {Array<number>} Slot starts as epoch ms, oldest first (empty if the
 *   window has closed)
 */
const buildSlots = (completedAtIso, nowMs) => {
  if (!completedAtIso) return [];
  const completed = new Date(completedAtIso).getTime();
  if (Number.isNaN(completed)) return [];

  const windowEnd = completed + WINDOW_HOURS * HOUR_MS;
  const earliest = nowMs - PAST_GRACE_MS;

  // The first IST hour boundary strictly after submission. Floor-then-add
  // rather than round up, so a paper submitted exactly on the hour still moves
  // to the next one instead of offering the minute it was handed in.
  const firstHour =
    (Math.floor((completed + IST_OFFSET_MS) / HOUR_MS) + 1) * HOUR_MS - IST_OFFSET_MS;

  const slots = [];
  for (let cursor = firstHour; cursor <= windowEnd; cursor += HOUR_MS) {
    const { hour } = istParts(cursor);
    if (hour < OFFICE_FIRST_HOUR || hour > OFFICE_LAST_HOUR) continue;
    if (cursor < earliest) continue;
    slots.push(cursor);
  }
  return slots;
};

/**
 * Group consecutive slots by the day they fall on, preserving order.
 * @param {Array<number>} slots
 * @param {number} nowMs
 * @returns {Array<{label: string, slots: Array<number>}>}
 */
/** The wire form of a slot: what the chip posts, and what test.php parses. */
const toIso = (ms) => new Date(ms).toISOString();

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
    if (slots.some((slot) => toIso(slot) === chosen)) return;
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
          number in your application, between 10:00 AM and 7:00 PM.
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
          Our Counselling Officers call between{' '}
          <strong>10:00 AM and 7:00 PM</strong>, every day of the week. Pick the
          hour that suits you best — the call takes about 15 minutes and your
          parents should be with you.
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
                const value = toIso(slot);
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
