/* ============================================
   Lead Quality & Qualification — Admin Only
   ============================================
   The /apply application form asks a dozen qualification questions (intake
   year, marks, funding, timeline, parent contact). This module turns those
   raw fields into the two things a telecaller actually needs at a glance:

     1. TIER    — is this a completed application, an abandoned Step-1
                  partial, a legacy drawer enquiry, or server-flagged spam?
     2. QUALITY — how close is this lead to a 2026-ready, eligibility-met,
                  funding-clear applicant? A 0–100 score with a Hot / Warm /
                  Low band.

   The score is DERIVED ON READ and never stored on the lead. The public
   payload is client-supplied and can be forged, so a persisted score would be
   an attacker-controlled field; recomputing it in the admin keeps it honest
   and keeps it out of every sync/tracking path outside this panel.

   Shape of the chip configs (label / color / bg) follows leadStatus.js so the
   admin renders one visual language — but the status keys in leadStatus.js are
   frozen and this module deliberately does not touch them.
   ============================================ */

import {
  computeEligibility,
  getParentMobileError,
} from "../../utils/applicationValidators";

/* ============================================
   TIERS
   ============================================ */

// `lead_tier` is written by the application form ('partial' on the Step-1
// submit, 'application' on completion) and by leads.php ('spam' when a
// payload trips the honeypot / time-trap / suspicious-number checks).
// Legacy drawer leads predate the field entirely and read as 'enquiry'.
export const TIER_OPTIONS = [
  { value: "application", label: "Application", color: "#10B981", bg: "#ECFDF5" },
  { value: "partial", label: "Partial", color: "#B45309", bg: "#FEF3C7" },
  { value: "enquiry", label: "Enquiry", color: "#2B7BD5", bg: "#EBF5FF" },
  { value: "spam", label: "Spam", color: "#6B7280", bg: "#F3F4F6" },
];

const TIER_BY_VALUE = TIER_OPTIONS.reduce((acc, t) => {
  acc[t.value] = t;
  return acc;
}, {});

// Quick value -> label lookup (used by the CSV export/import round-trip).
export const TIER_LABELS = TIER_OPTIONS.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

/**
 * Resolve a lead's tier. Anything missing or unrecognised is a legacy enquiry
 * lead, so the admin never renders a raw/unknown tier key.
 * @param {Object} lead - Lead record
 * @returns {'application'|'partial'|'spam'|'enquiry'} Tier key
 */
export const getLeadTier = (lead) => {
  const tier = typeof lead?.lead_tier === "string" ? lead.lead_tier.trim() : "";
  return TIER_BY_VALUE[tier] ? tier : "enquiry";
};

/**
 * Resolve a tier key to its chip config (label/color/bg).
 * @param {string} tier - Tier key
 * @returns {{value: string, label: string, color: string, bg: string}} Config
 */
export const getTierConfig = (tier) => TIER_BY_VALUE[tier] || TIER_BY_VALUE.enquiry;

/**
 * True when the lead is an abandoned Step-1 submission — the telecaller can
 * still recover it by finishing the profile on the phone.
 * @param {Object} lead - Lead record
 * @returns {boolean} Whether the application was left incomplete
 */
export const isPartialLead = (lead) => getLeadTier(lead) === "partial";

/** Row/card hint shown against a partial lead in the list. */
export const PARTIAL_HINT = "Application incomplete — call to finish";

/** Banner shown on a partial lead's detail page. */
export const PARTIAL_BANNER =
  "Application incomplete — the student stopped at Step 1. Call and complete the profile together.";

/* ============================================
   QUALITY SCORE
   ============================================ */

// Points per answer. The maximum reachable total is exactly 100:
//   intake 30 + funding 25 + eligibility 20 (+5) + timeline 15 + parent 5.
const INTAKE_POINTS = { 2026: 30, 2027: 10, researching: 0 };
const FUNDING_POINTS = {
  self_funded: 25,
  education_loan: 25,
  scholarship: 10,
  need_discussion: 5,
};
const TIMELINE_POINTS = {
  two_weeks: 15,
  one_month: 10,
  after_results: 5,
  not_sure: 0,
};

const ELIGIBILITY_MET_POINTS = 20;
const ELIGIBILITY_STRONG_POINTS = 5;
const ELIGIBILITY_STRONG_FLOOR = 60;
const PARENT_CONTACT_POINTS = 5;

export const QUALITY_BANDS = [
  { value: "hot", label: "Hot", color: "#EF4444", bg: "#FEF2F2" },
  { value: "warm", label: "Warm", color: "#F59E0B", bg: "#FFF7ED" },
  { value: "low", label: "Low", color: "#6B7280", bg: "#F3F4F6" },
];

const BAND_BY_VALUE = QUALITY_BANDS.reduce((acc, b) => {
  acc[b.value] = b;
  return acc;
}, {});

/**
 * Resolve a band key to its chip config (label/color/bg).
 * @param {string} band - Band key
 * @returns {{value: string, label: string, color: string, bg: string}} Config
 */
export const getQualityConfig = (band) => BAND_BY_VALUE[band] || BAND_BY_VALUE.low;

/**
 * Score a lead 0–100 on how ready it is to convert, and band it.
 *
 * Only answered fields contribute, so a Step-1 partial is scored on what it
 * actually has (intake year, and a parent number if one was captured) instead
 * of being penalised for questions it never reached. A partial can never read
 * as Hot, though — the band is capped at Warm until the profile is finished.
 *
 * Derived on every read; never written back to the lead.
 *
 * @param {Object} lead - Lead record
 * @returns {{score: number, band: 'hot'|'warm'|'low', capped: boolean}} Score + band
 */
export const computeQualityScore = (lead) => {
  if (!lead) return { score: 0, band: "low", capped: false };

  let score = 0;

  // Intake year — the single strongest buying signal for a 2026 campaign.
  score += INTAKE_POINTS[lead.intake_year] || 0;

  // Funding clarity — a family that already knows how it will pay converts.
  score += FUNDING_POINTS[lead.funding_plan] || 0;

  // Academic eligibility, plus a bonus for a comfortable margin.
  if (lead.eligibility_met === true) score += ELIGIBILITY_MET_POINTS;
  const percent = Number(lead.eligibility_percent);
  if (Number.isFinite(percent) && percent >= ELIGIBILITY_STRONG_FLOOR) {
    score += ELIGIBILITY_STRONG_POINTS;
  }

  // How soon they want to decide.
  score += TIMELINE_POINTS[lead.admission_timeline] || 0;

  // A reachable second decision-maker (a real parent number, not a copy of
  // the student's) is worth points on its own.
  if (lead.parent_mobile && !getParentMobileError(lead.parent_mobile, lead.mobile)) {
    score += PARENT_CONTACT_POINTS;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let band = "low";
  if (score >= 70) band = "hot";
  else if (score >= 40) band = "warm";

  const capped = band === "hot" && isPartialLead(lead);
  if (capped) band = "warm";

  return { score, band, capped };
};

/* ============================================
   QUALIFICATION FIELD LABELS
   ============================================
   The stored values are machine keys (`self_funded`, `whatsapp_video`, …).
   Every admin surface — list columns, detail cards, CSV export — reads its
   human labels from here so the wording can never drift between them.
   ============================================ */

export const INTAKE_YEAR_LABELS = {
  2026: "2026",
  2027: "2027",
  researching: "Just researching",
};

export const FUNDING_PLAN_LABELS = {
  self_funded: "We can fund it ourselves",
  education_loan: "We'll need an education loan (CIT assists with bank loans)",
  scholarship: "Depends on scholarship support",
  need_discussion: "We need to discuss this with the counsellor",
};

// Compact variants for the list table, where a full sentence will not fit.
export const FUNDING_PLAN_SHORT_LABELS = {
  self_funded: "Self-funded",
  education_loan: "Education loan",
  scholarship: "Scholarship",
  need_discussion: "Needs discussion",
};

export const TWELFTH_STATUS_LABELS = {
  passed: "Passed 12th",
  appearing_2026: "Appearing in 2026",
  diploma: "Diploma (lateral entry)",
};

export const BOARD_LABELS = {
  AHSEC: "AHSEC (Assam)",
  NBSE: "NBSE (Nagaland)",
  MBOSE: "MBOSE (Meghalaya)",
  TBSE: "TBSE (Tripura)",
  COHSEM: "COHSEM (Manipur)",
  CBSE: "CBSE",
  ICSE: "ICSE / ISC",
  Other: "Other board",
};

export const EXPECTED_BAND_LABELS = {
  above_75: "Above 75%",
  "60_75": "60–75%",
  "45_60": "45–60%",
  below_45: "Below 45%",
};

export const FILLED_BY_LABELS = {
  student: "Student",
  parent: "Parent",
  guardian: "Guardian / Relative",
};

export const COUNSELLING_MODE_LABELS = {
  whatsapp_video: "WhatsApp video call",
  phone: "Phone call",
  campus_visit: "Can visit the campus",
  ne_rep: "Meet CIT's NE representative",
};

export const ADMISSION_TIMELINE_LABELS = {
  two_weeks: "Within 2 weeks",
  one_month: "Within a month",
  after_results: "After results",
  not_sure: "Not sure yet",
};

export const BEST_TIME_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

/**
 * Look a stored key up in a label map, falling back to the raw value so an
 * unmapped key is still visible rather than silently blank.
 * @param {Object} map - One of the *_LABELS maps above
 * @param {string} value - Stored key
 * @returns {string} Human label
 */
export const labelFor = (map, value) => {
  if (value === undefined || value === null || value === "") return "";
  return map[value] || String(value);
};

/* ============================================
   ELIGIBILITY SUMMARY
   ============================================ */

/** Reserved-category relaxation floor — same value the /apply badge uses. */
const RELAXATION_FLOOR = 40;

/**
 * Summarise a lead's 12th-marks aggregate using the same eligible / reserved /
 * review wording the applicant saw on the form badge, so the telecaller and
 * the applicant are reading the same verdict.
 *
 * Prefers the stored `eligibility_percent` / `eligibility_met` (computed at
 * submit time) and falls back to recomputing from the subject rows.
 *
 * @param {Object} lead - Lead record
 * @returns {{percent: number, met: boolean, tone: 'met'|'relaxation'|'review', message: string}|null}
 */
export const getEligibilitySummary = (lead) => {
  if (!lead) return null;

  let percent = Number(lead.eligibility_percent);
  let met =
    typeof lead.eligibility_met === "boolean" ? lead.eligibility_met : null;

  if (!Number.isFinite(percent)) {
    const computed = computeEligibility(lead.twelfth_subjects);
    if (!computed) return null;
    percent = computed.percent;
    if (met === null) met = computed.met;
  }
  if (met === null) met = percent >= 45;

  if (met) {
    return {
      percent,
      met,
      tone: "met",
      message: "Meets VTU B.E. eligibility (Physics + Maths + best other subject).",
    };
  }
  if (percent >= RELAXATION_FLOOR) {
    return {
      percent,
      met,
      tone: "relaxation",
      message:
        "May qualify under the reserved-category relaxation (40%) — confirm on the call.",
    };
  }
  return {
    percent,
    met,
    tone: "review",
    message: "The admission team will review the options on the call.",
  };
};

/* ============================================
   FIELD-PRESENCE TESTS
   ============================================
   Every new UI element is conditional: a legacy enquiry lead carries none of
   these fields and must render exactly as it did before this module existed.
   ============================================ */

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "" &&
  !(Array.isArray(value) && value.length === 0);

/**
 * True when the lead answered at least one of the questions the score reads.
 * A legacy drawer lead answered none of them, so it is shown as unscored ("—")
 * rather than being branded Low — it was never asked.
 * @param {Object} lead - Lead record
 * @returns {boolean} Whether a quality band should be shown for this lead
 */
export const hasQualitySignal = (lead) => {
  if (!lead) return false;
  if (typeof lead.eligibility_met === "boolean") return true;
  return [
    lead.intake_year,
    lead.funding_plan,
    lead.admission_timeline,
    lead.eligibility_percent,
    lead.parent_mobile,
  ].some(hasValue);
};

/**
 * True when the lead carries any 12th/10th academic answer.
 * @param {Object} lead - Lead record
 * @returns {boolean} Whether to render the Academic Details card
 */
export const hasAcademicDetails = (lead) =>
  !!lead &&
  [
    lead.twelfth_status,
    lead.twelfth_board,
    lead.twelfth_school,
    lead.twelfth_subjects,
    lead.expected_band,
    lead.eligibility_percent,
    lead.tenth_school,
    lead.tenth_year,
    lead.tenth_percent,
  ].some(hasValue);

/**
 * True when the lead carries any family/funding answer.
 * @param {Object} lead - Lead record
 * @returns {boolean} Whether to render the Family & Funding card
 */
export const hasFamilyFunding = (lead) =>
  !!lead &&
  (typeof lead.whatsapp_confirmed === "boolean" ||
    [lead.filled_by, lead.parent_name, lead.parent_mobile, lead.funding_plan].some(
      hasValue
    ));

/**
 * True when the lead carries any logistics answer. `state` is deliberately
 * excluded — legacy enquiry leads have it, and it already shows above.
 * @param {Object} lead - Lead record
 * @returns {boolean} Whether to render the Logistics card
 */
export const hasLogistics = (lead) =>
  !!lead &&
  [
    lead.district,
    lead.counselling_mode,
    lead.admission_timeline,
    lead.best_time,
    lead.intake_year,
  ].some(hasValue);

const leadQuality = {
  TIER_OPTIONS,
  QUALITY_BANDS,
  getLeadTier,
  getTierConfig,
  isPartialLead,
  computeQualityScore,
  getQualityConfig,
  getEligibilitySummary,
  labelFor,
};

export default leadQuality;
