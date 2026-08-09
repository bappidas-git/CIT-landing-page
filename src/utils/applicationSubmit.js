/* ============================================
   Application Submission Utility
   Payload builder + submit plumbing for the
   multi-step application form at /apply.

   Two submits ride on ONE lead:
     1. submitPartialApplication() — fired the
        moment Step 1 is completed, so a lead that
        abandons mid-form is still recoverable by
        the tele-calling team (lead_tier 'partial').
     2. submitFullApplication()    — fired on final
        submit with the same lead_id, upgrading the
        stored lead to lead_tier 'application'.

   Both POST to the same `?action=create` endpoint;
   leads.php upserts by lead_id, so re-posts merge
   into the existing lead instead of duplicating it.

   Additive — src/utils/webhookSubmit.js is
   untouched and still owns the enquiry drawer.
   ============================================ */

import { getStoredGclid } from './gclidManager';
import { getAttribution } from './attribution';
import { trackFormSubmission, trackApplicationStep } from './gtm';
import { trackLead as trackMetaLead, trackSubmitApplication } from './metaPixel';
import { sendLeadEvent, sendSubmitApplicationEvent } from './metaCAPI';
import { generateEventId } from './eventDedup';
import { trackFormSubmission as trackGoogleAdsFormSubmission } from './googleAds';
import { sendEnhancedConversionData } from './enhancedConversions';
import { computeEligibility } from './applicationValidators';

// =============================================
// CONFIGURATION
// Same shared server-side lead store the enquiry form writes to — it is the
// single source of truth the admin panel reads from.
// =============================================
const LEADS_API_URL = process.env.REACT_APP_LEADS_API_URL || '/api/leads.php';

/** sessionStorage key holding the in-progress application draft. */
export const APPLY_DRAFT_KEY = 'cit_apply_draft';

/** sessionStorage key holding the CTA that sent the visitor to /apply. */
export const APPLY_SOURCE_KEY = 'cit_apply_source';

/** localStorage key holding submits that failed on a flaky connection. */
export const APPLY_RETRY_KEY = 'cit_apply_retry';

/** Phone number surfaced when a submit cannot reach the server. */
export const SUPPORT_PHONE = '+91 8069645014';

/**
 * Generate a UUID v4 for the lead_id shared by the partial and full submits.
 * @returns {string} UUID v4
 */
export const generateLeadId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Resolve the base `source` value for this application.
 * Prompt-04 CTAs stash their key in sessionStorage before navigating here;
 * a direct visit (ad link straight to /apply) falls back to 'apply-direct'.
 * @returns {string} Source base without the step suffix
 */
const getSourceBase = () => {
  try {
    const stored = sessionStorage.getItem(APPLY_SOURCE_KEY);
    if (stored && stored.trim()) return stored.trim();
  } catch (error) {
    // sessionStorage unavailable (private mode) — fall through to the default
  }
  return 'apply-direct';
};

/**
 * Metadata + attribution shared by the partial and the full payload.
 * UTMs and gclid use the same lookup as webhookSubmit.js (live URL params
 * first), extended with the first-touch values persisted by attribution.js so
 * a visitor who lands on `/` with UTMs and only then navigates to /apply keeps
 * their attribution. fbclid/fbp/fbc come from getAttribution() for Meta.
 * @param {Object} draft - Current application draft
 * @returns {Object} Common payload fields
 */
const buildCommonFields = (draft) => {
  const params = new URLSearchParams(window.location.search);
  const attribution = getAttribution();
  const pick = (key) => params.get(key) || attribution[key] || '';

  return {
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_term: pick('utm_term'),
    utm_content: pick('utm_content'),
    gclid: params.get('gclid') || getStoredGclid() || '',
    fbclid: attribution.fbclid,
    fbp: attribution.fbp,
    fbc: attribution.fbc,
    form_started_at: draft.form_started_at || '',
    // Honeypot — the hidden `website` input is empty for humans. leads.php
    // reads it before the field whitelist strips it, so it is never stored.
    website: draft.website || '',
  };
};

/**
 * Normalize the subject/marks rows into the stored schema shape.
 * @param {Array<{subject: string, marks: string|number}>} subjects
 * @returns {Array<{subject: string, marks: number}>} Rows with numeric marks
 */
const buildSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return [];
  return subjects
    .filter((row) => row && row.subject && String(row.marks).trim() !== '')
    .map((row) => ({ subject: row.subject, marks: Number(row.marks) }))
    .filter((row) => Number.isFinite(row.marks));
};

/**
 * POST a lead payload to the shared server-side store.
 * @param {Object} payload - Whitelisted lead payload
 * @returns {Promise<{success: boolean, message?: string}>}
 */
const postLead = async (payload) => {
  if (!LEADS_API_URL) {
    console.error('[ApplyAPI] No lead endpoint configured');
    return {
      success: false,
      message: `Submissions aren't configured yet. Please call us at ${SUPPORT_PHONE}.`,
    };
  }

  try {
    const response = await fetch(`${LEADS_API_URL}?action=create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead: payload }),
      keepalive: true,
    });

    if (response.ok) {
      return { success: true };
    }

    console.error('[ApplyAPI] create returned', response.status);
    return {
      success: false,
      message: `We couldn't submit your application right now. Please retry, or call us at ${SUPPORT_PHONE}.`,
    };
  } catch (error) {
    // Network-level failure (offline, dropped connection). Surfaced honestly
    // so the applicant can retry — the draft is still intact.
    console.error('[ApplyAPI] create failed:', error);
    return {
      success: false,
      message: `Network error. Check your connection and retry, or call us at ${SUPPORT_PHONE}.`,
    };
  }
};

// =============================================
// RETRY QUEUE
// A completed application must never be lost to a dropped Jio connection:
// failed submits are parked in localStorage and flushed on the next app load.
// =============================================

const readRetryQueue = () => {
  try {
    const raw = localStorage.getItem(APPLY_RETRY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeRetryQueue = (queue) => {
  try {
    if (!queue.length) {
      localStorage.removeItem(APPLY_RETRY_KEY);
      return;
    }
    localStorage.setItem(APPLY_RETRY_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[ApplyAPI] Could not persist the retry queue:', error);
  }
};

/**
 * Park a failed payload for a later flush, replacing any earlier attempt for
 * the same lead so the queue holds at most one entry per application.
 * @param {Object} payload - The payload that failed to send
 */
const queueForRetry = (payload) => {
  const queue = readRetryQueue().filter(
    (item) => item && item.lead_id !== payload.lead_id
  );
  queue.push(payload);
  writeRetryQueue(queue);
};

/**
 * Drop a lead's parked payload — called once its submit finally succeeds.
 * @param {string} leadId - lead_id to remove from the queue
 */
const dequeueRetry = (leadId) => {
  const queue = readRetryQueue();
  const remaining = queue.filter((item) => item && item.lead_id !== leadId);
  if (remaining.length !== queue.length) writeRetryQueue(remaining);
};

/**
 * Flush any application payloads parked by a failed submit. Registered in
 * App.jsx next to captureAttribution() so it runs once per app load.
 * @returns {Promise<void>}
 */
export const flushApplicationRetryQueue = async () => {
  const queue = readRetryQueue();
  if (!queue.length) return;

  const remaining = [];
  for (let i = 0; i < queue.length; i += 1) {
    const payload = queue[i];
    // Sequential on purpose — a recovering connection should not be hit with
    // a burst, and the per-IP rate limit on leads.php counts every create.
    // eslint-disable-next-line no-await-in-loop
    const result = await postLead(payload);
    if (!result.success) remaining.push(payload);
  }
  writeRetryQueue(remaining);
};

// =============================================
// SUBMITS
// =============================================

/**
 * Submit the Step-1 partial lead (fire-and-forget — never block the UI on it).
 * Carries only the Step-1 answers plus metadata; the same lead_id is reused by
 * submitFullApplication(), which upgrades this record in place.
 *
 * Also fires the plain Meta `Lead` pixel/CAPI pair. `SubmitApplication` is
 * deliberately NOT fired here — it is reserved for full completion, which is
 * what Meta optimization will later be switched to.
 *
 * @param {Object} draft - Current application draft
 * @returns {Object} The payload that was sent (useful for tests/debugging)
 */
export const submitPartialApplication = (draft) => {
  const now = new Date().toISOString();
  const source = `${getSourceBase()}/step1-partial`;
  const name = (draft.name || '').trim();
  const mobile = (draft.mobile || '').trim();

  const payload = {
    ...buildCommonFields(draft),
    lead_id: draft.lead_id,
    name,
    mobile,
    whatsapp_confirmed: !!draft.whatsapp_confirmed,
    service_interest: draft.service_interest || '',
    intake_year: draft.intake_year || '',
    lead_tier: 'partial',
    status: 'new',
    source,
    submitted_at: now,
    updated_at: now,
    notes: [],
    activity: [
      {
        action: 'Application started (Step 1)',
        status: 'new',
        timestamp: now,
      },
    ],
  };

  // Fire-and-forget: the applicant moves to Step 2 immediately.
  postLead(payload).catch((error) => {
    console.error('[ApplyAPI] Partial submit failed:', error);
  });

  // Meta partial signal — plain Lead only, pixel + CAPI sharing one event_id.
  const leadEventId = generateEventId();
  trackMetaLead({
    event_id: leadEventId,
    content_name: 'apply-step1-partial',
    content_category: 'lead_generation',
  });
  sendLeadEvent({
    name,
    email: '',
    mobile,
    event_id: leadEventId,
    source,
  }).catch((error) => {
    console.error('[MetaCAPI] Partial Lead event failed:', error);
  });

  return payload;
};

/**
 * Build the complete application payload from a finished draft.
 * @param {Object} draft - Completed application draft
 * @param {string} now - ISO timestamp for this submit
 * @returns {Object} Full lead payload
 */
const buildFullPayload = (draft, now) => {
  const isDiploma = draft.twelfth_status === 'diploma';
  // Marks only belong to a passed 12th. An applicant who typed marks and then
  // switched to "appearing" or "diploma" must not ship the abandoned rows —
  // diploma stores [] and appearing stores an expected_band instead.
  const subjects =
    draft.twelfth_status === 'passed'
      ? buildSubjects(draft.twelfth_subjects)
      : [];
  const eligibility = computeEligibility(subjects);

  const payload = {
    ...buildCommonFields(draft),
    lead_id: draft.lead_id,

    // Identity (Step 1)
    name: (draft.name || '').trim(),
    mobile: (draft.mobile || '').trim(),
    whatsapp_confirmed: !!draft.whatsapp_confirmed,
    service_interest: draft.service_interest || '',
    intake_year: draft.intake_year || '',

    // Academics (Step 2)
    twelfth_status: draft.twelfth_status || '',
    twelfth_board: isDiploma ? '' : draft.twelfth_board || '',
    twelfth_school: isDiploma ? '' : (draft.twelfth_school || '').trim(),
    twelfth_subjects: subjects,
    expected_band:
      draft.twelfth_status === 'appearing_2026' ? draft.expected_band || '' : '',
    tenth_school: (draft.tenth_school || '').trim(),
    tenth_year: Number(draft.tenth_year),
    tenth_percent: Number(draft.tenth_percent),

    // Family & funding (Step 3)
    filled_by: draft.filled_by || '',
    parent_name: (draft.parent_name || '').trim(),
    parent_mobile: (draft.parent_mobile || '').trim(),
    funding_plan: draft.funding_plan || '',

    // Logistics (Step 4)
    state: draft.state || '',
    district: (draft.district || '').trim(),
    counselling_mode: draft.counselling_mode || '',
    admission_timeline: draft.admission_timeline || '',
    best_time: draft.best_time || '',
    email: (draft.email || '').trim(),
    message: (draft.message || '').trim(),

    // Fees & branch choice (Step 5)
    fee_affordability: draft.fee_affordability || '',
    branch_pref_1: draft.branch_pref_1 || '',
    branch_pref_2: draft.branch_pref_2 || '',

    // Bookkeeping
    lead_tier: 'application',
    status: 'new',
    source: `${getSourceBase()}/full`,
    submitted_at: now,
    updated_at: now,
    application_completed_at: now,
    notes: [],
    activity: [
      {
        action: 'Application submitted (all steps completed)',
        status: 'new',
        timestamp: now,
      },
    ],
  };

  // Eligibility is only meaningful for applicants who entered 12th marks.
  if (eligibility) {
    payload.eligibility_percent = eligibility.percent;
    payload.eligibility_met = eligibility.met;
  }

  return payload;
};

/**
 * Fire every conversion signal for a completed application.
 * Failures here must never break the applicant's redirect to /thank-you.
 * @param {Object} payload - The full payload that was accepted by the server
 */
const trackFullApplication = (payload) => {
  // GTM — the shared lead_form_submission + generate_lead pair, plus the
  // intake-year dimension on the application-funnel event (trackFormSubmission
  // deliberately forwards only the course key).
  trackFormSubmission('apply-full', {
    serviceInterest: payload.service_interest,
  });
  trackApplicationStep('application_step_complete', {
    step: 5,
    step_name: 'fees_branches',
    intake_year: payload.intake_year,
  });

  // Meta — SubmitApplication pixel + CAPI sharing one event_id...
  const applicationEventId = generateEventId();
  trackSubmitApplication({
    event_id: applicationEventId,
    content_name: 'apply-full',
    content_category: 'application',
  });
  sendSubmitApplicationEvent({
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    event_id: applicationEventId,
    source: payload.source,
    service_interest: payload.service_interest,
    intake_year: payload.intake_year,
  }).catch((error) => {
    console.error('[MetaCAPI] SubmitApplication event failed:', error);
  });

  // ...and the plain Lead pair on its own event_id, because some ad sets are
  // still optimizing on Lead while the campaign migrates to SubmitApplication.
  const leadEventId = generateEventId();
  trackMetaLead({
    event_id: leadEventId,
    content_name: 'apply-full',
    content_category: 'lead_generation',
  });
  sendLeadEvent({
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    event_id: leadEventId,
    source: payload.source,
  }).catch((error) => {
    console.error('[MetaCAPI] Lead event failed:', error);
  });

  // Google Ads conversion + enhanced conversion data (hashed PII).
  trackGoogleAdsFormSubmission('apply-full');
  sendEnhancedConversionData(payload.email, payload.mobile, payload.name).catch(
    (error) => {
      console.error('[EnhancedConversions] Failed:', error);
    }
  );
};

/**
 * Submit the completed application. Upserts onto the same lead the Step-1
 * partial created, then fires every conversion signal.
 * @param {Object} draft - Completed application draft
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const submitFullApplication = async (draft) => {
  const now = new Date().toISOString();
  const payload = buildFullPayload(draft, now);

  const result = await postLead(payload);

  if (!result.success) {
    // Park it so the next app load re-sends it even if the applicant gives up.
    queueForRetry(payload);
    return result;
  }

  dequeueRetry(payload.lead_id);
  trackFullApplication(payload);

  // Gate + personalization for the Thank You page.
  try {
    sessionStorage.setItem('lead_submitted', 'true');
    sessionStorage.setItem('lead_name', payload.name);
  } catch (error) {
    // sessionStorage unavailable — the Thank You page will simply redirect home
  }

  return { success: true };
};

const applicationSubmit = {
  APPLY_DRAFT_KEY,
  APPLY_SOURCE_KEY,
  APPLY_RETRY_KEY,
  SUPPORT_PHONE,
  generateLeadId,
  submitPartialApplication,
  submitFullApplication,
  flushApplicationRetryQueue,
};

export default applicationSubmit;
