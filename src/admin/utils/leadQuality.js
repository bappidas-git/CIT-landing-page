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
import { MERIT_BRANCHES } from "../../data/meritProgram";

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
  CBSE: "CBSE",
  ICSE: "ICSE / ISC",
  NIOS: "NIOS",
  KAR_PUC: "Karnataka PUC (KSEAB)",
  AHSEC: "AHSEC (Assam)",
  NBSE: "NBSE (Nagaland)",
  MBOSE: "MBOSE (Meghalaya)",
  TBSE: "TBSE (Tripura)",
  COHSEM: "COHSEM (Manipur)",
  Other: "Other state board",
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
  ne_rep: "Meet CIT's representative near me",
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

// `fee_affordability` is answered on /apply Step 5, AFTER the applicant has
// seen the complete per-branch cost table — so unlike `funding_plan` (a plan
// formed before the numbers) it is a statement of capability. Short labels for
// the list column and the CSV; the applicant's own sentence for the detail card.
export const AFFORDABILITY_LABELS = {
  own_income: "Own income",
  education_loan: "Needs loan",
};

export const AFFORDABILITY_LONG_LABELS = {
  own_income: "Yes — I can afford this study cost with my own family income.",
  education_loan: "I'll need an education loan to afford this study cost.",
};

// Branch preferences are stored as the full course strings (`B.E. — Computer
// Science & Engineering`), which no list column can fit. The short forms come
// from meritProgram.js so the admin can never drift from the fee table and the
// /apply step that produced the answer.
export const BRANCH_SHORT_LABELS = MERIT_BRANCHES.reduce((acc, branch) => {
  acc[branch.course] = branch.short;
  return acc;
}, {});

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

/**
 * Compact a stored branch string to `CSE` / `AI & DS` / … for the list table.
 * An unmapped course (a legacy `service_interest` value, say) falls through to
 * its raw text rather than disappearing.
 * @param {string} course - Stored course string
 * @returns {string} Short branch name
 */
export const shortBranch = (course) => labelFor(BRANCH_SHORT_LABELS, course);

/* ============================================
   MERIT TEST & COUNSELLING
   ============================================
   Every field read below is written SERVER-SIDE by test.php (via its internal
   patch_lead) or by leads.php when it assigns the login key. None of them are
   in `lead_field_whitelist()`, so nothing here can be forged by a payload
   POSTed to the public create endpoint — the admin can trust these numbers in
   a way it deliberately does not trust the quality score above.
   ============================================ */

export const TEST_STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", color: "#6B7280", bg: "#F3F4F6" },
  { value: "in_progress", label: "In Progress", color: "#B45309", bg: "#FEF3C7" },
  { value: "completed", label: "Completed", color: "#10B981", bg: "#ECFDF5" },
];

const TEST_STATUS_BY_VALUE = TEST_STATUS_OPTIONS.reduce((acc, t) => {
  acc[t.value] = t;
  return acc;
}, {});

/** Sort rank — a lead further along the test sorts above one that is not. */
const TEST_STATUS_RANK = { not_started: 0, in_progress: 1, completed: 2 };

/**
 * Where this lead stands on the merit test.
 *
 * Returns null — not "not started" — for a lead that was never issued a key
 * (legacy drawer enquiries, CSV imports, spam). Those applicants were never
 * asked to sit the paper, so the admin shows them nothing at all rather than
 * branding them as having skipped it.
 *
 * @param {Object} lead - Lead record
 * @returns {'not_started'|'in_progress'|'completed'|null} Test state, or null
 */
export const getTestStatus = (lead) => {
  if (!lead) return null;
  const stored = typeof lead.test_status === "string" ? lead.test_status.trim() : "";
  if (stored === "completed" || stored === "in_progress") return stored;
  return lead.login_key ? "not_started" : null;
};

/**
 * Resolve a test-state key to its chip config (label/color/bg).
 * @param {string} status - Test state key
 * @returns {{value: string, label: string, color: string, bg: string}} Config
 */
export const getTestStatusConfig = (status) =>
  TEST_STATUS_BY_VALUE[status] || TEST_STATUS_BY_VALUE.not_started;

/**
 * Sort key for the Test column: state first, then score inside "completed" so
 * one click puts the best finished papers on top.
 * @param {Object} lead - Lead record
 * @returns {number} Comparable rank
 */
export const getTestSortValue = (lead) => {
  const status = getTestStatus(lead);
  if (!status) return -1; // never issued a key — below every tested lead
  const score = Number(lead?.test_score);
  return TEST_STATUS_RANK[status] * 1000 + (Number.isFinite(score) ? score : 0);
};

// `Sat 10 Aug, 4:00 PM`. Built from parts rather than a single toLocaleString
// so the separators and the AM/PM casing are fixed regardless of which ICU
// build the browser ships — a telecaller reads this hour off the screen.
const SLOT_FORMAT_OPTIONS = {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

/**
 * Render a booked counselling slot in the applicant's reading of it.
 * @param {string} iso - ISO UTC timestamp for the start of the hour
 * @returns {string} `Sat 10 Aug, 4:00 PM`, or "" when unset/unparseable
 */
export const formatSlot = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-IN", SLOT_FORMAT_OPTIONS).formatToParts(
    date
  );
  const part = (type) => (parts.find((p) => p.type === type) || {}).value || "";
  const period = part("dayPeriod").replace(/\./g, "").toUpperCase();
  return `${part("weekday")} ${part("day")} ${part("month")}, ${part("hour")}:${part(
    "minute"
  )}${period ? ` ${period}` : ""}`;
};

/** Maximum reachable merit-test score (30 questions × 4 marks). */
export const TEST_MAX_SCORE = 120;

/** Maximum per subject — the paper draws 15 Maths + 15 Physics. */
export const TEST_SUBJECT_MAX_SCORE = 60;

/**
 * Render the merit-test result as `84/120`, or an em dash when the applicant
 * has not finished a paper.
 * @param {Object} lead - Lead record
 * @returns {string} Score text
 */
export const formatScore = (lead) => {
  const score = Number(lead?.test_score);
  if (!Number.isFinite(score)) return "—";
  return `${score}/${TEST_MAX_SCORE}`;
};

/**
 * Relative reading of a booked slot for the telecaller: how long until the
 * call is due, or how far past it is. Returns "" when there is nothing to say.
 * @param {string} iso - Slot timestamp
 * @param {number} [now] - Epoch ms to compare against (injectable for tests)
 * @returns {string} `in 3 hours` / `overdue` / `now`
 */
export const describeSlotTiming = (iso, now = Date.now()) => {
  if (!iso) return "";
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return "";
  const minutes = Math.round((at - now) / 60000);
  if (minutes <= -60) return "overdue";
  if (minutes < 5) return "now";
  if (minutes < 60) return `in ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `in ${days} day${days === 1 ? "" : "s"}`;
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
    lead.country,
    lead.district,
    lead.counselling_mode,
    lead.admission_timeline,
    lead.best_time,
    lead.intake_year,
  ].some(hasValue);

/**
 * True when the lead carries anything from the merit-test / selection stage —
 * a login key, a test result, a booked counselling hour, the affordability
 * answer or a branch preference. Everything that stage produced is rendered
 * inside one card, so one gate covers all of it and a pre-merit-program lead
 * renders exactly as it did before.
 * @param {Object} lead - Lead record
 * @returns {boolean} Whether to render the Merit Test & Selection card
 */
export const hasSelectionData = (lead) =>
  !!lead &&
  [
    lead.login_key,
    lead.test_status,
    lead.test_score,
    lead.test_started_at,
    lead.test_completed_at,
    lead.counselling_slot,
    lead.fee_affordability,
    lead.branch_pref_1,
    lead.branch_pref_2,
  ].some(hasValue);

const leadQuality = {
  TIER_OPTIONS,
  QUALITY_BANDS,
  TEST_STATUS_OPTIONS,
  getLeadTier,
  getTierConfig,
  isPartialLead,
  computeQualityScore,
  getQualityConfig,
  getEligibilitySummary,
  getTestStatus,
  getTestStatusConfig,
  hasSelectionData,
  formatSlot,
  formatScore,
  shortBranch,
  labelFor,
};

export default leadQuality;
