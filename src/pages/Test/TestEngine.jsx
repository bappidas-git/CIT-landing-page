/* ============================================
   /test — The engine

   One question per screen, a 60-second countdown,
   Next, and nothing else. No back button, no
   question list, no jump-to — the server refuses a
   stale index anyway, so there is nothing to build
   a back control out of.

   THE CLOCK IS THE SERVER'S. Every deadline here is
   derived from the `remaining_seconds` the server
   sends with a question, so a backgrounded tab, a
   throttled timer or a device with the wrong date
   all still hit zero at the right moment. When this
   countdown reaches 0 it does not score anything —
   it posts a blank and asks for the next question.

   Route-bundle discipline, same as /apply: no
   framer-motion, no sweetalert2, no iconify, no MUI.
   ============================================ */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { IconAlert, IconChevronRight } from './fields';
import { trackApplicationStep } from '../../utils/gtm';

import styles from './Test.module.css';

/** How often the countdown re-reads the wall clock. */
const TICK_MS = 250;

/** Seconds remaining at which the timer turns urgent (colour + announcement). */
const WARN_SECONDS = 10;

const SUBJECT_LABELS = {
  maths: 'Mathematics',
  physics: 'Physics',
};

const ERROR_MESSAGES = {
  network:
    "We couldn't reach the test server. Reconnect quickly — the question timer keeps running.",
  unavailable:
    'The test server is busy for a moment. Retry now — the question timer keeps running.',
};

/** A, B, C, D — option labels, derived rather than listed. */
const optionLabel = (index) => String.fromCharCode(65 + index);

/**
 * The countdown, its bar and the question counter — the only things on this
 * screen that must be readable without scrolling, so they sit in one sticky row.
 */
const TimerBar = ({ index, total, subject, secondsLeft, secondsPerQuestion }) => {
  const urgent = secondsLeft <= WARN_SECONDS;
  const ratio = secondsPerQuestion > 0 ? secondsLeft / secondsPerQuestion : 0;

  return (
    <div className={styles.engineBar} data-urgent={urgent ? 'true' : undefined}>
      <div className={styles.engineBarTop}>
        <span className={styles.progressCount}>
          Question {index + 1} of {total}
        </span>
        <span className={styles.subjectTag}>
          {SUBJECT_LABELS[subject] || subject}
        </span>
        <span className={styles.countdown}>
          {secondsLeft}
          <span className={styles.countdownUnit}>s</span>
        </span>
      </div>

      {/* Compositor-only: a scaled bar, never a changing width. */}
      <div className={styles.timerTrack}>
        <div
          className={styles.timerFill}
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, ratio))})` }}
        />
      </div>

      {/* Silent until it matters — announcing every second of every question
          would drown out the question itself. */}
      <span className={styles.srOnly} aria-live="polite">
        {urgent
          ? `${secondsLeft} second${secondsLeft === 1 ? '' : 's'} left`
          : ''}
      </span>
    </div>
  );
};

const TestEngine = ({
  apiUrl,
  testKey,
  resume,
  secondsPerQuestion,
  onCompleted,
  onLost,
}) => {
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isBusy, setIsBusy] = useState(true);
  const [errorKind, setErrorKind] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(secondsPerQuestion);

  // The wall-clock instant this question dies. Deadline-based rather than
  // tick-counted, so a phone that slept through 20 seconds wakes up honest.
  const deadlineRef = useRef(0);
  // One auto-submit per question, however many ticks land after zero.
  const timedOutRef = useRef(false);
  // What we last tried to send, so Retry re-sends exactly that.
  const pendingRef = useRef(null);
  const inFlightRef = useRef(false);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);
  // Read by the interval so the timer effect depends on the question alone and
  // never gets torn down and rebuilt mid-count.
  const submitRef = useRef(null);

  // Set on the way IN as well as out: StrictMode mounts, unmounts and remounts
  // in development, and a flag only ever cleared would leave every response
  // after that first cleanup silently dropped.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Apply a server payload to the screen.
   * @param {Object} data - Parsed response from any engine action
   */
  const applyPayload = useCallback(
    (data) => {
      if (!data || !mountedRef.current) return;

      if (data.state === 'completed') {
        trackApplicationStep('merit_test_complete', { test_state: 'completed' });
        onCompleted();
        return;
      }

      if (data.state === 'not_started' || data.error === 'tnc_required') {
        // The attempt this screen was mounted for is not there — back to the
        // instructions rather than a dead screen.
        onLost();
        return;
      }

      if (data.question) {
        // Includes the out_of_sync path: the server sent the question it is
        // actually on, so we simply become that screen. No error is shown —
        // from the applicant's side nothing went wrong.
        setQuestion(data.question);
        setSelected(null);
        setErrorKind('');
      }
    },
    [onCompleted, onLost]
  );

  /**
   * POST one engine action. Never logs the payload — it carries question text
   * and, on the way in, the applicant's key.
   * @param {string} action - 'start' | 'state' | 'answer'
   * @param {Object} body - Action-specific fields (the key is added here)
   */
  const post = useCallback(
    async (action, body) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      pendingRef.current = { action, body };
      setIsBusy(true);

      let data = null;
      try {
        const response = await fetch(`${apiUrl}?action=${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: testKey, ...body }),
        });
        if (!response.ok) throw new Error(`${action} returned ${response.status}`);
        data = await response.json();
      } catch (error) {
        inFlightRef.current = false;
        if (!mountedRef.current) return;
        setIsBusy(false);
        setErrorKind('network');
        return;
      }

      inFlightRef.current = false;
      if (!mountedRef.current) return;
      setIsBusy(false);

      // `out_of_sync` is a success in disguise — it answers success:false but
      // carries the question the server is really on, and re-syncing to it is
      // the whole point. Anything with neither a usable state nor a question
      // (a busy store, a key that stopped resolving) becomes a retry banner
      // rather than a frozen screen the applicant can do nothing with.
      const usable =
        data &&
        (data.success === true || data.question || data.error === 'tnc_required');
      if (!usable) {
        setErrorKind(data && data.error === 'unavailable' ? 'unavailable' : 'network');
        return;
      }

      pendingRef.current = null;

      // Fired here rather than at the call site, so it means "the server drew a
      // paper", not "we asked it to".
      if (action === 'start' && data.state === 'in_progress') {
        trackApplicationStep('merit_test_start', { test_state: 'in_progress' });
      }

      applyPayload(data);
    },
    [apiUrl, testKey, applyPayload]
  );

  /**
   * Send the answer for the question on screen.
   * @param {number|null} choice - Chosen option index, or null for a timeout
   */
  const submitAnswer = useCallback(
    (choice) => {
      if (!question) return;
      post('answer', { index: question.index, selected: choice });
    },
    [post, question]
  );

  // The interval reads the sender through this ref, so the countdown effect can
  // depend on the question alone and never be torn down mid-count.
  useEffect(() => {
    submitRef.current = submitAnswer;
  }, [submitAnswer]);

  // ---- First paint: start a new attempt, or resume the one in flight -------
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // `start` on an existing attempt resumes it server-side anyway, so a double
    // mount can never draw a second paper — this just keeps the calls honest.
    if (resume) {
      post('state', {});
      return;
    }
    // The terms were accepted on the previous screen; the server refuses to
    // create an attempt without this.
    post('start', { tnc_accepted: true });
  }, [post, resume]);

  // ---- The countdown ------------------------------------------------------
  useEffect(() => {
    if (!question) return undefined;

    deadlineRef.current = Date.now() + question.remaining_seconds * 1000;
    timedOutRef.current = false;
    setSecondsLeft(question.remaining_seconds);

    const id = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000)
      );
      setSecondsLeft(left);

      if (left <= 0 && !timedOutRef.current) {
        timedOutRef.current = true;
        // A blank, not a score. The server decides what a late answer is worth.
        if (submitRef.current) submitRef.current(null);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [question]);

  // ---- Courtesy guard -----------------------------------------------------
  // Leaving does not lose the attempt (logging back in resumes it), but it does
  // burn timer seconds, so a tab-close is worth one confirm.
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleRetry = () => {
    const pending = pendingRef.current;
    setErrorKind('');
    if (pending) {
      post(pending.action, pending.body);
      return;
    }
    post('state', {});
  };

  if (!question) {
    return (
      <div className={styles.screen}>
        <h1 className={styles.heading}>
          {errorKind ? 'Connection problem' : 'Preparing your paper…'}
        </h1>
        {errorKind ? (
          <>
            <div className={styles.errorBanner} role="alert">
              <span className={styles.bannerIcon}>
                <IconAlert size={18} />
              </span>
              <span>{ERROR_MESSAGES[errorKind]}</span>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleRetry}
              disabled={isBusy}
            >
              {isBusy ? 'Retrying…' : 'Retry'}
            </button>
          </>
        ) : (
          <p className={styles.intro}>
            Drawing your 30 questions. This takes a moment.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.engine}>
      <TimerBar
        index={question.index}
        total={question.total}
        subject={question.subject}
        secondsLeft={secondsLeft}
        secondsPerQuestion={secondsPerQuestion}
      />

      {/* pre-wrap, not <pre>: the bank writes plain text with Unicode notation
          (x², √, π), and any line break it does contain is meant. */}
      <p className={styles.questionText}>{question.q}</p>

      <div className={styles.options} role="radiogroup" aria-label="Answer options">
        {question.options.map((option, index) => (
          <button
            // Options are positional — the index IS the identity here, and it
            // is what gets posted back.
            key={index}
            type="button"
            role="radio"
            aria-checked={selected === index}
            className={styles.option}
            data-selected={selected === index ? 'true' : undefined}
            onClick={() => setSelected(index)}
            disabled={isBusy}
          >
            <span className={styles.optionMark}>{optionLabel(index)}</span>
            <span className={styles.optionText}>{option}</span>
          </button>
        ))}
      </div>

      {errorKind && (
        <div className={styles.errorBanner} role="alert">
          <span className={styles.bannerIcon}>
            <IconAlert size={18} />
          </span>
          <span>
            {ERROR_MESSAGES[errorKind]}
            <button
              type="button"
              className={styles.retryLink}
              onClick={handleRetry}
              disabled={isBusy}
            >
              {isBusy ? 'Retrying…' : 'Retry now'}
            </button>
          </span>
        </div>
      )}

      <button
        type="button"
        className={styles.primaryBtn}
        onClick={() => submitAnswer(selected)}
        disabled={selected === null || isBusy}
      >
        {isBusy ? 'Saving…' : 'Next'}
        {!isBusy && <IconChevronRight size={20} />}
      </button>

      <p className={styles.engineNote}>
        Your answer is saved when you tap Next. You cannot return to a question
        once you move on.
      </p>
    </div>
  );
};

export default TestEngine;
