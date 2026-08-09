# update-prompts/ — Lead-Quality Optimization Prompt Series

This folder contains the **second-generation prompt series** for the CIT Direct B.E.
Admissions 2026 landing page. The original `prompts/00-25` series built the page;
this series converts it from a low-friction enquiry funnel into a **high-intent
application funnel** that filters junk leads from Meta (Facebook/Instagram) campaigns.

## Why this series exists (context for every prompt)

The campaign was producing junk leads because:

1. Meta optimizes on a zero-friction `Lead` event and never receives any quality
   feedback (status changes send nothing back; the Google offline export has a bug
   that exports 0 rows forever).
2. The 5-field enquiry form carries no qualification signal (no marks, no intake
   year, no funding question, no parent contact).
3. Page copy repeats "free" and fake scarcity, hides the admission process, and the
   recruiter wall is placeholder images — attracting freebie-seekers and repelling
   serious families.
4. `POST /api/leads.php?action=create` is public with no validation, honeypot, or
   rate limiting — bots bypass all client-side checks.

## Confirmed product decisions (do not re-litigate inside any prompt)

- **No fee amounts on the landing page.** The Fees & Funding section and the funding
  question promise transparency ("no capitation, no consultancy or agent fees") but
  never state numbers. *Superseded in one place:* `/apply` **Step 5**
  (`StepFeesBranches`) shows the complete per-branch, per-year cost table and the
  education-loan example. Fee figures live there and nowhere else, and always come
  from `src/data/meritProgram.js`.
- **The short drawer enquiry form is fully replaced.** Every CTA on the page leads
  to the new full-page multi-step application form at `/apply`. The drawer code
  stays in the repo but is no longer opened from anywhere.
- **Mandatory fields:** every application field is required EXCEPT `email`,
  `best_time` (best time to call), and `message` — those three stay optional.
- **Messaging stays 2026-only.** No 2027 copy on the page. (The form still asks
  intake year — it is a filter, not page copy.)
- **No OTP, no visible CAPTCHA.** Anti-junk = qualification friction + honeypot +
  time-trap + server-side validation + rate limiting + WhatsApp-confirmation
  checkbox.

## Status: COMPLETE ✅

All six prompts (01–06) have been executed and their acceptance criteria
verified. This folder is now a **historical record of the intent**, not a
to-do list — do not re-run it against the current codebase.

Two sections below stay live and are still referenced by the code and by
`CLAUDE.md`:

- **"Canonical new-field schema"** — the authoritative field vocabulary for the
  lead object. Any new lead field must be added there first.
- **"Confirmed product decisions"** — no fee amounts, `/apply` as the sole
  capture surface, 2026-only copy, mandatory-field list, no OTP/CAPTCHA.

For what shipped, see `CHANGELOG.md` → `[Unreleased]`. For the architecture as
it now stands, see `CLAUDE.md`. For what an operator must configure before the
campaign goes live, see `LAUNCH_NOTES.md`.

## Execution order

Run strictly in order. Each prompt is self-contained; later prompts depend on
earlier ones. After each prompt: `npm run build` must pass and the acceptance
criteria in the prompt must be verified.

| # | File | What it does | Status |
|---|------|--------------|--------|
| 01 | `01-tracking-attribution-and-lead-api-hardening.md` | Fixes all tracking bugs (E.164 hashing, `'converted'` status bug, course→dataLayer mismatch), adds fbclid/UTM persistence, unicode-safe validators, and hardens `leads.php` (validation, honeypot, time-trap, rate limit, silent duplicate merge, upsert). No visible UI change. | ✅ Done |
| 02 | `02-apply-multistep-application-form.md` | Builds the `/apply` full-page 4-step application form with subject-marks entry, live eligibility computation, Step-1 partial capture, sessionStorage drafts, and `SubmitApplication` tracking. | ✅ Done |
| 03 | `03-landing-content-part1-hero-fees-process-eligibility.md` | Hero rework (embedded form → application CTA card), new Fees & Funding section (no numbers), new Admission Process section, eligibility strip. | ✅ Done |
| 04 | `04-landing-content-part2-cta-trust-proof-faq.md` | Re-points every CTA to `/apply`, tones down "free"/scarcity copy, fixes the recruiter wall, adds testimonials scaffold + FAQ section with schema. | ✅ Done |
| 05 | `05-admin-panel-qualification-data.md` | Admin panel: grouped lead detail (Academic Details / Family & Funding / Logistics), new list columns + filters, lead quality score, partial-lead handling, CSV/search updates. | ✅ Done |
| 06 | `06-meta-quality-feedback-loop-and-guides.md` | Server-side status→Meta CAPI feedback (`QualifiedLead`/`Purchase`), `Contact` events on phone/WhatsApp clicks, MetaAdsGuide rewrite, CLAUDE.md + CHANGELOG updates, final QA checklist. | ✅ Done |

## Non-negotiable rules (apply to every prompt)

1. **Mobile-first at 360 px.** The majority of Meta traffic is budget Android on
   Jio/Airtel. Every new screen must be designed at 360 px width first and must be
   fully usable one-handed.
2. **Zero jank.** No `framer-motion` in the `/apply` page (CSS-only transitions,
   `transform`/`opacity` only). No `backdrop-filter` on new surfaces. No MUI popover
   `Select` in the new form — native selects or radio-chip groups only.
3. **DO NOT MODIFY:** `src/utils/webhookSubmit.js`, `src/utils/validators.js`,
   `src/utils/swalHelper.js`,
   `src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx`,
   `src/components/common/LeadFormDrawer/LeadFormDrawer.jsx`,
   `src/context/ModalContext.jsx` (drawer/modal behavior), and the mobile
   drawer/navigation open-close mechanics. All new behavior is **additive**: new
   files, new routes, and re-pointing CTA targets only. (Prompt 06 updates
   CLAUDE.md to document the new architecture.)
4. **Lead payload compatibility.** New fields ride on the existing lead object —
   `public/api/leads.php` stores arbitrary JSON, and the canonical status keys
   (`new`, `contacted`, `consultation_booked`, `procedure_scheduled`, `completed`,
   `not_interested`) must NEVER be renamed (`src/admin/utils/leadStatus.js`).
5. **Shared field vocabulary.** All prompts use the exact field names defined in
   the "Canonical new-field schema" section below. Do not invent variants.
6. **2026-only copy. No fee numbers on the landing page** (the sole exception is
   `/apply` Step 5 — see "Confirmed product decisions" above). **No fabricated stats
   or testimonials** — the testimonials section ships with clearly-marked sample
   content and a launch blocker note.
7. Keep the existing brand token system (`src/styles/variables.css`), fluid type
   scale, 44 px minimum touch targets, `prefers-reduced-motion` support, and 16 px
   input font on mobile (iOS zoom prevention).

## Canonical new-field schema (used by prompts 02, 05, 06)

Every field below is stored flat on the lead object alongside the existing keys
(`name`, `mobile`, `email`, `service_interest`, `state`, `message`, `source`,
`lead_id`, `status`, `submitted_at`, `updated_at`, `page_url`, `user_agent`,
`utm_*`, `gclid`, `notes`, `activity`).

| Field | Type / allowed values | Required |
|---|---|---|
| `lead_tier` | `'application'` \| `'partial'` \| `'spam'` (legacy leads have no tier → treat as `'enquiry'`) | auto |
| `intake_year` | `'2026'` \| `'2027'` \| `'researching'` | yes |
| `whatsapp_confirmed` | boolean — "this number is on WhatsApp" | yes (checkbox may be false) |
| `twelfth_status` | `'passed'` \| `'appearing_2026'` \| `'diploma'` | yes |
| `twelfth_board` | `'AHSEC'` \| `'NBSE'` \| `'MBOSE'` \| `'TBSE'` \| `'COHSEM'` \| `'CBSE'` \| `'ICSE'` \| `'Other'` | yes, except `twelfth_status='diploma'` |
| `twelfth_school` | string ≤ 120 chars | yes, except `twelfth_status='diploma'` |
| `twelfth_subjects` | array of `{ subject: string, marks: number 0–100 }` — Physics & Mathematics always present; ≥1 more from Chemistry / Biology / Computer Science / Statistics / Electronics / Other | yes; `twelfth_status='appearing_2026'` → `expected_band` instead; `'diploma'` → stored `[]` (diploma marks collected on the call) |
| `expected_band` | `'above_75'` \| `'60_75'` \| `'45_60'` \| `'below_45'` (only when appearing) | conditional |
| `eligibility_percent` | number, 1 decimal — (Physics + Maths + best other) / 3 | auto |
| `eligibility_met` | boolean — `eligibility_percent >= 45` | auto |
| `tenth_school` | string ≤ 120 chars | yes |
| `tenth_year` | 4-digit year, 2015–2026 | yes |
| `tenth_percent` | number 35–100 | yes |
| `filled_by` | `'student'` \| `'parent'` \| `'guardian'` | yes |
| `parent_name` | string (unicode letters) | yes |
| `parent_mobile` | 10-digit `[6-9]\d{9}`, must differ from `mobile` | yes |
| `funding_plan` | `'self_funded'` \| `'education_loan'` \| `'scholarship'` \| `'need_discussion'` | yes |
| `district` | string ≤ 60 chars | yes |
| `counselling_mode` | `'whatsapp_video'` \| `'phone'` \| `'campus_visit'` \| `'ne_rep'` | yes |
| `admission_timeline` | `'two_weeks'` \| `'one_month'` \| `'after_results'` \| `'not_sure'` | yes |
| `best_time` | `'morning'` \| `'afternoon'` \| `'evening'` \| `''` | **optional** |
| `email` | valid email or `''` | **optional** |
| `message` | string ≤ 500 chars | **optional** |
| `fee_affordability` | `'own_income'` \| `'education_loan'` — answered on `/apply` Step 5, after the applicant has seen the complete fee table. Distinct from `funding_plan`: that is the family's plan *before* seeing the numbers, this is their capability *after* | yes (full submit) |
| `branch_pref_1` | exact branch string from the 7 real branches in `src/data/meritProgram.js` (`MERIT_BRANCHES[].course`) — same em-dash format as `service_interest`, but never `"Not Sure — Need Guidance"` | yes (full submit) |
| `branch_pref_2` | same vocabulary as `branch_pref_1`, and must differ from it — the applicant picks exactly two, in order of preference | yes (full submit) |
| `fbclid`, `fbp`, `fbc` | strings from attribution util | auto |
| `form_started_at` | ISO timestamp when Step 1 rendered (time-trap) | auto |
| `application_completed_at` | ISO timestamp on final submit; absent on partials | auto |

Existing-key reuse: the chosen B.E. branch is stored in `service_interest`
(legacy key, admin-compatible) using the exact option strings from
`src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx` `COURSE_OPTIONS`
(em-dash format, e.g. `"B.E. — Computer Science & Engineering"`). Home state uses
the existing `state` key with the same 8 NE states + `"Other"`.

**`source` value contract (shared by prompts 02 and 04):** the base source is the
CTA key stored in sessionStorage `cit_apply_source` by the CTA hook (prompt 04);
fallback when absent: `apply-direct`. The Step-1 partial submit appends
`/step1-partial`, the final submit appends `/full` — e.g.
`apply-now/step1-partial`, `request-callback/full`, `apply-direct/full`.
