# 02 — `/apply` Multi-Step Application Form

**Prerequisite:** `update-prompts/01-tracking-attribution-and-lead-api-hardening.md`
completed (needs `attribution.js`, `applicationValidators.js`, and the `leads.php`
upsert). Read `update-prompts/README.md` for the canonical field schema — every
field name in this prompt comes from that table.

## Goal

Build a full-page, mobile-first, 4-step **application form** at `/apply` that
replaces the short enquiry drawer as the only lead-capture surface. It collects the
full qualification profile (academics with live eligibility computation, family &
finance, logistics), fires a partial lead after Step 1 so abandoners are still
recovered by telecallers, and fires the `SubmitApplication` event only on full
completion. Zero perceptible lag on a budget Android phone.

## Files to edit

- **NEW** `src/pages/Apply/Apply.jsx` — page shell (header bar, progress, step host)
- **NEW** `src/pages/Apply/Apply.module.css`
- **NEW** `src/pages/Apply/steps/StepIdentity.jsx`
- **NEW** `src/pages/Apply/steps/StepAcademics.jsx`
- **NEW** `src/pages/Apply/steps/StepFamilyFinance.jsx`
- **NEW** `src/pages/Apply/steps/StepLogistics.jsx`
- **NEW** `src/pages/Apply/EligibilityBadge.jsx`
- **NEW** `src/pages/Apply/index.js`
- **NEW** `src/utils/applicationSubmit.js` — payload build + partial/final submit
- `src/App.jsx` — lazy route registration + chunk preload (route wiring only)
- `public/api/meta-capi.php` — add `SubmitApplication` to the supported-events whitelist
- `src/utils/metaPixel.js` — add a `trackSubmitApplication(params)` helper (additive)
- `src/utils/metaCAPI.js` — add a `sendSubmitApplicationEvent(payload)` helper (additive)

## Requirements

### 1. Route & page shell

1. Register `/apply` in `src/App.jsx` as a `lazy()` route beside `ThankYouPage`.
   Preload the chunk on `pointerdown`/`touchstart` of any Apply CTA (export a
   `preloadApply = () => import('../pages/Apply')`-style helper from the page's
   `index.js`; prompt 04 wires CTAs to it).
2. The page renders WITHOUT the site Header, MobileNavigation, or footer — it is a
   focused flow. Top bar: CIT logo (small, same asset as `Header.jsx`), a thin
   progress bar, and a close (×) button → `navigate('/')` with a confirm dialog
   ONLY when the current step has unsaved input ("Your progress is saved — leave
   the application?"). Browser back button = previous step (push a history entry
   per step via `useSearchParams` step index, e.g. `/apply?step=2`); back on step 1
   exits to `/`.
3. Scoped body class so `responsive.css`'s mobile-nav bottom padding does not
   apply on this route.
4. `min-height: 100dvh`; page background `var(--color-tint)` / white; content
   column `max-width: 560px` centered; one screen per step at 360 px with no
   vertical scroll needed except inside Step 2.
5. Progress: step label ("Step 2 of 4 — Academic Details") + CSS `scaleX`
   transform bar. No JS scroll/resize listeners.
6. Sticky footer with Back / Next (or "Submit My 2026 Application" on step 4)
   using `position: sticky; bottom: 0` inside normal document flow +
   `env(safe-area-inset-bottom)` padding — NOT `position: fixed` (keyboard
   safety on Android).
7. SEO: `noindex, nofollow` via `SEOHead`, title "Apply — Direct B.E. Admission
   2026 | CIT Tumakuru".

### 2. State, persistence, transitions

1. One parent `useReducer` holding all answers; render ONLY the active step
   (conditional render — not `display:none`, not `AnimatePresence`).
2. Persist the draft to sessionStorage key `cit_apply_draft` on every field commit
   and step change; rehydrate on mount (Jio drops connections; Android discards
   background tabs). Clear the draft on final success.
3. Step transition: 150–200 ms CSS opacity (+ optional `translateX(12px)→0`),
   compositor-only. **No framer-motion anywhere in this page.** Honor
   `prefers-reduced-motion` (transition: none).
4. Per-step validation on Next using `src/utils/validators.js` +
   `src/utils/applicationValidators.js`. On error: `scrollIntoView({block:
   'center', behavior:'smooth'})` + focus the first invalid field. Validate on
   blur after first Next attempt.

### 3. Inputs — performance & UX rules (all steps)

1. Enable autofill (the old form's `autoComplete="off"` anti-pattern is banned):
   `name` → `autocomplete="name"`; mobiles → `type="tel" inputmode="numeric"
   autocomplete="tel-national" maxLength={10}` with digit-only masking (copy the
   logic pattern from the old form's mobile handler — reimplement, do not import
   from `UnifiedLeadForm`); email → `type="email" inputmode="email"
   autocomplete="email"`; marks/percent/year → `inputmode="numeric"` (never
   `type="number"`).
2. `enterKeyHint="next"` on intermediate fields, `"done"` on each step's last.
3. Selects: native `<select>` (or MUI `TextField select` with
   `SelectProps={{ native: true }}`) — no popover menus. Options with ≤ 4 choices
   render as radio-chip groups (single tap, min 44 px touch targets).
4. 16 px input font ≤ 768 px (iOS zoom prevention), 12 px input radius, existing
   brand tokens from `src/styles/variables.css`. Match the visual language of the
   existing form CSS (`UnifiedLeadForm.module.css`) without importing it.
5. Icons: inline SVG components (copy the few needed mdi paths) — do NOT add
   `@iconify/react` runtime fetches to this page.

### 4. The four steps (exact fields)

**STEP 1 — "Let's get started" (~20 seconds)**

| Field | Control | Validation |
|---|---|---|
| Student's full name (`name`) | text | `getUnicodeNameError` |
| Student's mobile (`mobile`) | tel, +91 prefix adornment | existing Indian-mobile validator |
| `whatsapp_confirmed` | checkbox "This number is on WhatsApp" (pre-checked) | — |
| Preferred B.E. branch (`service_interest`) | native select, exact `COURSE_OPTIONS` strings (em-dash format) incl. "Not Sure — Need Guidance" | required |
| Planning admission for (`intake_year`) | radio-chips: "2026 (this year)" / "2027" / "Just researching" | required |

On Step 1 Next: build the partial payload via `applicationSubmit.js` (see §5) and
POST it (fire-and-forget; do not block the UI on the network). Store the generated
`lead_id` in the draft so all later submits upsert the SAME lead.

**STEP 2 — "Academic details" (the eligibility check)**

Header microcopy: "CIT's admission team uses this to confirm your VTU B.E.
eligibility instantly."

| Field | Control | Validation |
|---|---|---|
| `twelfth_status` | radio-chips: "Passed 12th" / "Appearing in 2026" / "Diploma (lateral entry)" | required |
| `twelfth_board` | native select (AHSEC, NBSE, MBOSE, TBSE, COHSEM, CBSE, ICSE, Other) | required |
| `twelfth_school` | text "School/College name (12th)" | required, ≤120 |
| Subjects & marks (`twelfth_subjects`) | see below | required |
| `tenth_school` | text "School name (10th)" | required, ≤120 |
| `tenth_year` | numeric "Year of passing 10th" | `getYearError` |
| `tenth_percent` | numeric "10th percentage" | `getPercentError` |

Subjects & marks control:
1. **Physics** and **Mathematics** rows are always present (locked — VTU requires
   both). Below them, a chip row "Add your other subjects": Chemistry, Biology,
   Computer Science, Statistics, Electronics, Other. Tapping a chip adds a marks
   row; at least ONE additional subject is required; max 6 additional.
2. Each row: subject label + "Marks out of 100" numeric input
   (`getMarksError`).
3. **Live eligibility computation** (`EligibilityBadge.jsx`): as soon as Physics,
   Mathematics and ≥1 other subject have valid marks, call
   `computeEligibility()` and show:
   - `percent ≥ 45`: green badge — "Your eligibility aggregate: **61.3%** — ✔ You
     meet VTU B.E. eligibility (Physics + Maths + best other subject)."
   - `40 ≤ percent < 45`: amber — "…✔ You may qualify under the reserved-category
     relaxation (40%). Our team will confirm."
   - `percent < 45` (general): amber, NOT red, never blocking — "…Our admission
     team will review your options — submit and we'll guide you." (Self-selection,
     not rejection — never prevent submission on marks.)
4. If `twelfth_status = 'appearing_2026'`: replace the marks UI with
   `expected_band` radio-chips ("Above 75%" / "60–75%" / "45–60%" / "Below 45%")
   and skip the badge. If `'diploma'`: replace with a single info line "Diploma
   holders join B.E. 2nd year via lateral entry — we'll collect your diploma marks
   on the call" and require only the 10th fields (store
   `twelfth_subjects: []`).

**STEP 3 — "Family & funding" (the qualifiers)**

| Field | Control | Validation |
|---|---|---|
| `filled_by` | radio-chips: "Student" / "Parent" / "Guardian / Relative" | required |
| `parent_name` | text — label "Parent/Guardian's name" (when `filled_by='parent'`, label "Your name (parent)") | `getUnicodeNameError` |
| `parent_mobile` | tel — "Parent/Guardian's mobile" (when parent fills: "Your mobile (parent)" and it must differ from the student number entered in Step 1) | `getParentMobileError` |
| `funding_plan` | radio list (full-width rows), question: "How does your family plan to manage the B.E. fees and study cost?" Options: "We can fund it ourselves" / "We'll need an education loan (CIT assists with bank loans)" / "Depends on scholarship support" / "We need to discuss this with the counsellor" | required |

Reassurance microcopy under the funding question: "CIT charges no capitation and
no consultancy/agent fee. The full fee structure is shared transparently on your
first counselling call." (No amounts — confirmed decision.)

**STEP 4 — "Almost done"**

| Field | Control | Validation |
|---|---|---|
| `state` | native select — existing 8 NE states + "Other" | required |
| `district` | text "Your district / town" | required, ≤60 |
| `counselling_mode` | radio-chips: "WhatsApp video call" / "Phone call" / "I can visit the campus" / "Meet CIT's NE representative near me" | required |
| `admission_timeline` | radio-chips: "Within 2 weeks" / "Within a month" / "After my results" / "Not sure yet" | required |
| `best_time` | radio-chips Morning / Afternoon / Evening | **optional** |
| `email` | email | **optional**, validate only if non-empty |
| `message` | textarea ≤ 500, "Any question for the admission team? (optional)" | **optional** |

Consent line above submit (same legal text as the old form): "By submitting, I
agree to be contacted by CIT / Assam Digital about 2026 B.E. admissions and to the
Terms & Conditions and Privacy Policy." — link opens the privacy content in a
plain CSS overlay (reuse the copy from `UnifiedLeadForm.jsx`'s
`PrivacyPolicyContent`; re-declare it locally, do not import from the protected
file). Submit button: **"Submit My 2026 Application"**.

### 5. Submission plumbing — `src/utils/applicationSubmit.js` (new file)

Do NOT modify `webhookSubmit.js`. New util that follows its payload conventions:

1. `submitPartialApplication(draft)` — builds the lead: Step-1 fields +
   `lead_id` (UUID, generated once and kept in the draft), `lead_tier:
   'partial'`, `status: 'new'`, `source: 'apply-step1-partial'`,
   `form_started_at`, `submitted_at`/`updated_at`, `page_url`, `user_agent`,
   UTMs + `gclid` (same lookup as webhookSubmit) **plus** `fbclid`/`fbp`/`fbc`
   from `getAttribution()`, an activity entry `"Application started (Step 1)"`,
   and the hidden honeypot `website` field value (empty for humans). POST to the
   same `action=create` endpoint (the upsert from prompt 01 makes re-posts safe).
2. `submitFullApplication(draft)` — same `lead_id`, all fields from the canonical
   schema, `lead_tier: 'application'`, `source: 'apply-full'`,
   `application_completed_at`, activity entry `"Application submitted (all steps
   completed)"`. POST `action=create` (server merges by `lead_id`).
3. On full-submit success:
   - GTM: existing `trackFormSubmission('apply-full', { serviceInterest, intakeYear })`.
   - Meta: shared `event_id` via `generateEventId()`; browser pixel
     `SubmitApplication` (new `trackSubmitApplication` helper) + CAPI
     `sendSubmitApplicationEvent` with hashed PII — mirror the existing
     Lead-event dual pattern exactly. ALSO fire the plain `Lead` pair (some ad
     sets still optimize on Lead during migration).
   - Google Ads: existing `trackGoogleAdsFormSubmission('apply-full')` +
     `sendEnhancedConversionData(email, mobile, name)`.
   - `sessionStorage.setItem('lead_submitted', 'true')` and `'lead_name'` (the
     ThankYou page gate requires both — see `ThankYou.jsx`).
   - `navigate('/thank-you')`. No SweetAlert on this page (keeps sweetalert2 out
     of the chunk).
4. On network failure: inline error banner with Retry (draft is intact) + "or
   call +91 8069645014" tel link. Queue the payload in localStorage
   `cit_apply_retry` and flush it on next app load (register the flush in
   `App.jsx` alongside `captureAttribution()`).
5. GTM step-funnel events on every step render/completion:
   `application_step_view` / `application_step_complete` with `{ step: n,
   step_name }` — push via the existing gated dataLayer helper in `gtm.js`
   (add a small generic `trackApplicationStep` export; additive only).
6. Partial-lead Meta signal: fire ONLY the plain `Lead` pixel/CAPI pair after
   Step 1 (tagged `content_name: 'apply-step1-partial'`). `SubmitApplication`
   fires exclusively on full completion — this separation is what Meta's
   optimization will later be switched to.

### 6. `public/api/meta-capi.php`

Add `SubmitApplication` to the supported/whitelisted event names. No other change.

## Constraints

- DO NOT modify `webhookSubmit.js`, `UnifiedLeadForm.jsx`, `LeadFormDrawer.jsx`,
  `ModalContext.jsx`, `swalHelper.js`, `validators.js`.
- `src/App.jsx` changes limited to: route registration, chunk preload, retry-queue
  flush + attribution capture calls.
- No framer-motion, no `backdrop-filter`, no `@iconify/react`, no sweetalert2 in
  the `/apply` chunk. No new npm dependencies.
- All copy 2026-only. No fee amounts anywhere.
- Every field mandatory except `email`, `best_time`, `message`.

## Acceptance criteria

- [ ] `npm run build` passes; `/apply` is a separate lazy chunk (verify in `build/static/js`).
- [ ] `grep -rn "framer-motion\|@iconify\|sweetalert2" src/pages/Apply src/utils/applicationSubmit.js` → no matches.
- [ ] `grep -rn "autocomplete\|autoComplete" src/pages/Apply` → autofill enabled (no `off` on the form element).
- [ ] `grep -n "SubmitApplication" public/api/meta-capi.php src/utils/metaPixel.js src/utils/metaCAPI.js src/utils/applicationSubmit.js` → wired end-to-end with shared `event_id`.
- [ ] `grep -n "lead_submitted" src/utils/applicationSubmit.js` (or Apply page) → ThankYou gate satisfied.
- [ ] Manual at 360 px (Chrome device mode, CPU 4× throttle): each step fits one screen (Step 2 may scroll), keyboard never covers the focused input or the Next button, back button steps backward, refresh mid-form restores the draft, eligibility badge updates live as marks are typed.
- [ ] Manual: complete Step 1 then abandon → lead appears server-side with `lead_tier: 'partial'`; complete all steps → SAME `lead_id` now has `lead_tier: 'application'` and all fields.
- [ ] Entering marks below 45% never blocks submission.
