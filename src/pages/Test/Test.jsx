/* ============================================
   /test — 30-Minute Online Merit Assessment Test

   A small screen-state machine:
     login → instructions → tnc → engine → done

   The LOGIN KEY IS THE CREDENTIAL. Nothing here
   sends a lead_id: test.php resolves the applicant
   from the CIT26-XXXXX key alone, and answers with
   the attempt state that decides which screen the
   applicant lands on. Scores and answers never
   travel to this route.

   Design constraints (budget Android on Jio) —
   the same ones /apply ships under:
   - Only the active screen is mounted.
   - No framer-motion, no sweetalert2, no iconify,
     no MUI popovers; native controls and inline
     SVG paths only.
   - 360 px first, 44 px touch targets, 16 px
     inputs (no iOS zoom-on-focus jump).

   Screens 4 and 5 are placeholders here: the test
   engine arrives with prompt 08 and the slot
   booking with prompt 09. Both mount where the
   placeholders sit, with the props already wired.
   ============================================ */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  CheckboxField,
  IconAlert,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconList,
  IconLock,
  IconNoBack,
  IconOneAttempt,
  IconPlusCircle,
  IconSave,
  IconSkipNext,
  IconTimer,
  KeyField,
  formatKey,
  maskKeyBody,
} from './fields';

import { updatePageSEO } from '../../utils/seo';
import { trackApplicationStep } from '../../utils/gtm';
import { trackContactClick } from '../../utils/contactTracking';
import {
  SUPPORT_PHONE,
  THANKYOU_KEY_STORAGE,
} from '../../utils/applicationSubmit';

import styles from './Test.module.css';

const LOGO_URL =
  'https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669113/logo-cit_ykpxvd.png';

const PROGRAM_NAME = 'CIT Merit-Based Selection Program 2026';

const TEST_API_URL = process.env.REACT_APP_TEST_API_URL || '/api/test.php';

const SUPPORT_PHONE_HREF = `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`;

/* The shape of the paper. test.php sends these with every successful login and
   they are what the rules below are written from — so the instructions can
   never drift from what the engine actually serves. This copy is the fallback
   for the (impossible-in-practice) case of a login response without them. */
const DEFAULT_TEST = {
  total: 30,
  maths: 15,
  physics: 15,
  seconds_per_question: 60,
  marks_correct: 4,
};

const ERROR_MESSAGES = {
  invalid_key:
    "That key doesn't look right. Check the key we showed you after your application, or call us — our team can re-share it.",
  network:
    "We couldn't reach the test server. Check your connection and try again — or call us and we'll get you started.",
};

/**
 * Read the key /apply stashed on this device, if the applicant is coming
 * straight off /thank-you. A pure read — a missing or unreadable value simply
 * leaves the field empty.
 * @returns {string} Masked key body, or ''
 */
const readStoredKeyBody = () => {
  try {
    return maskKeyBody(sessionStorage.getItem(THANKYOU_KEY_STORAGE) || '');
  } catch (error) {
    // Private mode / blocked storage — the applicant types the key instead.
    return '';
  }
};

/**
 * Render an ISO timestamp as something an applicant reads at a glance. Falls
 * back to '' rather than printing a raw ISO string if the value is unusable.
 * @param {string} iso - ISO 8601 timestamp from the login response
 * @returns {string} e.g. "10 Aug 2026, 2:35 pm", or ''
 */
const formatCompletedAt = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (error) {
    return date.toDateString();
  }
};

/**
 * Build the rules list from the server's test parameters.
 * @param {Object} test - The `test` block from the login response
 * @returns {Array<{icon: Function, text: string}>} Rules in display order
 */
const buildRules = (test) => [
  {
    icon: IconList,
    text: `${test.total} multiple-choice questions — ${test.maths} Mathematics + ${test.physics} Physics (Class-12 level)`,
  },
  {
    icon: IconTimer,
    text: `${test.seconds_per_question} seconds per question — the timer is always visible`,
  },
  {
    icon: IconPlusCircle,
    text: `+${test.marks_correct} marks for every correct answer; 0 for wrong or unanswered — maximum ${
      test.total * test.marks_correct
    }`,
  },
  { icon: IconNoBack, text: 'No going back to a previous question' },
  {
    icon: IconSkipNext,
    text: 'If time runs out, the next question appears automatically',
  },
  {
    icon: IconClock,
    text: `Total duration: about ${Math.round(
      (test.total * test.seconds_per_question) / 60
    )} minutes — keep a stable internet connection`,
  },
  {
    icon: IconOneAttempt,
    text: 'One attempt only — your key locks after you finish',
  },
  {
    icon: IconSave,
    text: 'Your answers are saved as you go; if your connection drops, log in again with the same key to continue where you left off.',
  },
];

/** Plain-English terms. Short enough to actually be read on a 360 px screen. */
const TERMS = [
  {
    title: 'One attempt per Login Key',
    body: 'Your key opens the test once. When you finish, the key locks and cannot start a second attempt.',
  },
  {
    title: 'The attempt is personal',
    body: 'The applicant named on the application must answer the questions themselves. No help from another person, and nobody else may answer on your behalf.',
  },
  {
    title: 'The rules are enforced by our server',
    body: 'The 60-second limit per question and the no-going-back rule are applied on our side, not in your browser. Closing the tab does not pause the timer.',
  },
  {
    title: 'Your score is used only for admission',
    body: `Your result counts towards selection for the ${PROGRAM_NAME} and nothing else. We do not publish it.`,
  },
  {
    title: "Qualification is CIT's decision",
    body: "Finishing the test is not an offer of a seat. Seats are limited, and the admission team makes the final decision.",
  },
  {
    title: 'Your data',
    body: 'Your application details and test responses are processed for this admission process by CIT and its marketing partner, Assam Digital, in line with the privacy policy on this site.',
  },
  {
    title: 'Manipulation cancels the attempt',
    body: 'Sharing the questions, using automated tools, or trying to change answers or scores after submitting cancels the attempt and the application with it.',
  },
];

// ============================================
// Screens
// ============================================

/**
 * Screen 1 — the applicant proves who they are with the key we issued them.
 */
const LoginScreen = ({
  keyBody,
  onKeyChange,
  onSubmit,
  isSubmitting,
  errorKind,
  inputRef,
}) => (
  <form className={styles.screen} onSubmit={onSubmit} noValidate>
    <h1 className={styles.heading}>Enter your Test Login Key</h1>
    <p className={styles.intro}>
      This is the key we showed you right after your application. It is the only
      way into the test.
    </p>

    <KeyField
      id="test-login-key"
      value={keyBody}
      onChange={onKeyChange}
      error={errorKind === 'invalid_key'}
      inputRef={inputRef}
      onSubmitHint="Type it with or without the CIT26- part — we add it for you."
    />

    {errorKind && (
      <div className={styles.errorBanner} role="alert">
        <span className={styles.bannerIcon}>
          <IconAlert size={18} />
        </span>
        <span>
          {ERROR_MESSAGES[errorKind]}
          <a
            className={styles.callLink}
            href={SUPPORT_PHONE_HREF}
            onClick={() => trackContactClick('phone', 'test_login')}
          >
            Call {SUPPORT_PHONE}
          </a>
        </span>
      </div>
    )}

    <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
      {isSubmitting ? 'Checking…' : 'Continue'}
      {!isSubmitting && <IconChevronRight size={20} />}
    </button>

    {/* One flex child, so the full stop after the link never floats away from
        it across the row's gap. */}
    <p className={styles.footNote}>
      <IconLock size={12} />
      <span>
        Don&apos;t have your key yet?{' '}
        <Link className={styles.inlineLink} to="/apply">
          Apply first
        </Link>
        .
      </span>
    </p>
  </form>
);

/**
 * Screen 2 — what the applicant is walking into, before any commitment.
 */
const InstructionsScreen = ({ studentName, test, canResume, onContinue }) => (
  <div className={styles.screen}>
    <h1 className={styles.heading}>
      {studentName ? `Welcome, ${studentName}.` : 'Welcome.'}
    </h1>
    <p className={styles.intro}>
      Read these before you start — the test does not pause once it begins.
    </p>

    <ul className={styles.rulesList}>
      {buildRules(test).map((rule) => {
        const RuleIcon = rule.icon;
        return (
          <li key={rule.text} className={styles.ruleItem}>
            <span className={styles.ruleIcon}>
              <RuleIcon size={20} />
            </span>
            <span>{rule.text}</span>
          </li>
        );
      })}
    </ul>

    {canResume && (
      <p className={styles.resumeNote}>
        You have an attempt already in progress. Resuming takes you straight back
        to your next unanswered question.
      </p>
    )}

    <button type="button" className={styles.primaryBtn} onClick={onContinue}>
      {canResume ? 'Resume test' : 'I understand — continue'}
      <IconChevronRight size={20} />
    </button>
  </div>
);

/**
 * Screen 3 — the gate. `Start Test` stays disabled until the box is ticked.
 */
const TermsScreen = ({ accepted, onAcceptedChange, onStart, onBack }) => (
  <div className={styles.screen}>
    <h1 className={styles.heading}>Terms &amp; Conditions</h1>
    <p className={styles.intro}>
      Please read these before starting the {PROGRAM_NAME} test.
    </p>

    <div className={styles.termsBox} tabIndex={0}>
      {TERMS.map((term, index) => (
        <div key={term.title} className={styles.termItem}>
          <h2 className={styles.termTitle}>
            {index + 1}. {term.title}
          </h2>
          <p className={styles.termBody}>{term.body}</p>
        </div>
      ))}
    </div>

    <CheckboxField
      id="test-tnc"
      label="I have read and accept the Terms & Conditions"
      checked={accepted}
      onChange={onAcceptedChange}
    />

    <button
      type="button"
      className={styles.primaryBtn}
      onClick={onStart}
      disabled={!accepted}
    >
      Start Test
      <IconChevronRight size={20} />
    </button>

    <button type="button" className={styles.secondaryBtn} onClick={onBack}>
      Back to instructions
    </button>
  </div>
);

/**
 * Screen 4 — where the engine mounts. Prompt 08 replaces this component with
 * the real one; it already receives everything that `action=start` consumes:
 * the handoff ({ key, tnc_accepted }) and, for a resumed attempt, the index of
 * the first unanswered question.
 */
const TestEnginePlaceholder = ({ handoff, questionIndex }) => (
  <div className={styles.screen}>
    <h1 className={styles.heading}>You&apos;re all set.</h1>
    <p className={styles.intro}>The test engine arrives in the next update.</p>
    <div className={styles.placeholderBox}>
      <span className={styles.placeholderIcon}>
        <IconCheck size={20} />
      </span>
      <span>
        Signed in with <strong>{formatKey(maskKeyBody(handoff.key))}</strong>
        {handoff.tnc_accepted ? ' · terms accepted' : ''}
        {questionIndex > 0 ? ` · resuming at question ${questionIndex + 1}` : ''}
      </span>
    </div>
  </div>
);

/**
 * Screen 5 — a key that has already been used. Prompt 09 turns this into the
 * counselling-slot booking; until then it says plainly what happens next.
 */
const CompletedScreen = ({ studentName, completedAt, slotBooked }) => (
  <div className={styles.screen}>
    <h1 className={styles.heading}>
      {studentName ? `${studentName}, your test is done.` : 'Your test is done.'}
    </h1>
    <p className={styles.intro}>
      This key has already been used for its one attempt
      {completedAt ? ` (submitted ${completedAt})` : ''}. Your answers are with
      CIT&apos;s admission team.
    </p>
    <div className={styles.placeholderBox}>
      <span className={styles.placeholderIcon}>
        <IconCheck size={20} />
      </span>
      <span>
        {slotBooked
          ? 'Your counselling slot is booked — our team will call you to confirm.'
          : 'Slot booking arrives in the next update. Until then, our admission team will call you with your result and the next step.'}
      </span>
    </div>
    <a
      className={styles.primaryBtn}
      href={SUPPORT_PHONE_HREF}
      onClick={() => trackContactClick('phone', 'test_completed')}
    >
      Call {SUPPORT_PHONE}
    </a>
  </div>
);

// ============================================
// Page
// ============================================

const Test = () => {
  const [screen, setScreen] = useState('login');
  const [keyBody, setKeyBody] = useState(readStoredKeyBody);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorKind, setErrorKind] = useState('');
  const [session, setSession] = useState(null);
  const [tncAccepted, setTncAccepted] = useState(false);
  // What prompt 08's `action=start` consumes, set the moment the applicant
  // commits: { key, tnc_accepted }.
  const [handoff, setHandoff] = useState(null);

  const keyInputRef = useRef(null);
  const instructionsTrackedRef = useRef(false);

  // ---- Page chrome -------------------------------------------------------
  useEffect(() => {
    updatePageSEO({
      title: '30-Minute Online Merit Assessment Test | CIT Tumakuru',
      robots: 'noindex, nofollow',
    });

    return () => {
      // The SEOHead singleton has no /test branch and never clears robots, so
      // restore the site default when leaving instead of leaving the SPA
      // noindexed for the rest of the session.
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow');
    };
  }, []);

  useEffect(() => {
    // Scopes off responsive.css's mobile-nav bottom padding — there is no
    // bottom nav on this route, so the reserved strip is just dead space.
    document.body.classList.add('test-page');
    return () => document.body.classList.remove('test-page');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // Instructions are the first screen an identified applicant sees — track the
  // view once per session, not once per bounce between screens.
  useEffect(() => {
    if (screen !== 'instructions' || instructionsTrackedRef.current) return;
    instructionsTrackedRef.current = true;
    trackApplicationStep('merit_test_instructions_view', {
      test_state: session ? session.state : '',
    });
  }, [screen, session]);

  // ---- Login -------------------------------------------------------------
  const handleKeyChange = (value) => {
    setKeyBody(value);
    if (errorKind) setErrorKind('');
  };

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      const key = formatKey(keyBody);
      if (!key) {
        setErrorKind('invalid_key');
        if (keyInputRef.current) keyInputRef.current.focus();
        return;
      }

      setErrorKind('');
      setIsSubmitting(true);

      let data = null;
      try {
        const response = await fetch(`${TEST_API_URL}?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
        if (!response.ok) throw new Error(`login returned ${response.status}`);
        data = await response.json();
      } catch (error) {
        // Offline, dropped connection, or a server that never answered —
        // said plainly rather than blamed on the applicant's key.
        console.error('[TestAPI] login failed:', error);
        setIsSubmitting(false);
        setErrorKind('network');
        return;
      }

      setIsSubmitting(false);

      if (!data || data.success !== true) {
        // test.php answers one generic error for a malformed key, an unknown
        // key and a rate-limited request alike.
        setErrorKind('invalid_key');
        if (keyInputRef.current) keyInputRef.current.focus();
        return;
      }

      const nextSession = {
        key,
        student_name: data.student_name || '',
        state: data.state || 'not_started',
        question_index: Number(data.question_index) || 0,
        completed_at: data.completed_at || '',
        slot_booked: !!data.slot_booked,
        test: data.test || DEFAULT_TEST,
      };
      setSession(nextSession);

      // No PII and never the key itself — only which screen the applicant landed
      // on, which is all the funnel needs.
      trackApplicationStep('merit_test_login', {
        test_state: nextSession.state,
      });

      if (nextSession.state === 'completed') {
        setScreen('completed');
        return;
      }
      setScreen('instructions');
    },
    [isSubmitting, keyBody]
  );

  // ---- Navigation --------------------------------------------------------
  const handleInstructionsContinue = () => {
    if (!session) return;
    // A resumed attempt already accepted the terms on its first run — sending
    // the applicant back through the gate would cost them timer seconds.
    if (session.state === 'in_progress') {
      setHandoff({ key: session.key, tnc_accepted: true });
      setScreen('engine');
      return;
    }
    setScreen('tnc');
  };

  const handleStartTest = () => {
    if (!session || !tncAccepted) return;
    setHandoff({ key: session.key, tnc_accepted: true });
    setScreen('engine');
  };

  const firstName = session ? (session.student_name || '').trim().split(' ')[0] : '';

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        {/* Short alt on purpose: if the CDN image fails, a long alt string
            wraps and pushes the whole top bar down. */}
        <img
          className={styles.logo}
          src={LOGO_URL}
          alt="CIT Tumakuru"
          width="120"
          height="36"
        />
        <span className={styles.programName}>{PROGRAM_NAME}</span>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          {/* Only the active screen is mounted — no hidden DOM to lay out. */}
          {screen === 'login' && (
            <LoginScreen
              keyBody={keyBody}
              onKeyChange={handleKeyChange}
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
              errorKind={errorKind}
              inputRef={keyInputRef}
            />
          )}

          {screen === 'instructions' && session && (
            <InstructionsScreen
              studentName={firstName}
              test={session.test}
              canResume={session.state === 'in_progress'}
              onContinue={handleInstructionsContinue}
            />
          )}

          {screen === 'tnc' && (
            <TermsScreen
              accepted={tncAccepted}
              onAcceptedChange={setTncAccepted}
              onStart={handleStartTest}
              onBack={() => setScreen('instructions')}
            />
          )}

          {screen === 'engine' && handoff && (
            <TestEnginePlaceholder
              handoff={handoff}
              questionIndex={session ? session.question_index : 0}
            />
          )}

          {screen === 'completed' && session && (
            <CompletedScreen
              studentName={firstName}
              completedAt={formatCompletedAt(session.completed_at)}
              slotBooked={session.slot_booked}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Test;
