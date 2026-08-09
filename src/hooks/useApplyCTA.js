/* ============================================
   useApplyCTA — the one CTA handler on the site

   Every "apply" surface now leads to the full
   application at /apply; the short enquiry drawer
   is no longer opened from anywhere.

   One tap does three things:
     1. pointerdown → warm the /apply chunk, so the
        page is already downloaded when the tap
        completes (budget Android on Jio).
     2. click → fire the existing `cta_click` GTM
        event, keeping the CTA source key
        ('apply-now', 'get-details', …) intact so
        campaign reporting stays continuous. Only
        the prefix changed: `drawer_<key>` became
        `apply_<key>` now that no drawer opens.
     3. stash that same key in sessionStorage, where
        applicationSubmit.js picks it up and writes
        it to the lead as `<key>/step1-partial` and
        `<key>/full`.
   ============================================ */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { preloadApply } from '../pages/Apply/preload';
import { trackCTAClick } from '../utils/gtm';
import { APPLY_SOURCE_KEY } from '../utils/applicationSubmit';

/**
 * sessionStorage key holding the B.E. branch a course card was tapped on, so
 * Step 1 of /apply can pre-select it. Read by src/pages/Apply/Apply.jsx.
 */
export const APPLY_COURSE_KEY = 'cit_apply_course';

/**
 * Default `cta_text` per source key — mirrors the drawer titles these CTAs
 * used to report, so the GTM event keeps the same shape.
 */
const CTA_TEXT = {
  'apply-now': 'Apply for 2026 Admission',
  'get-details': 'Get Admission Details',
  'request-callback': 'Request a Callback',
  default: 'Start My Application',
};

/**
 * Remember the branch a visitor tapped on a course card. Pass an empty value
 * to clear it — a generic CTA must not inherit an earlier card's branch.
 * @param {string} course - Exact COURSE_OPTIONS string (em-dash format)
 */
export const setApplyCourse = (course) => {
  try {
    if (course) {
      sessionStorage.setItem(APPLY_COURSE_KEY, course);
    } else {
      sessionStorage.removeItem(APPLY_COURSE_KEY);
    }
  } catch (error) {
    // sessionStorage unavailable (private mode) — the branch is simply not
    // pre-selected; the applicant picks it in Step 1.
  }
};

/**
 * Stash the CTA key that sent a visitor to /apply, so applicationSubmit.js can
 * write it onto the lead as `<key>/step1-partial` and `<key>/full`.
 *
 * Exported for the handful of CTAs that pre-date this hook and keep their own
 * `trackCTAClick` call (their GTM event names are already in use by live
 * campaign reporting, so they must not be re-shaped). Without this the lead
 * falls back to `apply-direct` and CTA-level attribution is lost.
 *
 * @param {string} source - CTA source key ('apply-now', 'get-details', …)
 */
export const setApplySource = (source) => {
  try {
    sessionStorage.setItem(APPLY_SOURCE_KEY, source);
  } catch (error) {
    // Private mode — applicationSubmit falls back to 'apply-direct'.
  }
};

/**
 * Build the handlers for a CTA that sends the visitor to the application form.
 *
 * @param {string} source - CTA source key: 'apply-now' | 'get-details' |
 *   'request-callback' | 'default'. Stored verbatim as the lead's source base.
 * @param {Object} [options]
 * @param {string} [options.location] - `cta_location` for the GTM event
 * @param {string} [options.label] - `cta_text` for the GTM event
 * @returns {{ onClick: Function, onPointerDown: Function }} Spreadable handlers
 */
const useApplyCTA = (source = 'default', options = {}) => {
  const { location = 'apply_cta', label } = options;
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    trackCTAClick(
      `apply_${source}`,
      location,
      label || CTA_TEXT[source] || CTA_TEXT.default
    );

    setApplySource(source);

    navigate('/apply');
  }, [source, location, label, navigate]);

  return useMemo(() => ({ onClick, onPointerDown: preloadApply }), [onClick]);
};

export default useApplyCTA;
