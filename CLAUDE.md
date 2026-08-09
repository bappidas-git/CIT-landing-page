# CIT — Direct B.E. Engineering Admissions 2026

## Overview

A high-converting, mobile-first landing page for **Channabasaveshwara Institute of Technology (CIT), Tumakuru** — built to capture quality leads for **Direct B.E. (Engineering) Admissions, 2026 intake**, targeted at students and parents across North East India and run by Assam Digital. Built with React 18, Material UI, and Framer Motion. Includes an admin panel with lead management, a tele-calling lead module, GTM integration, Meta CAPI, and Google Ads conversion tracking.

The page is a **high-intent application funnel**, not an enquiry funnel. Campaign traffic is budget Android on Jio/Airtel, so every new surface is designed at 360 px first.

## Project Structure

- `src/components/sections/` — Page sections (Hero, About, Services, Features, Fees & Funding, Admission Process, FAQ, etc.)
- `src/components/common/` — Reusable components (Header, Footer, LeadForm, SEOHead, etc.)
- `src/data/` — Content data files (services, features, stats, locations, FAQ, testimonials)
- `src/config/` — SEO configuration
- `src/context/` — React context providers (Modal, Theme)
- `src/hooks/` — Custom hooks (`useApplyCTA`, useGTMTracking, useInView, useMediaQuery, etc.)
- `src/utils/` — Utility functions (webhook, application submit, attribution, GTM, Meta Pixel, contact tracking, Google Ads, validators)
- `src/admin/` — Admin panel (components, pages, context, utils)
- `src/pages/` — Full pages (`Apply`, ThankYou, `Test`)
- `public/` — Static assets, index.html, manifest, robots.txt, sitemap.xml
- `public/api/` — Server-side endpoints (`leads.php` shared lead store, `telecalls.php`, `test.php` merit-test API, Meta CAPI, `capi-feedback.php`, offline conversions)

## Lead Capture Architecture

**`/apply` is the sole public lead-capture surface.** Every CTA on the page routes there
through `src/hooks/useApplyCTA.js`, which warms the route chunk on `pointerdown`, fires the
`cta_click` GTM event, and stashes the CTA key in sessionStorage so the lead records which
CTA produced it.

`src/pages/Apply/` is a full-page, 5-step form. **Step order is part of the contract** —
`applicationSubmit.js`, the admin detail groups and the GTM funnel events all assume it:

1. **Identity** (`StepIdentity`) — name, mobile, WhatsApp confirmation, B.E. branch, intake year
2. **Academic Details** (`StepAcademics`) — 12th status/board/school, subject marks, 10th details
3. **Family & Funding** (`StepFamilyFinance`) — filled by, parent name + mobile, funding plan
4. **Logistics** (`StepLogistics`) — state, district, counselling mode, timeline, optional best time / email / message
5. **Fees & Branch Choice** (`StepFeesBranches`) — the complete per-branch cost table, the
   affordability answer (`fee_affordability`), the conditional education-loan panel, and two
   ranked branch preferences (`branch_pref_1` / `branch_pref_2`)

Step 5 is last on purpose: the affordability answer is the strongest commitment signal on the
form, and it is only meaningful once the applicant has seen the real numbers. Every figure it
renders comes from `src/data/meritProgram.js` — never hard-code fees in the step.

Design constraints for `/apply`: only the active step is mounted; CSS-only step transitions
(`transform`/`opacity`); no framer-motion, sweetalert2 or iconify on the route; the draft lives
in sessionStorage so a dropped connection never costs the applicant their answers.

**Two submits ride on one `lead_id`.** Completing Step 1 fires a *partial* submit
(`lead_tier: 'partial'`) so an abandoner is still a workable lead; the final submit re-posts the
same `lead_id` and upgrades the record to `lead_tier: 'application'`. `leads.php` upserts by
`lead_id`, so the second post merges rather than duplicating.

**Every application earns one test login key.** `leads.php` answers each create with
`{"success": true, "login_key": "CIT26-XXXXX"}` — see "Test login keys" below. The Step-1
partial claims the key, the full submit gets the *same* key back, and both stash it in
`sessionStorage.lead_login_key` for `/thank-you` and the test platform. Never generate or
accept a key client-side.

**`/thank-you` is the handoff to the test, not a celebration.** It is gated on
`sessionStorage.lead_submitted`, shows the key large with a Copy button (clipboard API, falling
back to a select-on-tap readonly input for old Android), and its primary CTA starts the test.
When no key is on the device it says the admission team will share it — never an empty box.
`lead_submitted` / `lead_name` self-clear after 5 minutes; `lead_login_key` deliberately does
not, because the test login screen pre-fills from it.

**The short enquiry drawer is retained but unreachable.** `LeadFormDrawer` / `UnifiedLeadForm`
are still mounted in `App.jsx`, but `openLeadDrawer()` (in `ModalContext.jsx`) has zero call
sites. Do not re-point any CTA at it.

### Canonical field schema

The authoritative list of every lead field — names, allowed values, which are required, and the
`source` value contract — lives in **`update-prompts/README.md` → "Canonical new-field schema"**.
Use those exact names; do not invent variants. Fields ride flat on the lead object alongside the
legacy keys (`name`, `mobile`, `email`, `service_interest`, `state`, …). The chosen B.E. branch
reuses the legacy `service_interest` key.

### Lead tiers

`lead_tier` classifies how much a record is worth working:

| Tier | Meaning |
|---|---|
| `application` | Full application completed — the target lead |
| `partial` | Step 1 only; abandoned mid-form but has name + mobile |
| `spam` | Failed a server-side anti-bot check (see below) |
| *(absent)* | Legacy enquiry-drawer lead — treat as `enquiry` |

## Lead Storage & Sync

Leads are stored server-side in `public/api/leads.php` (a shared JSON store) — this is the
**single source of truth**. The public form POSTs each submission there, and the admin panel
reads/writes only the server (auto-refreshing every 15s), so every browser and device sees the
same leads. There is no localStorage copy of leads. Configure with `REACT_APP_LEADS_API_URL` +
`REACT_APP_LEADS_ADMIN_KEY` in `.env` (the key must match `ADMIN_API_KEY` in
`public/api/config.php`).

`?action=create` is public, so it is hardened server-side — client-side checks alone are
bypassable:

- **Field whitelist + length caps** — unknown keys are dropped, strings capped at 500 chars.
- **Honeypot** — a hidden `website` input; filled ⇒ `lead_tier: 'spam'`. Never stored.
- **Time-trap** — `submitted_at − form_started_at` under `LEADS_MIN_FORM_SECONDS` (default 15) ⇒ spam.
- **Suspicious-number flagging** — repeated-digit and straight-sequence mobiles ⇒ spam.
- **Per-IP rate limiting** — over budget, the request is silently discarded with a success response.
- **Silent duplicate merge / upsert** — a repeat submitter is a hot lead, not an error: re-posts
  merge into the stored lead by `lead_id`, else by `mobile`. No `duplicate` flag is returned
  (that was a phone-number enumeration vector).

Anti-bot responses are deliberately indistinguishable from success, so a bot learns nothing —
including the `login_key` every create answers with (a real key for an application lead, an
unpersisted decoy otherwise). Requests carrying a valid `X-Admin-Key` (admin CSV import) skip
the anti-bot checks. Every response carries `Cache-Control: no-store`.

Both `leads.php` and `telecalls.php` ship with **no fallback admin key** — until one is
configured they answer `503` on admin actions. See `LAUNCH_NOTES.md`.

### Test login keys

`CIT26-XXXXX` — 5 chars from `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (no ambiguous `0 O 1 I`, so a
telecaller can read one out over a bad line). Rules that must hold:

- **Server-authored only.** `login_key` is deliberately absent from `lead_field_whitelist()`, so
  a client-supplied value is dropped. Only admin `?action=update` can set one by hand.
- **One key per lead, for life.** The Step-1 partial claims it; the full submit re-reads the
  stored key instead of claiming a second. `merge_into_lead()` never touches it.
- **Only apply-funnel leads qualify** — incoming `lead_tier` `partial` or `application`, on an
  untrusted request. Drawer, CSV-import and legacy creates must not consume keys.
- **Capture never fails for want of a key.** `public/api/data/login_keys.json` (entries
  `{key, lead_id, assigned_at}`) is seeded with 100 keys, auto-extends by 50 when it runs dry,
  and falls back to an unpersisted generated key if the ledger cannot be read or written — the
  lead record is what the test platform authenticates against, not the ledger.

## Question Bank (Merit Assessment Test)

`public/api/question-bank.php` holds the **120 original MCQs** for the 30-Minute Online Merit
Assessment Test — **60 Mathematics (`M001`–`M060`) + 60 Physics (`P001`–`P060`)**, Class-12 /
engineering-entrance standard, every one answerable in ≤ 60 seconds. An attempt draws 15 Maths +
15 Physics at random.

- **Answers never leave the server.** The file is a plain `return [...]` PHP data file, so a
  browser can never receive its source; on top of that it opens with a guard —
  `if (!defined('CIT_TEST_INTERNAL')) { http_response_code(404); exit; }`. The test endpoint
  defines `CIT_TEST_INTERNAL` before requiring it; a direct HTTP hit gets a bare 404. The API
  layer strips `answer` (and may strip `topic` / `difficulty`) before serialising anything to the
  client. **Never import or require this file from `src/`** — it must stay out of every bundle.
- **Row schema:** `id` (unique, `M###` / `P###`) · `subject` (`maths` | `physics`) · `topic`
  (lowercase slug) · `difficulty` (`easy` | `medium` | `hard`) · `q` (question text) · `options`
  (exactly 4 distinct non-empty strings) · `answer` (int 0–3, index into `options`).
- **Balance, deliberately maintained:** 24 easy / 24 medium / 12 hard per subject, and each answer
  index 0–3 is correct exactly 15 times per subject. Topic counts follow the Class-12 syllabus
  weighting. If you add or edit questions, keep the mix inside 13–17 per answer index so the
  position of the correct option carries no signal.
- **Notation is plain text + Unicode only** — `x²`, `√`, `π`, `θ`, `Ω`, `μ`, `°`, `×`, `·`, `−`,
  `≤`, `→`. No LaTeX, no KaTeX, no HTML in the strings; fractions inline with explicit parentheses
  (`(x + 1)/(x − 1)`), matrices row-listed as `[[a, b], [c, d]]`, vectors as `î, ĵ, k̂`. Any
  physical constant a student needs is supplied inside the question itself.

## Merit Test Platform (`/test` + `public/api/test.php`)

**Route map:** `/` · `/apply` · `/thank-you` · **`/test`** · `/admin/*`. `/test` is lazy-loaded
in `App.jsx`, `noindex, nofollow` (restoring `index, follow` on unmount, the same trick
`Apply.jsx` uses), and deliberately **absent from `public/sitemap.xml`** — it is reachable only
by an applicant holding a key.

**The login key IS the credential.** There is no admin key on any student-facing action, and
`test.php` **never accepts a `lead_id` from the browser** — every request resolves the applicant
by scanning `leads.json` for the `CIT26-XXXXX` key `leads.php` issued them. A client that could
name its own `lead_id` could sit someone else's test.

`src/pages/Test/` is a screen-state machine: `login → instructions → tnc → engine → done`.
Same route-bundle discipline as `/apply` — no framer-motion, sweetalert2, iconify or MUI popovers;
native controls plus inline SVG (`src/pages/Test/fields.jsx`, duplicated per-route on purpose).
The key field is pre-filled from `sessionStorage.lead_login_key` and accepts the key with or
without its `CIT26-` prefix. Endpoint comes from `REACT_APP_TEST_API_URL || '/api/test.php'`.
The engine screen lives in `src/pages/Test/TestEngine.jsx` — same route chunk.

### `test.php` rules that must hold

- **One generic error.** A malformed key, an unknown key and a rate-limited request all answer
  `{"success": false, "error": "invalid_key"}` with HTTP 200. Anything more specific turns the
  endpoint into an oracle for which keys exist. Login is rate-limited to **30 attempts per IP per
  hour** (`data/test_ratelimit.json`, fails open). `start` / `state` / `answer` charge that same
  budget **only when the key fails to resolve** — a running test makes ~30 calls, and CGNAT puts a
  whole district behind one address, so metering every call would lock real students out mid-paper.
- **Answers and scores never reach the browser.** No response from any action carries a correct
  option index, a qid, or a score — including the completion response, which is identical for
  every applicant.
- **`?action=login` writes nothing** — it is idempotent reconnaissance, so a refresh leaves no
  trace on the applicant's timeline. The timeline entry for starting belongs to `action=start`.
- `Cache-Control: no-store` on every response.

**Attempt store:** `public/api/data/test_attempts.json`, keyed on the login key (not the lead), so
a re-issued lead record can never hand out a second attempt. It lives in the same deny-all `data/`
folder as `leads.json`. Every read-modify-write goes through `with_attempts_locked()` (one `flock`
per request; `patch_lead` is called *after* the lock releases, so only one file is ever held at a
time). `leads.json` is read here and written *only* through `patch_lead()` — an internal
server-side write that appends activity and bumps `updated_at`, and never touches `notes`,
`lead_id`, `submitted_at` or `login_key`.

Login states: `not_started` · `in_progress` (+ `question_index`, the first question still in play) ·
`completed` (+ `completed_at`, `slot_booked`). `action=book_slot` lands with the slot-booking
prompt — **extend `test.php`, never add a second endpoint.**

### The test engine (`start` · `state` · `answer`)

**The paper:** 15 random Maths + 15 random Physics qids drawn per attempt, merged and shuffled, so
no two applicants get the same 30 questions in the same order. The attempt stores qids and the
chosen option index only — correctness is derived from the bank at scoring time, so the attempts
file is not itself an answer key.

**The timing model is exact — prompt 09 and the admin panel read these numbers:**

- A question's 60-second clock starts at its **first** serving (`first_served_at`) and is **never
  re-stamped on resume**. Closing the tab does not pause it.
- An answer is accepted while `now − first_served_at ≤ 60 + 15` (`CIT_TEST_GRACE_SECONDS`). The
  grace is slack for slow networks and is deliberately invisible to the client.
- Serving returns `remaining_seconds = clamp(60 − elapsed, 0, 60)`, so a resumed question shows
  what is really left rather than a fresh minute.
- **Auto-advance is server-authoritative.** `advance_attempt()` finalises every question whose
  window closed while the applicant was away (`selected: null, timed_out: true`) before anything
  else happens. The browser countdown is UX; it only ever posts a blank and asks for the next one.
- A stale `index` on `answer` gets `{"success": false, "error": "out_of_sync"}` **plus the current
  serving payload** — that is both the re-sync path and the entire no-going-back enforcement: an
  old index can never overwrite an answer.

**One attempt per key, for life.** A second `action=start` resumes; it never draws a second paper.

**Scoring** happens server-side on the 30th finalisation: +4 correct, 0 wrong, 0 blank, max 120.
No negative marking, so a guess never costs anything. The completion response is
`{"success": true, "state": "completed", "slot_booked": false}` — **no score to the student**; the
cutoff is the admission team's to apply.

**Lead fields the engine writes** (server-authored via `patch_lead` only): `test_status`
(`in_progress` → `completed`), `test_started_at`, `test_completed_at`, `test_score`,
`test_maths_score`, `test_physics_score`, `test_correct_count`, `test_wrong_count`,
`test_blank_count`, and `test_qualified` *only* when `TEST_QUALIFY_CUTOFF` is defined in
`config.php` (it ships commented out — absent means "not decided", where a stored `false` would
read as "rejected"). **None of these are in `lead_field_whitelist()` in `leads.php`**, so a bot
POSTing `test_score: 120` to `?action=create` finds it stripped. Activity strings are fixed:
`Merit test started` and `Merit test completed — scored` — no marks in the timeline, which gets
read out to applicants over the phone.

## Meta Quality Feedback Loop

Meta optimises for whatever conversion event it receives, so a zero-friction `Lead` event teaches
it to find people who fill forms. `public/api/capi-feedback.php` closes the loop: telecaller
verdicts are pushed back to Meta as server-side conversions.

| Store | Status change | Event sent |
|---|---|---|
| `leads.php` | → `contacted` (Hot) | `QualifiedLead` |
| `leads.php` | → `completed` (Seat Booked) | `Purchase` + `value` / `currency: INR` |
| `telecalls.php` | → `hot` | `QualifiedLead` |
| `telecalls.php` | → `seat_booked` | `Purchase` + `value` / `currency: INR` |

Rules that must hold: events fire only on a **genuine** status transition; `event_id` is
`"{event}_{recordId}"` so retries dedupe; `action_source` is `system_generated`; `user_data` is
hashed server-side **from the stored record only** — never the admin's cookies, IP or user agent;
the sender no-ops silently without Meta credentials and can never block or fail an admin save
(the HTTP response is flushed first). Failures land in `public/api/data/capi-feedback.log`.
`Purchase` value comes from `CONVERSION_VALUE_ADMISSION` in `config.php` — internal only, never
rendered on the page.

`capi-feedback.php` posts directly to the Graph API; it does **not** route through
`meta-capi.php`, whose `$supportedEvents` whitelist is for browser-originated events only.

## Tracking Signals

| Event | Fires on | Legs |
|---|---|---|
| `Lead` | Step-1 partial, and again on full completion | Pixel + CAPI (shared `event_id`) |
| `SubmitApplication` | Full application completed | Pixel + CAPI (shared `event_id`) |
| `Contact` / `phone_click` / `whatsapp_click` | Any phone or WhatsApp tap | GTM + Meta Pixel + Google Ads call conversion |
| `QualifiedLead` / `Purchase` | Admin status change | Server only |
| `application_step_view` / `application_step_complete` | Each `/apply` step, `step: 1…5` | GTM only |
| `merit_test_login` / `merit_test_instructions_view` | `/test` login accepted; instructions shown | GTM only |

**GTM container owner:** the funnel now runs to **step 5** (`step_name: 'fees_branches'`), so
`application_step_view` and `application_step_complete` each fire one new step value. Add
triggers for them, and note that `application_step_complete` for the final step reports
`step: 5, step_name: 'fees_branches'` (it was `4` / `'logistics'`) — any trigger pinned to
step 4 as "application finished" must be re-pointed or it will silently stop firing. The two
`merit_test_*` events are also new and need triggers; both carry only `test_state`
(`not_started` | `in_progress` | `completed`) — **never the login key, the student's name or any
other PII.**

Phone and WhatsApp taps go through **`src/utils/contactTracking.js` → `trackContactClick(channel, source)`**,
which fires all three legs from one call. Call it *instead of* `trackPhoneClick` /
`trackWhatsAppClick`, never alongside them, or the GTM event double-fires.

The browser pixel needs `REACT_APP_META_PIXEL_ID`; a GTM-only pixel does not fire this code's
events, and without it CAPI deduplication is inactive.

## Tele-Calling Module

The **Tele-Calling** admin module (`/admin/tele-calling`) mirrors Lead Management but its records are entered manually by telecallers (not the public form). It has its own server store `public/api/telecalls.php` (`data/telecalls.json`), service `src/admin/utils/telecallService.js`, status config `src/admin/utils/telecallStatus.js`, list page `TeleCalling.jsx`, detail page `TeleCallDetail.jsx`, and shared add/edit form `src/admin/components/TelecallFormDialog.jsx`. It uses the same cross-device sync pattern as leads (in-memory cache hydrated from the server, 15s poll, BroadcastChannel for same-browser tabs) and reuses `REACT_APP_LEADS_ADMIN_KEY` for auth (configure the endpoint with `REACT_APP_TELECALLS_API_URL`). Tele-calling statuses: Hot · Warm · Cold · Need More Follow Ups · Seat Booked · Not Interested.

## Content Rules (product decisions — do not re-litigate)

- **No fee amounts on the landing page.** Fee numbers appear in exactly one place: `/apply`
  **Step 5** (`StepFeesBranches`) and its education-loan panel, where an applicant who has
  already invested four steps sees the complete cost before committing. Every landing-page
  section — Fees & Funding included — still promises transparency ("no capitation, no
  consultancy or agent fees") and never states a number. Do not move fee figures upward.
- **2026-only copy.** The form still asks intake year — that is a filter, not page copy.
- **No "free counselling" angles, no fabricated scarcity, no invented stats or testimonials.**
  `testimonialsData.js` ships sample content behind `isLive: false`; recruiter chips only become
  logos when licensed artwork is added to `RECRUITER_LOGOS`.
- **No OTP, no visible CAPTCHA.** Anti-junk is qualification friction + the server-side checks above.

## Brand Color System (Defaults)

- Primary: #2D3561 (Deep Navy)
- Secondary/Accent: #2EC4B6 (Teal Green)
- Accent Warm: #FF6B35 (Orange — CTAs only)
- Light Teal: #E0F7F5 (Card backgrounds)
- White: #FFFFFF
- Text: #1B2A4A

To customize colors, update `src/styles/variables.css`, `src/theme/muiTheme.js`, and CSS variables in `.module.css` files.

## Customization Guide

1. **Content**: Update data files in `src/data/` and hardcoded text in section components
2. **Branding**: Replace logo URL in `Header.jsx`, `Footer.jsx`, `MobileDrawer.jsx`, `Apply.jsx`, and `public/index.html`
3. **Contact Info**: Update `.env` file and `src/data/locationData.js`
4. **SEO**: Update meta tags, JSON-LD schemas, `src/config/seo.js`, and `public/sitemap.xml`
5. **Forms**: Applications POST to the server store (`/api/leads.php`) via `src/utils/applicationSubmit.js` — usually leave the default endpoint
6. **Analytics**: Set `REACT_APP_GTM_ID` in `.env` and update GTM ID in `public/index.html`
7. **Admin**: Update `REACT_APP_ADMIN_USERNAME` and `REACT_APP_ADMIN_PASSWORD` in `.env`

See `CUSTOMIZATION_GUIDE.md` for a complete step-by-step walkthrough, and `LAUNCH_NOTES.md` for
what must be configured before the campaign goes live.

## Documentation

- `LAUNCH_NOTES.md` — Pre-launch operator checklist (key rotation, Meta credentials, real content)
- `CUSTOMIZATION_GUIDE.md` — Quick-start guide for new landing pages
- `GTM_GUIDE.md` — Google Tag Manager setup
- `SEO_GUIDE.md` — SEO and schema configuration
- `update-prompts/README.md` — Canonical field schema + the lead-quality prompt series
- `CHANGELOG.md` — Detailed changelog

## DO NOT MODIFY

These files own behavior other code depends on. Extend around them; never edit them in place.

- `src/utils/webhookSubmit.js` — legacy drawer submit path
- `src/utils/validators.js` — shared validation contract (mirrored server-side in `leads.php`)
- `src/utils/swalHelper.js` — alert/confirm behavior
- `src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx` — retained drawer form
- `src/components/common/LeadFormDrawer/LeadFormDrawer.jsx` — drawer shell
- `src/context/ModalContext.jsx` — drawer/modal open-close behavior
- `src/components/common/MobileDrawer/MobileDrawer.jsx` and
  `src/components/common/MobileNavigation/MobileNavigation.jsx` — **open/close mechanics only**.
  Attaching an `onClick` to a link inside them is content, not mechanics, and is allowed.
- Component structure, layout, animations, video background system

Also treat as contracts (changing them breaks the funnel, the admin panel or reporting):

- **`src/utils/applicationSubmit.js` payload contract** — the exact keys, the shared `lead_id`
  across the partial and full submits, the `source` suffixes (`/step1-partial`, `/full`), and the
  attribution fields (`utm_*`, `gclid`, `fbclid`, `fbp`, `fbc`, `form_started_at`).
- **`/apply` step order** — Identity → Academics → Family & Funding → Logistics → Fees &
  Branch Choice (see above). The last step owns the submit via `isLastStep`, so appending or
  reordering steps moves it.
- **`capi-feedback.php` event names** — `QualifiedLead` and `Purchase`. Renaming them silently
  detaches every Meta custom audience, lookalike and optimisation rule built on them.
- **Status keys** in `src/admin/utils/leadStatus.js` and `src/admin/utils/telecallStatus.js` —
  only the human `label` may change, never the `value`.
