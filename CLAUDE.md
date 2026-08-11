# CIT — Direct B.E. Engineering Admissions 2026

## Overview

A high-converting, mobile-first landing page for **Channabasaveshwara Institute of Technology (CIT), Tumkur** — built to capture quality leads for **Direct B.E. (Engineering) Admissions, 2026 intake**, targeted at students and parents **across India — Karnataka and Tumkur itself included — plus Nepal and Bhutan**, and run by Assam Digital. Built with React 18, Material UI, and Framer Motion. Includes an admin panel with lead management, a tele-calling lead module, GTM integration, Meta CAPI, and Google Ads conversion tracking.

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
4. **Logistics** (`StepLogistics`) — country, state/province, city/town, counselling mode, timeline, optional best time / email / message
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

### The first-visit admission notice

`src/components/common/AdmissionNoticeModal/` shows one popup — Session 2026 is closing,
`TOTAL_SEATS_LEFT` seats remain across the seven B.E. branches — after **10 seconds of visible
dwell** on the landing page. It is mounted inside `HomePageContent`, so it exists on `/` only
and can never interrupt `/apply`, `/thank-you` or a running merit test. Rules that must hold:

- **The countdown is visible time, not wall clock.** It accrues only while `document.hidden` is
  false and resumes where it paused — a page opened in a background tab has not been stayed on.
- **A skip is permanent.** X, "Not now", Escape and a backdrop tap all write
  `cit_admission_notice_dismissed` to **localStorage** (not sessionStorage — "again" means the
  next visit, not just this tab). Taking the CTA retires it too, and a visitor who already
  applied this session (`lead_login_key` / `lead_submitted`) never arms the timer.
- **The seat count is derived from `meritProgram.js`**, never typed into the component, so it
  cannot drift from the branch cards. No fee figures — the landing-page fee rule applies here
  like everywhere else.
- **It routes to `/apply` through `useApplyCTA('admission-notice')`**, like every other CTA, so
  the lead's `source` is `admission-notice/step1-partial` / `admission-notice/full` and popup
  leads stay separable in reporting. Do not point it at the drawer.
- **Keep it dependency-free and eagerly imported.** No framer-motion, iconify or MUI — a lazy
  chunk still downloading on a budget Android could lose the race with its own 10s timer, and
  eager mounting is only affordable while the component stays this small.

### Where the applicant lives

`src/data/geoOptions.js` is the single source for every location control: the four
`COUNTRY_OPTIONS` (India · Nepal · Bhutan · Other), all 36 Indian states and union
territories, Nepal's 7 provinces, Bhutan's 20 dzongkhags, and the flat
`TELECALL_REGION_OPTIONS` list the tele-calling module uses. `getStateOptions(country)` returns
`[]` for a country we carry no list for, and both forms then render the region as free text
rather than an empty dropdown; `getStateLabel(country)` supplies the matching label ("state" is
wrong in Kathmandu). Changing country clears the chosen state — a Bhutan dzongkhag must never
ship on an Indian application. `country` defaults to `India`, which is most of the traffic and
one control fewer to touch on a 360 px screen.

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
The engine screen lives in `src/pages/Test/TestEngine.jsx` and the post-test slot booking in
`src/pages/Test/PostTestScreen.jsx` — same route chunk. `done` and the returning-applicant
`completed` branch render the *same* `PostTestScreen`; only where its `completed_at` came from
differs.

### `test.php` rules that must hold

- **One generic error.** A malformed key, an unknown key and a rate-limited request all answer
  `{"success": false, "error": "invalid_key"}` with HTTP 200. Anything more specific turns the
  endpoint into an oracle for which keys exist. Login is rate-limited to **30 attempts per IP per
  hour** (`data/test_ratelimit.json`, fails open). `start` / `state` / `answer` charge that same
  budget **only when the key fails to resolve** — a running test makes ~30 calls, and CGNAT puts a
  whole district behind one address, so metering every call would lock real students out mid-paper.
- **Answers and scores never reach the browser.** No response from any action carries a correct
  option index, a qid, or a score. The completion response carries only paperwork the next screen
  needs — `completed_at`, `slot_booked`, and `slot` once booked — so nothing in it says how the
  applicant did, or could be compared between two applicants to infer it.
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
`completed` (+ `completed_at`, `slot_booked`, and `slot` once booked). Anything further on this
route — **extend `test.php`, never add a second endpoint**: the key-is-the-credential rule, the
attempt store and the rate-limit policy all live here and a second file would duplicate all three.

### The test engine (`start` · `state` · `answer`)

**The paper:** 15 random Maths + 15 random Physics qids drawn per attempt, merged and shuffled, so
no two applicants get the same 30 questions in the same order. The attempt stores qids and the
chosen option index only — correctness is derived from the bank at scoring time, so the attempts
file is not itself an answer key.

**The timing model is exact — the admin panel reads these numbers:**

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
`{"success": true, "state": "completed", "completed_at": "<iso>", "slot_booked": false}` —
**no score to the student**; the cutoff is the admission team's to apply.

### Slot booking (`action=book_slot`)

The last thing an applicant does on this route: pick the hour in which CIT's Counselling Officer
will call them. Body `{key, slot}`, `slot` an ISO **UTC** timestamp for the start of an hour.
Success is `{"success": true, "slot": "<canonical iso>"}`.

- **Write-once from the student side.** A second booking answers
  `{"success": true, "already_booked": true, "slot": "<stored iso>"}` and does **not** move the
  appointment — by then the officer has it in their day, so a change is a conversation with the
  telecaller. The admin panel may edit `counselling_slot` on the lead directly.
- **Office hours are part of the rule.** The counselling desk works **10:00–19:00 IST, every day
  of the week — Saturday and Sunday included**, so a bookable slot is an hour that starts at
  10:00…18:00 IST (the 18:00 slot runs to 19:00). The paper can be sat at any hour, so this is
  not decorative: an applicant finishing at 11 PM books 10 AM the next morning, not midnight.
  There is deliberately **no weekday check** — do not add one.
- **The hours are the officer's, not the device's.** `CIT_TEST_SLOT_TZ_OFFSET_SECONDS` (IST,
  UTC+05:30) is applied server-side, so a phone left on another timezone cannot book 10 AM local
  — which would be the middle of the night in Tumkur. India keeps no DST, so a fixed offset is
  exact.
- **The server re-derives the window; the browser's chip list is convenience.** A slot must parse
  as a UTC ISO timestamp, sit on an IST hour boundary inside office hours, fall inside
  `completed_at … completed_at + 24h`, and not already be in the past (5 minutes of slack for a
  fast phone clock). Otherwise `invalid_slot`. Before the paper is finished: `not_completed`.
- The **shape check runs before parsing** (`parse_client_iso`), because `strtotime()` accepts
  `tomorrow` and `+2 hours` — a lax parse would let a client name any instant it liked.
- "On the hour" is enforced as an **exact hour boundary in IST** (`slot_is_office_hour()`) — at
  :30 past the hour in UTC, since IST is UTC+05:30 and 4:00 PM in Tumkur is `10:30Z`. This
  replaced an older any-quarter-hour test, which existed to accommodate any timezone's hour and
  is now too loose: the appointment goes into an IST diary.
- Writes `counselling_slot` to the attempt **and** to the lead via `patch_lead()`, with the fixed
  activity string **`Counselling slot booked`** — the admin timeline renders on it.

Client side, `PostTestScreen` never shows a chip the server would refuse: it applies the same
three office-hour constants (**mirrored — change both files together**), expired hours drop off a
one-minute refresh, an expired selection clears itself, and an `invalid_slot` redraws the list and
asks for another pick. Once the 24 hours are gone it says so and hands off to the phone rather than
rendering an empty picker. Its times are formatted from the fixed IST offset rather than
`toLocaleString`, because a WebView without timezone data would silently print device-local time —
an applicant told the wrong hour is worse than an ugly one.

The two bounds always overlap, so a freshly finished applicant is never shown an empty picker: any
24-hour window contains a whole office day, which is **9 hours to choose from at every completion
time** (verified across every 10-minute completion time on four dates, including month, year and
leap-year boundaries).

**Lead fields the engine writes** (server-authored via `patch_lead` only): `test_status`
(`in_progress` → `completed`), `test_started_at`, `test_completed_at`, `test_score`,
`test_maths_score`, `test_physics_score`, `test_correct_count`, `test_wrong_count`,
`test_blank_count`, `counselling_slot` (ISO UTC, the booked call hour), and `test_qualified`
*only* when `TEST_QUALIFY_CUTOFF` is defined in `config.php` (it ships commented out — absent
means "not decided", where a stored `false` would read as "rejected"). **None of these are in
`lead_field_whitelist()` in `leads.php`**, so a bot POSTing `test_score: 120` to `?action=create`
finds it stripped. Activity strings are fixed: `Merit test started`,
`Merit test completed — scored` and `Counselling slot booked` — no marks in the timeline, which
gets read out to applicants over the phone.

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
| `merit_test_start` / `merit_test_complete` | Paper drawn; paper submitted | GTM only |
| `counselling_slot_booked` | Tele-counselling hour confirmed on `/test` | GTM only |
| `admission_notice` | First-visit popup shown, skipped or acted on | GTM only |

**GTM container owner:** the funnel now runs to **step 5** (`step_name: 'fees_branches'`), so
`application_step_view` and `application_step_complete` each fire one new step value. Add
triggers for them, and note that `application_step_complete` for the final step reports
`step: 5, step_name: 'fees_branches'` (it was `4` / `'logistics'`) — any trigger pinned to
step 4 as "application finished" must be re-pointed or it will silently stop firing. The
`merit_test_*` events also need triggers; they carry only `test_state`
(`not_started` | `in_progress` | `completed`). `counselling_slot_booked` needs one too and carries
**no parameters at all** — not the chosen hour, and certainly not the login key or the student's
name. **No `/test` event ever carries PII.**

`admission_notice` needs one trigger and covers the whole popup on its own: the stage rides in
`notice_action` (`view` | `dismiss` | `cta`) and a dismiss adds `dismiss_method`
(`close_button` | `not_now` | `escape` | `backdrop`). Its CTA separately fires the usual
`cta_click` as `apply_admission-notice`, so no extra trigger is needed to count the click.

Phone and WhatsApp taps go through **`src/utils/contactTracking.js` → `trackContactClick(channel, source)`**,
which fires all three legs from one call. Call it *instead of* `trackPhoneClick` /
`trackWhatsAppClick`, never alongside them, or the GTM event double-fires.

The browser pixel needs `REACT_APP_META_PIXEL_ID`; a GTM-only pixel does not fire this code's
events, and without it CAPI deduplication is inactive.

## Admin Panel — Merit Test & Selection surfaces

The panel is **read-only on everything the test writes.** `login_key`, the `test_*` block and
`counselling_slot` are authored server-side (`leads.php` issues the key; `test.php` writes the
rest through `patch_lead()`), and none of them are in `lead_field_whitelist()` — so unlike the
derived quality score, the admin can treat these numbers as fact. Admin writes still go only
through the existing `callLeadsApi('update', …)` path; there is no second endpoint.

`src/admin/utils/leadQuality.js` remains the single source for labels and now also owns
`getTestStatus()` / `getTestStatusConfig()`, `formatSlot()`, `formatScore()`,
`describeSlotTiming()`, `hasSelectionData()`, `AFFORDABILITY_LABELS` (+ long form) and
`shortBranch()` (derived from `MERIT_BRANCHES`, so short names can't drift from the fee table).

**`getTestStatus()` returns `null`, not `'not_started'`, for a lead with no `login_key`.** A
legacy enquiry or CSV-imported lead was never asked to sit the paper, so every surface shows it
nothing rather than branding it a no-show — the same rule that keeps unscored leads out of the
quality bands. Every new UI element is gated this way and must degrade to the pre-merit UI.

**Lead Management** (`LeadManagement.jsx`) — five columns after Quality: `login_key` (Key,
click-to-copy) · `test_status` (Test — chip, plus the score inline once completed) ·
`counselling_slot` (Call Slot) · `fee_affordability` and `branch_prefs` (both `hideTablet`).
`COLUMNS` drives the header only: body cells and the mobile card are hand-written and all three
must be kept in step. Sorting: `test_status` sorts state-then-score and is in
`DESC_FIRST_COLUMNS`; `counselling_slot` is deliberately **not** — the next call belongs on top
— and its ties break on `test_score` descending.

**Two telecaller queues** sit beside Refresh. *Push-to-test* = apply-funnel tier + holds a key +
test not completed, newest first. *Counselling* = completed papers by booked hour, unbooked last
and best score first among them. A preset is a saved position of the shared filter/sort state
plus **one predicate inside the same `loadData` filter chain** — never a parallel pipeline — and
any manual filter change clears the badge. `getLeadStats().awaitingTest` counts exactly the
push-to-test queue, so the Dashboard pair (`testsCompleted` / `awaitingTest`) agrees with it by
construction.

**Lead Detail** — one gated card, *Merit Test & Selection*, before Academic Details. The booked
hour leads it in a highlight box (overdue in red; "No slot chosen" in amber when a finished
applicant never picked one). `test_qualified` renders only when the field exists: it is written
solely when `TEST_QUALIFY_CUTOFF` is configured, and absent means "not decided", never
"rejected".

**CSV** — 14 columns after `FBCLID`; timestamps and `test_status` export raw. Import restores
them to the admin's own view, but `?action=create` strips `login_key` and every `test_*` field
even for an admin-keyed import, because they are absent from the server whitelist by design.
Re-importing an export is for reporting, never for replaying test results into the store.

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
- **Pan-India audience, one page.** The campaign runs across every Indian state (Karnataka and
  Tumkur itself included) plus Nepal and Bhutan, so no surface may address North East students
  as if they were the only audience. Where the region is genuinely relevant the phrasing is
  inclusive — "students from across India, including the North East" — never exclusive. The
  city is written **Tumkur** everywhere; "Tumakuru" survives only as an alternate spelling in
  the SEO keyword lists, because people still search it.
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
