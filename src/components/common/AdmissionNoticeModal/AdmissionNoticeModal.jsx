/* ============================================
   AdmissionNoticeModal
   First-visit admission notice for the landing page.

   Shows once, after the visitor has genuinely spent
   10 seconds on the page, and states two facts that
   already run through the site: Session 2026 is in
   its closing phase, and only TOTAL_SEATS_LEFT seats
   remain across the seven B.E. branches. Its CTA goes
   to /apply through useApplyCTA, like every other CTA
   on the site, so the lead carries its own source key
   ('admission-notice') and campaign reporting can tell
   a popup lead from a hero lead.

   Skip it and it is gone for good — the dismissal is
   written to localStorage, so it survives the tab, the
   session and the next visit.

   Deliberately dependency-free (no framer-motion, no
   iconify, no MUI): it is mounted eagerly so the 10s
   timer can never be beaten by a chunk still in flight
   on a budget Android, and that is only affordable if
   the component weighs almost nothing.
   ============================================ */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import useApplyCTA from '../../../hooks/useApplyCTA';
import { trackAdmissionNotice } from '../../../utils/gtm';
import {
  THANKYOU_KEY_STORAGE,
  THANKYOU_SUBMITTED_STORAGE,
} from '../../../utils/applicationSubmit';
import {
  PROGRAM_NAME,
  SESSION_LABEL,
  TEST_NAME,
  TOTAL_SEATS_LEFT,
} from '../../../data/meritProgram';
import styles from './AdmissionNoticeModal.module.css';

/**
 * localStorage flag written the moment the notice is skipped or acted on.
 * localStorage (not sessionStorage) on purpose: "should not appear for that
 * student again" means across visits, not just across this tab.
 */
export const NOTICE_DISMISSED_KEY = 'cit_admission_notice_dismissed';

/** Visible dwell time on the page before the notice appears. */
const DWELL_MS = 10000;

/** Focusable children the Tab trap cycles through. */
const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Has this device already skipped (or acted on) the notice?
 * @returns {boolean} true when the notice must stay hidden
 */
const hasDismissedNotice = () => {
  try {
    return localStorage.getItem(NOTICE_DISMISSED_KEY) === '1';
  } catch (error) {
    // localStorage unavailable (private mode) — treat as not yet dismissed;
    // the notice then shows once per session, which is the safe direction.
    return false;
  }
};

/** Remember the dismissal so the notice never returns for this student. */
const rememberDismissal = () => {
  try {
    localStorage.setItem(NOTICE_DISMISSED_KEY, '1');
  } catch (error) {
    // Private mode — nothing to persist to; the in-memory state still hides
    // the notice for the rest of this visit.
  }
};

/**
 * An applicant who already submitted is not a lead to chase — never interrupt
 * them with an admission notice on their way back to the page.
 * @returns {boolean} true when this visitor has already applied this session
 */
const hasAlreadyApplied = () => {
  try {
    return Boolean(
      sessionStorage.getItem(THANKYOU_KEY_STORAGE) ||
        sessionStorage.getItem(THANKYOU_SUBMITTED_STORAGE)
    );
  } catch (error) {
    return false;
  }
};

const AdmissionNoticeModal = () => {
  // Resolved once, at mount: a visitor who has skipped the notice before never
  // even starts the timer.
  const [armed] = useState(() => !hasDismissedNotice() && !hasAlreadyApplied());
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);

  const applyCTA = useApplyCTA('admission-notice', {
    location: 'admission_notice_modal',
  });

  // ---------------------------------------------------------------
  // Trigger — 10 seconds of *visible* time, not 10 seconds of wall clock.
  // A page opened in a background tab has not been "stayed on".
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!armed) return undefined;

    let accrued = 0;
    let visibleSince = 0;
    let timer = null;
    let done = false;

    const open = () => {
      timer = null;
      done = true;
      setIsOpen(true);
    };

    const start = () => {
      if (done || timer) return;
      visibleSince = Date.now();
      timer = window.setTimeout(open, Math.max(0, DWELL_MS - accrued));
    };

    const pause = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
      if (visibleSince) {
        accrued += Date.now() - visibleSince;
        visibleSince = 0;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) pause();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timer) window.clearTimeout(timer);
    };
  }, [armed]);

  /**
   * Close the notice for good.
   * @param {string} method - How it was closed, for the GTM event
   */
  const dismiss = useCallback((method) => {
    rememberDismissal();
    trackAdmissionNotice('dismiss', { dismiss_method: method });
    setIsOpen(false);
  }, []);

  const handleApply = useCallback(() => {
    // Acting on the notice retires it too — an applicant coming back to the
    // page should not be told about closing admissions all over again.
    rememberDismissal();
    trackAdmissionNotice('cta');
    setIsOpen(false);
    // Fires `cta_click`, stashes the source key for applicationSubmit.js and
    // navigates to /apply — the single lead-capture surface.
    applyCTA.onClick();
  }, [applyCTA]);

  // ---------------------------------------------------------------
  // Open-state side effects: scroll lock, focus handling, Esc + Tab trap.
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return undefined;

    trackAdmissionNotice('view');

    // Save and restore rather than blanking: the mobile drawer sets this too,
    // and closing the notice must not unlock a body it did not lock.
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    if (dialog) dialog.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss('escape');
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, dismiss]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss('backdrop');
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admission-notice-title"
        aria-describedby="admission-notice-body"
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.close}
          onClick={() => dismiss('close_button')}
          aria-label="Close admission notice"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            />
          </svg>
        </button>

        {/* Masthead — reads as a notice-board circular, not a promotion */}
        <div className={styles.masthead}>
          <span className={styles.noticeLabel}>Admission Notice</span>
          <span className={styles.session}>{SESSION_LABEL}</span>
        </div>
        <div className={styles.rule} aria-hidden="true" />

        <div className={styles.body}>
          <h2 id="admission-notice-title" className={styles.title}>
            B.E. admissions for {SESSION_LABEL} are closing
          </h2>

          <div className={styles.seatBlock}>
            <span className={styles.seatCount}>{TOTAL_SEATS_LEFT}</span>
            <span className={styles.seatText}>
              seats left in total, across all
              <br />
              seven B.E. branches
            </span>
          </div>

          <p id="admission-notice-body" className={styles.lead}>
            These are the final seats of the session. They are not allotted
            first-come — every one of them is filled strictly on merit, through
            the <strong>{TEST_NAME}</strong>.
          </p>

          <ul className={styles.points}>
            <li className={styles.point}>
              Applications close as soon as the {TOTAL_SEATS_LEFT} seats are
              filled
            </li>
            <li className={styles.point}>
              No capitation, no consultancy or agent fees
            </li>
            <li className={styles.point}>
              Open to students across India, Nepal and Bhutan
            </li>
          </ul>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={handleApply}
              onPointerDown={applyCTA.onPointerDown}
            >
              Apply for {SESSION_LABEL}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => dismiss('not_now')}
            >
              Not now
            </button>
          </div>

          <p className={styles.footnote}>
            Issued for the {PROGRAM_NAME}, Channabasaveshwara Institute of
            Technology, Tumkur.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdmissionNoticeModal;
