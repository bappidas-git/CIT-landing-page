/* ============================================
   /apply — Direct B.E. Admission Application
   Full-page, mobile-first, 5-step application
   form. Replaces the short enquiry drawer as the
   only lead-capture surface.

   Design constraints (budget Android on Jio):
   - Only the active step is mounted.
   - CSS-only step transition (opacity/transform).
     No framer-motion, no sweetalert2, no iconify.
   - The draft lives in sessionStorage, so a
     dropped connection or a discarded background
     tab never costs the applicant their answers.
   - Step 1 fires a partial lead: an abandoner is
     still a lead the tele-calling team can work.
   ============================================ */

import React, {
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import StepIdentity, { COURSE_OPTIONS } from './steps/StepIdentity';
import StepAcademics, {
  LOCKED_SUBJECTS,
  MAX_OPTIONAL_SUBJECTS,
} from './steps/StepAcademics';
import StepFamilyFinance from './steps/StepFamilyFinance';
import StepLogistics from './steps/StepLogistics';
import StepFeesBranches, {
  MERIT_BRANCH_COURSES,
} from './steps/StepFeesBranches';
import {
  IconAlert,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconLock,
} from './fields';

import { updatePageSEO } from '../../utils/seo';
import { trackApplicationStep } from '../../utils/gtm';
import { trackContactClick } from '../../utils/contactTracking';
import {
  APPLY_DRAFT_KEY,
  SUPPORT_PHONE,
  generateLeadId,
  submitFullApplication,
  submitPartialApplication,
} from '../../utils/applicationSubmit';
import {
  getMobileErrorMessage,
  getEmailErrorMessage,
} from '../../utils/validators';
import {
  getMarksError,
  getParentMobileError,
  getPercentError,
  getUnicodeNameError,
  getYearError,
} from '../../utils/applicationValidators';
import { APPLY_COURSE_KEY } from '../../hooks/useApplyCTA';

import styles from './Apply.module.css';

const LOGO_URL =
  'https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669113/logo-cit_ykpxvd.png';

const STEPS = [
  { id: 1, key: 'identity', label: "Let's get started" },
  { id: 2, key: 'academics', label: 'Academic Details' },
  { id: 3, key: 'family_finance', label: 'Family & Funding' },
  { id: 4, key: 'logistics', label: 'Where & when' },
  { id: 5, key: 'fees_branches', label: 'Fees & branch choice' },
];
const TOTAL_STEPS = STEPS.length;

const SUPPORT_PHONE_HREF = `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`;

// ============================================
// Draft state
// ============================================

const createInitialDraft = () => ({
  lead_id: generateLeadId(),
  // Stamped when Step 1 first renders — leads.php uses it as a time-trap.
  form_started_at: new Date().toISOString(),

  // Step 1
  name: '',
  mobile: '',
  whatsapp_confirmed: true,
  service_interest: '',
  intake_year: '',

  // Step 2
  twelfth_status: '',
  twelfth_board: '',
  twelfth_school: '',
  twelfth_subjects: LOCKED_SUBJECTS.map((subject) => ({ subject, marks: '' })),
  expected_band: '',
  tenth_school: '',
  tenth_year: '',
  tenth_percent: '',

  // Step 3
  filled_by: '',
  parent_name: '',
  parent_mobile: '',
  funding_plan: '',

  // Step 4
  state: '',
  district: '',
  counselling_mode: '',
  admission_timeline: '',
  best_time: '',
  email: '',
  message: '',

  // Step 5
  fee_affordability: '',
  branch_pref_1: '',
  branch_pref_2: '',

  // Honeypot — stays empty for humans.
  website: '',
});

/**
 * The branch a landing-page course card was tapped on, if any — someone who
 * chose CSE on the card should not have to choose it again here. Validated
 * against COURSE_OPTIONS so a stale or hand-edited value can never land in
 * `service_interest`. A pure read: the applicant can still change the branch,
 * and their own saved answer always wins over this hint.
 * @returns {string} Exact COURSE_OPTIONS string, or '' when absent/unknown
 */
const readPreselectedCourse = () => {
  try {
    const stored = sessionStorage.getItem(APPLY_COURSE_KEY);
    return stored && COURSE_OPTIONS.includes(stored) ? stored : '';
  } catch (error) {
    return '';
  }
};

/**
 * Rehydrate the draft saved by an earlier visit in this tab, falling back to a
 * fresh draft. Saved values are layered over the current defaults so a draft
 * written by an older build never arrives missing keys.
 */
const loadDraft = () => {
  const base = createInitialDraft();
  const preselectedCourse = readPreselectedCourse();
  if (preselectedCourse) base.service_interest = preselectedCourse;
  try {
    const raw = sessionStorage.getItem(APPLY_DRAFT_KEY);
    if (!raw) return base;

    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || !saved.lead_id) return base;

    const merged = { ...base, ...saved };
    // The lead_id and the start stamp must survive — the full submit upserts
    // onto whatever lead the Step-1 partial already created.
    merged.lead_id = saved.lead_id;
    merged.form_started_at = saved.form_started_at || base.form_started_at;

    if (
      !Array.isArray(merged.twelfth_subjects) ||
      merged.twelfth_subjects.length < LOCKED_SUBJECTS.length
    ) {
      merged.twelfth_subjects = base.twelfth_subjects;
    }
    // A saved draft that never got as far as picking a branch still takes the
    // course card's hint; one that did keeps the applicant's own answer.
    if (!merged.service_interest && preselectedCourse) {
      merged.service_interest = preselectedCourse;
    }
    return merged;
  } catch (error) {
    return base;
  }
};

const draftReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'SET_SUBJECT_MARKS':
      return {
        ...state,
        twelfth_subjects: state.twelfth_subjects.map((row, index) =>
          index === action.index ? { ...row, marks: action.value } : row
        ),
      };

    case 'ADD_SUBJECT': {
      const subjects = state.twelfth_subjects;
      if (subjects.some((row) => row.subject === action.subject)) return state;
      if (subjects.length - LOCKED_SUBJECTS.length >= MAX_OPTIONAL_SUBJECTS) {
        return state;
      }
      return {
        ...state,
        twelfth_subjects: [...subjects, { subject: action.subject, marks: '' }],
      };
    }

    case 'REMOVE_SUBJECT':
      if (action.index < LOCKED_SUBJECTS.length) return state;
      return {
        ...state,
        twelfth_subjects: state.twelfth_subjects.filter(
          (_, index) => index !== action.index
        ),
      };

    default:
      return state;
  }
};

// ============================================
// Per-step validation
// ============================================

/**
 * Validate one step of the draft.
 * @param {number} step - 1-based step index
 * @param {Object} draft - Current draft
 * @returns {Object} Map of field → error message (empty when the step is valid)
 */
const validateStep = (step, draft) => {
  const errors = {};

  if (step === 1) {
    const nameError = getUnicodeNameError(draft.name);
    if (nameError) errors.name = nameError;

    const mobileError = getMobileErrorMessage(draft.mobile);
    if (mobileError) errors.mobile = mobileError;

    if (!draft.service_interest) {
      errors.service_interest = 'Please choose your preferred B.E. branch';
    }
    if (!draft.intake_year) {
      errors.intake_year = 'Please tell us which intake you are planning for';
    }
  }

  if (step === 2) {
    if (!draft.twelfth_status) {
      errors.twelfth_status = 'Please select your 12th status';
    }

    // Diploma applicants join via lateral entry — no 12th board, school or
    // marks are collected here (the README schema notes this exception).
    if (draft.twelfth_status && draft.twelfth_status !== 'diploma') {
      if (!draft.twelfth_board) {
        errors.twelfth_board = 'Please select your 12th board';
      }
      const school = (draft.twelfth_school || '').trim();
      if (!school) {
        errors.twelfth_school = 'Please enter your school/college name';
      } else if (school.length > 120) {
        errors.twelfth_school = 'Please keep this under 120 characters';
      }
    }

    if (draft.twelfth_status === 'passed') {
      const subjects = draft.twelfth_subjects || [];
      const extras = subjects.length - LOCKED_SUBJECTS.length;
      if (extras < 1) {
        errors.twelfth_subjects =
          'Add at least one more subject besides Physics and Mathematics';
      } else if (subjects.some((row) => getMarksError(row.marks))) {
        errors.twelfth_subjects = 'Enter marks out of 100 for every subject';
      }
    }

    if (draft.twelfth_status === 'appearing_2026' && !draft.expected_band) {
      errors.expected_band = 'Please select the result you expect';
    }

    const tenthSchool = (draft.tenth_school || '').trim();
    if (!tenthSchool) {
      errors.tenth_school = 'Please enter your 10th school name';
    } else if (tenthSchool.length > 120) {
      errors.tenth_school = 'Please keep this under 120 characters';
    }

    const yearError = getYearError(draft.tenth_year);
    if (yearError) errors.tenth_year = yearError;

    const percentError = getPercentError(draft.tenth_percent);
    if (percentError) errors.tenth_percent = percentError;
  }

  if (step === 3) {
    if (!draft.filled_by) {
      errors.filled_by = 'Please tell us who is filling this form';
    }

    const parentNameError = getUnicodeNameError(draft.parent_name);
    if (parentNameError) errors.parent_name = parentNameError;

    const parentMobileError = getParentMobileError(
      draft.parent_mobile,
      draft.mobile
    );
    if (parentMobileError) errors.parent_mobile = parentMobileError;

    if (!draft.funding_plan) {
      errors.funding_plan = 'Please choose the option closest to your plan';
    }
  }

  if (step === 4) {
    if (!draft.state) errors.state = 'Please select your home state';

    const district = (draft.district || '').trim();
    if (!district) {
      errors.district = 'Please enter your district or town';
    } else if (district.length > 60) {
      errors.district = 'Please keep this under 60 characters';
    }

    if (!draft.counselling_mode) {
      errors.counselling_mode = 'Please choose how we should counsel you';
    }
    if (!draft.admission_timeline) {
      errors.admission_timeline = 'Please choose your admission timeline';
    }

    // email / best_time / message are the only optional fields on the form.
    if ((draft.email || '').trim()) {
      const emailError = getEmailErrorMessage(draft.email);
      if (emailError) errors.email = emailError;
    }
    if ((draft.message || '').length > 500) {
      errors.message = 'Please keep your question under 500 characters';
    }
  }

  if (step === 5) {
    if (!draft.fee_affordability) {
      errors.fee_affordability =
        'Please answer honestly — this helps us guide you right';
    }

    // Both preferences share one error key: the picker is a single control, and
    // splitting the message across two slots would read as two separate faults.
    const isBranch = (value) => MERIT_BRANCH_COURSES.includes(value);
    if (!isBranch(draft.branch_pref_1) || !isBranch(draft.branch_pref_2)) {
      errors.branch_pref_1 =
        'Please pick exactly two branches, in order of preference';
    } else if (draft.branch_pref_1 === draft.branch_pref_2) {
      errors.branch_pref_1 = 'Please pick two different branches';
    }
  }

  return errors;
};

// ============================================
// Page
// ============================================

const Apply = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [draft, dispatch] = useReducer(draftReducer, undefined, loadDraft);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const contentRef = useRef(null);
  // Steps the applicant has already tried to leave — gates blur validation so
  // errors never appear before the first Next.
  const attemptedRef = useRef({});
  // Whether the CURRENT step has typed-but-unadvanced input (drives the
  // leave-confirmation on the close button).
  const dirtyRef = useRef(false);
  // Signature of the Step-1 answers last sent as a partial, so going back and
  // forward without changing anything does not re-post.
  const partialSignatureRef = useRef('');
  const didMountRef = useRef(false);

  const rawStep = parseInt(searchParams.get('step'), 10);
  const step =
    Number.isFinite(rawStep) && rawStep >= 1 && rawStep <= TOTAL_STEPS
      ? rawStep
      : 1;
  const stepConfig = STEPS[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  // History depth we created ourselves — lets the in-page Back button reuse a
  // real history entry (so the browser's own Back keeps working) and fall back
  // to a URL replace when the applicant deep-linked or refreshed into a step.
  const depth = (location.state && location.state.applyDepth) || 0;

  // ---- Page chrome -------------------------------------------------------
  useEffect(() => {
    updatePageSEO({
      title: 'Apply — CIT Merit-Based Selection Program 2026 | CIT Tumakuru',
      robots: 'noindex, nofollow',
    });

    return () => {
      // The SEOHead singleton has no /apply branch and never clears robots, so
      // restore the site default when leaving instead of leaving the SPA
      // noindexed for the rest of the session.
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow');
    };
  }, []);

  useEffect(() => {
    // Scopes off responsive.css's mobile-nav bottom padding — there is no
    // bottom nav on this route, and the sticky footer needs the space.
    document.body.classList.add('apply-page');
    return () => document.body.classList.remove('apply-page');
  }, []);

  // ---- Draft persistence -------------------------------------------------
  useEffect(() => {
    try {
      sessionStorage.setItem(APPLY_DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      // Private mode / quota — the form still works, just without a draft.
    }
  }, [draft]);

  // ---- Step lifecycle ----------------------------------------------------
  useEffect(() => {
    trackApplicationStep('application_step_view', {
      step,
      step_name: stepConfig.key,
    });
    dirtyRef.current = false;
    window.scrollTo(0, 0);
  }, [step, stepConfig.key]);

  // Deep-linking into a later step with an empty draft would show a form the
  // applicant cannot submit — clamp to the first step that is not yet valid.
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;
    if (step === 1) return;

    let allowed = 1;
    for (let previous = 1; previous < step; previous += 1) {
      if (Object.keys(validateStep(previous, draft)).length > 0) break;
      allowed = previous + 1;
    }
    if (allowed !== step) {
      setSearchParams(allowed > 1 ? { step: String(allowed) } : {}, {
        replace: true,
        state: { applyDepth: 0 },
      });
    }
    // Runs once, on mount, against the rehydrated draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Field handlers ----------------------------------------------------
  const clearError = (field) =>
    setErrors((previous) =>
      previous[field] ? { ...previous, [field]: '' } : previous
    );

  const setField = (field, value) => {
    dirtyRef.current = true;
    dispatch({ type: 'SET_FIELD', field, value });
    clearError(field);
  };

  const handleBlurField = (field) => {
    if (!attemptedRef.current[step]) return;
    const stepErrors = validateStep(step, draft);
    setErrors((previous) => ({ ...previous, [field]: stepErrors[field] || '' }));
  };

  const handleSubjectMarksChange = (index, value) => {
    dirtyRef.current = true;
    dispatch({ type: 'SET_SUBJECT_MARKS', index, value });
    clearError('twelfth_subjects');
  };

  const handleAddSubject = (subject) => {
    dirtyRef.current = true;
    dispatch({ type: 'ADD_SUBJECT', subject });
    clearError('twelfth_subjects');
  };

  const handleRemoveSubject = (index) => {
    dirtyRef.current = true;
    dispatch({ type: 'REMOVE_SUBJECT', index });
    clearError('twelfth_subjects');
  };

  // ---- Navigation --------------------------------------------------------
  const focusFirstError = () => {
    window.requestAnimationFrame(() => {
      const host = contentRef.current;
      if (!host) return;
      const target = host.querySelector('[data-invalid="true"]');
      if (!target) return;
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const focusable = target.querySelector('input, select, textarea, button');
      if (focusable) focusable.focus({ preventScroll: true });
    });
  };

  const handleClose = () => {
    if (
      dirtyRef.current &&
      // eslint-disable-next-line no-alert
      !window.confirm('Your progress is saved — leave the application?')
    ) {
      return;
    }
    navigate('/');
  };

  const handleBack = () => {
    if (step <= 1) {
      handleClose();
      return;
    }
    if (depth > 0) {
      navigate(-1);
      return;
    }
    setSearchParams({ step: String(step - 1) }, {
      replace: true,
      state: { applyDepth: 0 },
    });
  };

  const sendPartialLead = () => {
    const signature = [
      draft.name,
      draft.mobile,
      draft.service_interest,
      draft.intake_year,
      draft.whatsapp_confirmed,
    ].join('|');
    if (partialSignatureRef.current === signature) return;
    partialSignatureRef.current = signature;
    // Fire-and-forget on purpose — Step 2 must render immediately.
    submitPartialApplication(draft);
  };

  const sendFullApplication = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    const result = await submitFullApplication(draft);
    if (!result.success) {
      setIsSubmitting(false);
      setSubmitError(result.message);
      return;
    }
    try {
      sessionStorage.removeItem(APPLY_DRAFT_KEY);
    } catch (error) {
      // Nothing to clean up if storage is unavailable.
    }
    navigate('/thank-you');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    attemptedRef.current[step] = true;
    const stepErrors = validateStep(step, draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      focusFirstError();
      return;
    }

    if (step === 1) sendPartialLead();

    if (!isLastStep) {
      trackApplicationStep('application_step_complete', {
        step,
        step_name: stepConfig.key,
        ...(step === 1 ? { intake_year: draft.intake_year } : {}),
      });
      setSearchParams({ step: String(step + 1) }, {
        state: { applyDepth: depth + 1 },
      });
      return;
    }

    // The last step's completion is tracked from applicationSubmit.js once the
    // server has actually accepted the application.
    sendFullApplication();
  };

  const stepProps = {
    draft,
    errors,
    setField,
    onBlurField: handleBlurField,
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topRow}>
          {/* Short alt on purpose: if the CDN image fails, a long alt string
              wraps and pushes the whole top bar down. */}
          <img
            className={styles.logo}
            src={LOGO_URL}
            alt="CIT Tumakuru"
            width="120"
            height="36"
          />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close the application"
          >
            <IconClose size={24} />
          </button>
        </div>
        <div className={styles.progressWrap}>
          <span className={styles.progressLabel}>
            Step {step} of {TOTAL_STEPS} — {stepConfig.label}
          </span>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-label="Application progress"
          >
            <div
              className={styles.progressBar}
              style={{ transform: `scaleX(${step / TOTAL_STEPS})` }}
            />
          </div>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <main className={styles.main} ref={contentRef}>
          <div className={styles.card}>
            {/* Only the active step is mounted — no hidden DOM to lay out. */}
            <div className={styles.stepHost} key={step}>
              {step === 1 && <StepIdentity {...stepProps} />}
              {step === 2 && (
                <StepAcademics
                  {...stepProps}
                  onAddSubject={handleAddSubject}
                  onRemoveSubject={handleRemoveSubject}
                  onSubjectMarksChange={handleSubjectMarksChange}
                />
              )}
              {step === 3 && <StepFamilyFinance {...stepProps} />}
              {step === 4 && <StepLogistics {...stepProps} />}
              {step === 5 && <StepFeesBranches {...stepProps} />}

              {submitError && (
                <div className={styles.errorBanner} role="alert">
                  <span className={styles.badgeIcon}>
                    <IconAlert size={18} />
                  </span>
                  <span>
                    {submitError}
                    <span className={styles.errorBannerActions}>
                      <button
                        type="button"
                        className={styles.retryBtn}
                        onClick={sendFullApplication}
                      >
                        Retry submission
                      </button>
                      <a
                        className={styles.callLink}
                        href={SUPPORT_PHONE_HREF}
                        onClick={() =>
                          trackContactClick('phone', 'apply_submit_error')
                        }
                      >
                        or call {SUPPORT_PHONE}
                      </a>
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Honeypot — hidden from humans; bots fill it and get tiered as spam. */}
          <input
            className={styles.honeypot}
            type="text"
            name="website"
            value={draft.website}
            onChange={(event) => setField('website', event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </main>

        <div className={styles.footer}>
          <div className={styles.footerInner}>
            {step > 1 && (
              <button
                type="button"
                // On the last step the Back label gives way to its chevron so
                // "Submit My 2026 Application" fits on one line at 360 px.
                className={`${styles.backBtn} ${
                  isLastStep ? styles.backBtnCompact : ''
                }`}
                onClick={handleBack}
                aria-label="Back to the previous step"
              >
                <IconChevronLeft size={20} />
                {!isLastStep && 'Back'}
              </button>
            )}
            <button
              type="submit"
              className={`${styles.nextBtn} ${
                isLastStep ? styles.submitBtn : ''
              }`}
              disabled={isSubmitting}
            >
              {isLastStep ? (
                isSubmitting ? (
                  'Submitting…'
                ) : (
                  'Submit My 2026 Application'
                )
              ) : (
                <>
                  Next
                  <IconChevronRight size={20} />
                </>
              )}
            </button>
          </div>
          <p className={styles.footerNote}>
            <IconLock size={12} />
            Your details go only to CIT&apos;s admission team.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Apply;
