# Changelog

All notable changes to the Landing Page Boilerplate project.

## [Unreleased]

### Admin panel — merit test, counselling slots and the two telecaller queues

Four prompts' worth of new lead fields (`login_key`, the `test_*` block,
`counselling_slot`, `fee_affordability`, `branch_pref_1/2`) were being written
server-side and read by nobody. They are now visible and, more to the point,
**workable**: the panel answers the two questions the team asks all day — *who
still owes us a paper*, and *who am I calling next and when*.

Everything is additive and gated on presence. A lead that predates the merit
program carries none of these fields and renders exactly as it did before —
verified against a legacy enquiry lead in the QA run below.

**Added — `src/admin/utils/leadQuality.js`** (still the single source for labels)
- `AFFORDABILITY_LABELS` (`Own income` / `Needs loan`) and
  `AFFORDABILITY_LONG_LABELS` (the applicant's own two sentences from Step 5).
- `TEST_STATUS_OPTIONS` chip configs — `Not Started` (grey) · `In Progress`
  (amber) · `Completed` (green) — with `getTestStatusConfig()`.
- `getTestStatus(lead)` resolves `completed` / `in_progress` from
  `lead.test_status`, falls back to `not_started` **only when the lead holds a
  login key**, and otherwise returns `null`. A legacy lead was never asked to
  sit the paper, so it shows nothing rather than being branded a no-show — the
  same reasoning that keeps unscored leads out of the quality bands.
- `getTestSortValue()`, `formatSlot()` (`Sat 10 Aug, 4:00 PM`, built from
  `formatToParts` so separators and AM/PM casing cannot drift with the browser's
  ICU build), `formatScore()` (`84/120`), `describeSlotTiming()`
  (`in 3 hours` / `overdue`), `hasSelectionData()`, and `shortBranch()` +
  `BRANCH_SHORT_LABELS` derived from `MERIT_BRANCHES` so the short names can
  never contradict the fee table.

**Added — Lead Management (`LeadManagement.jsx`)**
- Five columns after Quality: **Key** (monospace, click-to-copy),
  **Test** (status chip, plus the score inline once completed), **Call Slot**,
  and — tablet-hidden, like Eligibility and Funding — **Affordability** and
  **Pref Branches** (`CSE → ECE`). Header, body cells and the mobile card were
  all updated together, as the file's own note demands.
- Sorting for `test_status` (state, then score), `counselling_slot` (epoch,
  unbooked last) and `fee_affordability`. `test_status` joins
  `DESC_FIRST_COLUMNS`; `counselling_slot` deliberately does not, because the
  next call belongs at the top. Ties inside the slot column break on score
  descending — that is the entire ordering of the counselling queue's tail.
- Two filters, **Test** and **Affordability**, applied in the same client-side
  chain as tier/quality/intake/funding.
- **Two telecaller queue presets**, grouped with Refresh (and in the mobile
  overflow menu):
  - **Push-to-test queue** — apply-funnel leads holding a key whose paper is not
    finished, newest first. Call, re-share the key, get them to attempt it.
  - **Counselling queue** — finished papers by booked hour, next call on top;
    applicants who never chose a slot fall to the bottom, best score first.
  A preset is a saved position of the existing filter/sort state plus one extra
  predicate in the same filter chain — no parallel pipeline, so the table can
  never disagree with the chips. Touching any filter by hand drops the badge.
- `getLeads()` search now also matches `login_key`, case-insensitively and with
  or without the `CIT26-` prefix — how an applicant reads it back on a call.

**Added — Lead Detail (`LeadDetail.jsx`)**
- A **Merit Test & Selection** card before Academic Details, gated on
  `hasSelectionData`. The booked hour leads the card in a highlight box
  (green, red when overdue, amber "No slot chosen — fix a time on the call" when
  a finished applicant never picked one) because it is the only thing on the
  page with a deadline. Then the login key with a Copy button, the status chip,
  `84/120` with `Maths 44/60 · Physics 40/60` and `Correct 21 · Wrong 6 ·
  Blank 3`, both timestamps, the affordability sentence, and the two ranked
  branch choices in full.
- `test_qualified` renders as a Qualified / Below-cutoff chip **only** when the
  field exists — it is written solely when `TEST_QUALIFY_CUTOFF` is configured,
  and an absent field means "not decided", never "rejected".

**Added — CSV + Dashboard**
- 14 export columns after `FBCLID`: `Login Key`, `Test Status`, `Test Score`,
  `Maths Score`, `Physics Score`, `Correct`, `Wrong`, `Blank`, `Test Started`,
  `Test Completed`, `Counselling Slot`, `Affordability`, `Branch Pref 1`,
  `Branch Pref 2`. Timestamps and `test_status` go out raw so a re-import lands
  the same values; affordability round-trips through its label.
- **Import restores these columns to the admin's view, but the server will not
  take them back.** `login_key` and every `test_*` field are absent from
  `lead_field_whitelist()` in `leads.php` by design, so `?action=create` strips
  them even from an admin-keyed import. Re-importing an export is for reporting
  and for rebuilding a local view — never for replaying test results into the
  store. (`fee_affordability` and the branch preferences *are* whitelisted and
  do persist.)
- `getLeadStats()` gains `testsCompleted` and `awaitingTest` (holds a key, has
  not finished), both spam-excluded; the Dashboard renders them as a card pair.
  `awaitingTest` is exactly the push-to-test queue, so the two agree by
  construction.

**Verified** — `csvRoundTrip.test.js` covers a lead carrying the full new field
set, the "never sat the test" case and a legitimate zero score; suite green,
`npm run build` clean.

### Post-test tele-counselling slot booking

Finishing the paper is no longer the end of the funnel. The applicant now
leaves `/test` with an appointment: the hour in which CIT's Counselling Officer
will call them, chosen by them, inside the 24 hours after they submitted — and
written onto the lead so the officer calls at exactly that time.

Still no score anywhere. Every applicant reads the same conditional sentence
("**if** you qualify"), because the cutoff is the admission team's to apply.

**Added — `public/api/test.php`**
- `POST ?action=book_slot` — `{ key, slot }`, where `slot` is an ISO UTC
  timestamp for the start of an hour. Persists `counselling_slot` on the
  attempt, then stamps the same value on the lead through `patch_lead()` with
  the fixed activity entry `Counselling slot booked`. Answers
  `{"success": true, "slot": "<iso>"}`.
- **Write-once from the student side.** A second booking answers
  `{"success": true, "already_booked": true, "slot": "<stored iso>"}` and leaves
  the original untouched — by then the officer has the appointment in their day,
  so a change is a conversation with the telecaller, not a form. The admin panel
  can still edit `counselling_slot` on the lead directly.
- **The window is re-derived server-side; the browser's chip list is
  convenience, never the authority.** A slot must parse as a UTC ISO timestamp,
  sit on an hour boundary, fall inside `completed_at … completed_at + 24h`, and
  not already be in the past (5 minutes of slack for a phone clock that runs
  fast). Anything else → `{"success": false, "error": "invalid_slot"}`. Booking
  before the paper is finished → `not_completed`.
- The shape check runs **before** parsing, because `strtotime()` happily accepts
  `tomorrow` and `+2 hours` — a lax parse would let a client name any instant it
  liked where a timestamp belongs.
- "On the hour" is checked as a quarter-hour boundary in UTC. An hour boundary
  in the applicant's local time is not one in UTC — IST is UTC+05:30, so 4:00 PM
  in Tumakuru is `10:30Z` — and every real UTC offset is a whole number of
  quarter-hours, so this accepts every genuine hour start while still refusing
  arbitrary instants.
- Completed responses from `login`, `start`, `state` and `answer` now also carry
  `completed_at` (the post-test screen measures its 24-hour window from it) plus
  `slot_booked`, and `slot` once one is booked, so an applicant who logs back in
  sees their confirmed appointment instead of a picker that could only overwrite
  it. Still no score, no answers, no pass/fail.
- Helpers: `parse_client_iso()`, `validate_counselling_slot()`, `attempt_slot()`.

**Added — `src/pages/Test/PostTestScreen.jsx`**
- Replaces the completion placeholder. Header, the conditional qualification
  sentence, and an hourly picker: 24 chips grouped `Today` / `Tomorrow`, each
  reading as the hour it covers (`4:00 – 5:00 PM`), radio semantics, 44 px
  targets, two across at 360 px and three from 600 px.
- Confirmed state — also what a returning applicant lands on — states the
  appointment in full and adds the prep checklist: **10th & 12th marksheets**,
  **parents present**, **phone reachable, about 15 minutes**.
- Honest about the clock: chips whose hour has passed drop off a minute-ticking
  refresh, a selection that expires clears itself, and an `invalid_slot` from the
  server redraws the list and asks for another pick rather than dead-ending.
  When the 24 hours have run out entirely the screen says so and hands off to
  the phone — never an empty picker.
- Phone + WhatsApp on every branch, through
  `trackContactClick('phone'|'whatsapp', 'test_post')`.
- GTM: `counselling_slot_booked`, fired once and carrying **nothing** — no key,
  no name, no slot time.

**Changed**
- `src/pages/Test/TestEngine.jsx` passes the completion payload to
  `onCompleted(data)`, so the post-test screen gets `completed_at` without
  spending a second round-trip on it.
- `src/pages/Test/Test.jsx` drops `SubmittedScreen` / `CompletedScreen` for the
  one `PostTestScreen`; both ways in (straight off the last question, or a later
  login with a used key) land on the same screen.
- `src/pages/Test/fields.jsx` adds the icons the screen needs
  (`IconCalendarClock`, `IconCalendarCheck`, `IconDocument`, `IconFamily`,
  `IconPhone`, `IconWhatsApp`) — inline SVG paths, no iconify.

**GTM container owner:** `counselling_slot_booked` is a new event and needs a
trigger. It carries no parameters at all.

### Test engine — random 15+15 paper, 60-second clock, server-side scoring

The paper is now real. An applicant who accepts the terms gets 30 questions
drawn for them alone, one per screen, on a clock that belongs to the server —
and a score that never travels back to their browser.

**Added — `public/api/test.php`**
- `POST ?action=start` — `{ key, tnc_accepted: true }`. Draws 15 random
  Mathematics + 15 random Physics qids from the 120-question bank, merges and
  shuffles the 30, persists the attempt and serves question 1. **One attempt per
  key, for life:** a second `start` resumes the existing attempt instead of
  drawing a second paper. Stamps the lead `test_status: 'in_progress'` +
  `test_started_at` and appends the activity entry `Merit test started`.
- `POST ?action=state` — the resume path. Finalises anything that ran out of
  time while the applicant was away, then serves the current question with its
  **true** remaining seconds. A refresh mid-question lands on the same question,
  not a fresh minute.
- `POST ?action=answer` — `{ key, index, selected: 0-3 | null }`. Records the
  choice, advances, and scores the paper on the 30th finalisation. A stale
  `index` answers `{"success": false, "error": "out_of_sync"}` **plus the
  current serving payload**, which is both the client's re-sync path and the
  whole of the no-going-back rule: an old index can never overwrite an answer.
- The timing model, exact because prompt 09 and the admin panel read it: a
  question's 60-second clock starts at its **first** serving (`first_served_at`,
  never re-stamped on resume); an answer is accepted while
  `now − first_served_at ≤ 60 + 15` (`CIT_TEST_GRACE_SECONDS`, slack for slow
  networks and invisible to the client); serving returns
  `remaining_seconds = clamp(60 − elapsed, 0, 60)`. **Auto-advance is
  server-authoritative** — `advance_attempt()` finalises every overdue question
  (`selected: null, timed_out: true`) before anything else happens, so a student
  who shut the laptop on question 7 does not find question 7 waiting.
- Server-side scoring: +4 correct, 0 wrong, 0 blank, max 120. No negative
  marking, so a guess never costs anything. Correctness is derived from the bank
  against the stored option index — the attempts file never held an answer key.
  Persists `score`, per-subject splits and correct/wrong/blank counts, then
  stamps the lead with `test_status: 'completed'`, `test_score`,
  `test_maths_score`, `test_physics_score`, `test_correct_count`,
  `test_wrong_count`, `test_blank_count`, `test_completed_at` and the fixed
  activity entry `Merit test completed — scored` (no marks in the timeline — it
  gets read out to applicants over the phone).
- Optional `TEST_QUALIFY_CUTOFF` (documented commented-out in
  `config.example.php`): when set, a completed attempt also gets
  `test_qualified: true|false`. Unset — the default — means no automatic
  verdict and a human decides, which is not the same as a stored `false`.
  Nothing student-visible branches on it either way.
- Helpers: `with_attempts_locked()` (one `flock(LOCK_EX)` read-modify-write per
  request; `patch_lead()` runs *after* the lock releases so only one file is
  ever held), `question_bank_index()`, `draw_question_ids()`, `new_attempt()`,
  `advance_attempt()`, `serve_current_question()`, `score_attempt()`,
  `attempt_index_by_key()`, `attempt_is_complete()`, `question_is_final()`,
  `iso_to_epoch()`.

**Added — `src/pages/Test/TestEngine.jsx`**
- One question per screen: sticky question counter + subject tag + countdown
  (tabular figures, reserved width, no sideways twitch), a `scaleX`-only timer
  bar, the question in `pre-wrap` (the bank's Unicode notation is plain text),
  four 48 px radio-semantic option buttons, and Next — disabled until an option
  is chosen. No back control anywhere, plus a `beforeunload` courtesy confirm.
- The countdown is **deadline-based**, not tick-counted, so a backgrounded tab
  or a throttled timer still hits zero at the right moment. At zero it posts a
  blank and asks for the next question — it never scores anything.
- Last 10 seconds: colour shift plus a polite `aria-live` announcement (silent
  before that, so it does not drown out the question).
- `out_of_sync` re-syncs silently; a dropped connection shows a retry banner
  that says honestly that *the question timer keeps running*, and Retry re-sends
  exactly what failed.
- GTM: `merit_test_start` (on a start the server actually honoured) and
  `merit_test_complete`, both carrying only `test_state` — never the key, the
  name or any other PII.

**Changed**
- `attempt_question_index()` now skips timed-out questions too (a blank keeps
  `selected: null` forever, and would otherwise be reported as the resume point).
- `test_parameters()` reads the new `CIT_TEST_*` constants instead of repeating
  the numbers.
- `/test` gains a `done` screen — *"Test submitted. Evaluation in progress."* —
  distinct from the already-used-key screen. Prompt 09 replaces it with slot
  booking.

**Security**
- Serving payloads carry the option **text** only: no `answer`, no qid, no
  `topic` / `difficulty`, and never the full question list. The completion
  response is identical for every applicant — no score, no pass/fail.
- `start` / `state` / `answer` resolve the applicant from the key alone and
  charge the login rate-limit budget **only when the key fails to resolve** — a
  running test makes ~30 calls, and CGNAT would otherwise lock out a whole
  district mid-paper.
- The `test_*` fields are absent from `lead_field_whitelist()` in `leads.php`,
  so a bot POSTing `test_score: 120` to `?action=create` finds it stripped.
  Verified: zero bank strings in `build/static/`.

### Test platform foundation — `/test`, key login, instructions, T&C

The applicant now has somewhere to spend the key they were handed on
`/thank-you`. This is the scaffold the test engine mounts into: the route, the
login handshake and the two screens an applicant reads before committing to a
one-shot, no-going-back paper.

**Added**
- `public/api/test.php` — the merit-test API, a standalone sibling of
  `leads.php` / `telecalls.php` (same single-file `?action=` router,
  `flock(LOCK_EX)` writes, `now_iso()`, `merge_lead_array()`, sliding-window
  per-IP rate limiter, deny-all `data/` bootstrap, `Cache-Control: no-store`).
- `POST ?action=login` — takes `{ "key": "CIT26-XXXXX" }` and answers the
  attempt state that decides which screen `/test` shows: `not_started`,
  `in_progress` (plus `question_index`, the first unanswered question) or
  `completed` (plus `completed_at` and `slot_booked`). Every success carries
  `student_name` and the test-parameter block
  (`total` 30, `maths` 15, `physics` 15, `seconds_per_question` 60,
  `marks_correct` 4), which is what the instructions screen renders its numbers
  from — so the rules can never drift from the paper the engine serves.
- Helpers `find_lead_by_key()` (normalise → shape-check → scan `leads.json`),
  `patch_lead()` (internal server-side write-back: scalars last-write-wins,
  activity appended, `updated_at` bumped), `find_attempt_by_key()`,
  `attempt_question_index()`, `test_parameters()`, `respond_invalid_key()`.
- React route `/test` (`src/pages/Test/`) wired lazily in `App.jsx`:
  `Test.jsx` (login → instructions → tnc → engine → done state machine),
  `Test.module.css`, `fields.jsx` (route-local icons, the key mask and the two
  controls), `index.js` and `preload.js`.
- Login screen: one monospace, wide-tracked key field pre-filled from
  `sessionStorage.lead_login_key`, accepting the key typed or pasted with or
  without its `CIT26-` prefix, in any case, with or without separators. Failure
  offers the support number as a tracked `tel:` link.
- Instructions screen: the eight rules of the paper, and a **`Resume test`**
  primary button when the server reports an attempt already in progress.
- Terms & Conditions screen: seven plain-English clauses in a scrollable box,
  gated behind a 44 px checkbox — `Start Test` stays disabled until it is
  ticked, then hands `{ key, tnc_accepted: true }` to the engine.
- `REACT_APP_TEST_API_URL` (default `/api/test.php`) in `.env.example`.
- GTM: `merit_test_login` and `merit_test_instructions_view`, both carrying only
  `test_state` — never the key, the name or any other PII.

**Security**
- **The login key is the credential.** No admin key gates any student-facing
  action, and `test.php` never accepts a `lead_id` from the browser — a client
  that could name its own lead id could sit someone else's test. Every request
  resolves the applicant from the key alone.
- **One generic error.** A malformed key, an unknown key and a rate-limited
  request all answer `{"success": false, "error": "invalid_key"}` with HTTP 200,
  so the endpoint is not an oracle for which keys exist. Login is capped at
  **30 attempts per IP per hour** (`data/test_ratelimit.json`, fails open so a
  disk hiccup can never lock an applicant out).
- No login response carries questions, answers or scores, in any state.
- `?action=login` writes nothing: it is idempotent reconnaissance, so refreshing
  the login screen leaves no trace on the applicant's timeline.
- `patch_lead()` refuses to touch `notes` (the humans' column), `lead_id`,
  `submitted_at` and `login_key` — one lead keeps one key for life.
- `data/test_attempts.json` lives in the same deny-all `data/` folder as
  `leads.json`, and is keyed on the login key rather than the lead, so a
  re-issued lead record can never hand out a second attempt.
- `/test` is `noindex, nofollow` and deliberately absent from `sitemap.xml`;
  leaving the route restores `index, follow`.

**Notes**
- Route-bundle discipline matches `/apply`: no framer-motion, sweetalert2,
  iconify or MUI popovers on `/test`. Only the active screen is mounted, icons
  are inlined SVG paths, and the key field is 16 px+ so iOS does not zoom on
  focus. 360 px first, 44 px touch targets throughout.
- `action=start` / `answer` / `state` (test engine) and `action=book_slot` (slot
  booking) land in later updates. A commented stub in `test.php` marks the seam
  — extend that file rather than adding a second endpoint, because the login
  action, the attempt store and the key-is-the-credential rule are all there.

### MCQ question bank for the 30-Minute Online Merit Assessment Test

The merit test needs questions that actually discriminate, and answers that a
motivated applicant cannot read out of the page source. Both are settled here:
the bank is authored in full, and it lives in a PHP file that is executed rather
than served.

**Added**
- `public/api/question-bank.php` — **120 original MCQs**, 60 Mathematics
  (`M001`–`M060`) and 60 Physics (`P001`–`P060`), written fresh at Class-12 /
  engineering-entrance (JEE-Main / KCET) difficulty. Every question is solvable
  mentally or in two or three lines of rough work inside 60 seconds, which is
  what a 30-question / 30-minute paper demands.
- Row schema: `id`, `subject` (`maths` | `physics`), `topic` (lowercase slug),
  `difficulty` (`easy` | `medium` | `hard`), `q`, `options` (exactly 4 distinct
  non-empty strings), `answer` (int 0–3, index into `options`).
- Syllabus coverage follows the Class-12 weighting. **Maths:** relations &
  functions 4, inverse trigonometry 3, matrices 5, determinants 5, continuity &
  differentiability 6, applications of derivatives 6, integrals 7, applications
  of integrals 2, differential equations 4, vectors 5, 3-D geometry 4, linear
  programming 2, probability 7. **Physics:** electrostatics 7, current
  electricity 7, moving charges & magnetism 6, magnetism & matter 3,
  electromagnetic induction 5, alternating current 5, electromagnetic waves 2,
  ray optics 6, wave optics 4, dual nature of matter 4, atoms & nuclei 6,
  semiconductors 5.
- Difficulty mix of exactly **24 easy / 24 medium / 12 hard per subject**, and
  each answer index 0–3 is correct exactly **15 times per subject**, so the
  position of the correct option leaks nothing. Distractors are built from the
  common sign and formula errors for each question — no "all of the above", no
  "both A and B".

**Security**
- The bank is a **guarded PHP data file, not a JSON asset.** It opens with
  `if (!defined('CIT_TEST_INTERNAL')) { http_response_code(404); exit; }`, so a
  direct HTTP request returns a bare 404 with no body. A `.json` under `data/`
  would have depended on `.htaccess`, which Apache honours but a Cloudways nginx
  static-file layer can bypass; a `.php` file is executed, never served as
  source, on every PHP host.
- Correct answers are server-side only. The consuming endpoint defines
  `CIT_TEST_INTERNAL` before requiring the bank and strips `answer` (and
  optionally `topic` / `difficulty`) before anything is serialised to a browser.
  Nothing in `src/` references the file, so it can never reach a client bundle.

**Notes**
- Notation is plain text and Unicode only (`x²`, `√`, `π`, `θ`, `Ω`, `μ`, `°`,
  `×`, `·`, `−`, `≤`, `→`) — no LaTeX, no KaTeX, no HTML in any string — so the
  questions render with the existing stack and need no new dependency.
  Fractions are inline with explicit parentheses, matrices are row-listed as
  `[[a, b], [c, d]]`, vectors use `î, ĵ, k̂`, and every constant a student needs
  (`g`, `c`, `hc`, `μ₀`, `1/(4πε₀)`) is supplied inside the question.

### Unique test login keys + a Thank-You page that hands off to the test

An application is no longer the end of the funnel — it is the moment the
applicant is handed their credential for the merit test. The key is issued by
the server, so it cannot be guessed, forged or duplicated by anything the
browser sends.

**Added**
- Server-assigned **Test Login Keys** in `public/api/leads.php`. Format
  `CIT26-XXXXX`, 5 characters from a 32-char alphabet that excludes the
  ambiguous `0 O 1 I` so a telecaller can read one out over a bad line
  (~33.5M combinations). New helpers: `generate_login_key()`,
  `load_key_pool()` / `save_key_pool()`, `seed_key_pool_if_missing()`,
  `build_key_pool_entries()`, `assign_login_key()`, `ensure_login_key()`,
  `decoy_login_key()`, `is_key_eligible_lead()`.
- `public/api/data/login_keys.json` — the key ledger, seeded with 100 unassigned
  keys on first use and auto-extended by 50 whenever it runs dry, so a campaign
  that outruns the pool never costs a lead. Entries are
  `{ key, lead_id, assigned_at }`. It lives in the same deny-all `data/` folder
  as `leads.json` and is git-ignored.
- `?action=create` now answers `{"success": true, "login_key": "..."}`. A key is
  claimed only for apply-funnel leads (incoming `lead_tier` `partial` or
  `application`, untrusted requests only) — drawer enquiries, admin CSV imports
  and legacy creates never consume one.
- The assigned key is written onto the lead record with a
  `Test login key assigned` activity entry, so a telecaller can re-share it from
  the admin panel.
- `submitFullApplication()` returns the key and stashes it in sessionStorage
  (`lead_login_key`), alongside `lead_lead_id`. The Step-1 partial submit stashes
  it too, so the key is already on the device if the final response is lost
  mid-flight. Storage key names are exported as `THANKYOU_*_STORAGE` constants.
- `Cache-Control: no-store` on every `leads.php` response — lead data must never
  sit in a proxy or CDN cache.

**Changed**
- **`/thank-you` rebuilt around the key.** The applicant's key is the centerpiece
  (large monospace, tap-to-select readonly input, Copy button with a clipboard-API
  fallback for old Android), followed by the `Start Your 30-Minute Online Merit
  Assessment Test` CTA to `/test`, an `I'll take it later` link, the key-validity
  note, and a what-to-expect strip (30 MCQs · 60s per question · +4 per correct
  answer · no going back · one attempt). Trust badges now read NAAC / AICTE·VTU /
  Merit-Based Selection, and the WhatsApp prefill asks about the login key.
- The confetti celebration is gone. This is an exam handoff, not a party.
- Session flags: `lead_submitted` / `lead_name` still self-clear after 5 minutes,
  but `lead_login_key` deliberately survives — the `/test` login screen pre-fills
  from it.
- Anti-bot responses stay indistinguishable from success: the rate-limit discard
  and every spam path now answer with an **unpersisted decoy key**, so the create
  response is byte-shape identical whether a payload was stored, merged or
  silently dropped.

Unchanged by design: the field whitelist (`login_key` is deliberately *not* in
it, so a client-supplied value is dropped), honeypot, time-trap,
suspicious-number flagging, per-IP rate limiting, upsert/dedup semantics, admin
auth and the CAPI feedback hook. The Thank-You gate, its two dataLayer events and
its `noindex` handling are untouched.

Note: the `/test` route arrives in the next step of this series — until then the
Start-Test CTA points at a route that does not exist yet.

### `/apply` Step 5 — fee transparency, affordability and two ranked branches

The funnel asked how a family planned to pay before it had ever shown them a
number. A new final step closes that gap: the complete cost of the degree, then
the two questions that only mean something once it has been seen.

**Added**
- New `src/pages/Apply/steps/StepFeesBranches.jsx` — `/apply` becomes a **5-step**
  form, with "Fees & branch choice" appended after Logistics. It carries four
  blocks: an accordion of all 7 branches (year-wise tuition, 4-year tuition, total
  excluding hostel, total including hostel), a "Same for every branch" card for the
  three universal costs, the affordability question, and a two-branch ranked
  picker. Every figure is derived from `src/data/meritProgram.js` — nothing is
  hard-coded in the step, so a fee revision can never leave the form contradicting
  the rest of the site.
- `fee_affordability` (`'own_income'` | `'education_loan'`) — asked *after* the
  applicant has seen the real cost, which makes it a capability signal rather than
  the intention signal `funding_plan` (Step 3) already captures. Both are kept.
- `branch_pref_1` / `branch_pref_2` — exactly two distinct branches in order of
  preference, stored as the same em-dash course strings as `service_interest`.
  Preference 1 is pre-seeded from the Step-1 branch, first tap sets Preference 1,
  second sets Preference 2, a third is refused with a hint, and removing
  Preference 1 promotes Preference 2 into its place.
- Conditional education-loan panel, shown inline when the applicant answers
  `education_loan`: ~80% of the total study cost, the loan in the student's own
  name, repayment after the course from their own post-placement salary, and a
  worked B.E. ECE example (₹12,17,500 → ≈ ₹9,74,000 loan, ≈ ₹2,43,500 from the
  family, ≈ ₹12,600/month for 10 years at ~9.5% p.a.). The loan amount and EMI are
  computed, not typed, and the "indicative — the bank sets the final numbers"
  disclaimer sits in the panel rather than in a footnote.
- `fee_affordability`, `branch_pref_1` and `branch_pref_2` added to the
  `lead_field_whitelist()` in `public/api/leads.php` and to the canonical schema in
  `update-prompts/README.md`.

**Changed**
- Fee amounts are now allowed in exactly one place — `/apply` Step 5 and its loan
  panel. Every landing-page section still states no numbers; `CLAUDE.md` and
  `update-prompts/README.md` record the narrowed rule.
- `application_step_complete` for a finished application now reports
  `step: 5, step_name: 'fees_branches'` (was `4` / `'logistics'`). **A GTM trigger
  pinned to step 4 as "application finished" must be re-pointed.**
- Step 4's progress label "Almost done" → "Where & when" — with a step after it,
  the old label was untrue.
- Step 2 intro no longer claims eligibility is confirmed "instantly"; Step 3's
  reassurance now says the complete fee structure is shown on the final step of the
  form instead of promising it on a later call.
- `/apply` page title → "Apply — CIT Merit-Based Selection Program 2026".

Unchanged by design: the Step-1 partial payload and its `/step1-partial` source
suffix, the shared `lead_id` upsert, attribution fields, the honeypot, the retry
queue, and Steps 1–4. Drafts saved by the 4-step build rehydrate cleanly — the
three new keys layer in from the defaults.

### From an enquiry funnel to a high-intent application funnel

Meta was producing junk leads for a structural reason: it optimised on a
zero-friction `Lead` event and never received any quality feedback, the 5-field
enquiry form carried no qualification signal, the copy repeated "free" and fake
scarcity, and `?action=create` was public with no server-side validation. This
release addresses all four.

**High-Intent Application Funnel (New)**
- New full-page multi-step application at `/apply` — `src/pages/Apply/`
  (`Apply.jsx`, `fields.jsx`, `EligibilityBadge.jsx`, `preload.js`, and the four
  steps `StepIdentity`, `StepAcademics`, `StepFamilyFinance`, `StepLogistics`).
  Mobile-first at 360 px: only the active step is mounted, CSS-only transitions,
  no framer-motion / sweetalert2 / iconify on the route.
- Subject-marks entry with live eligibility computation
  ((Physics + Maths + best other) / 3) via `src/utils/applicationValidators.js`,
  surfaced by `EligibilityBadge`.
- Step-1 partial capture — completing Step 1 immediately writes a
  `lead_tier: 'partial'` lead, so a mid-form abandoner is still workable. The
  final submit re-posts the same `lead_id` and upgrades it to
  `lead_tier: 'application'` (`src/utils/applicationSubmit.js`).
- sessionStorage drafts plus a localStorage retry queue, so a dropped Jio
  connection never costs an applicant their answers or loses a completed
  application.
- `src/hooks/useApplyCTA.js` — the one CTA handler on the site: warms the
  `/apply` chunk on `pointerdown`, fires `cta_click`, and stashes the CTA key so
  each lead records which CTA produced it.
- Every CTA re-pointed to `/apply` (Header, Hero, CTASection,
  SecondaryCTASection, ContactSection, LocationSection, ServicesSection,
  FeaturesSection, WhyChooseCIT, MobileNavigation, MobileDrawer).
- New content sections: `FeesFundingSection` (transparency promise, no
  numbers), `AdmissionProcessSection`, `EligibilityStrip`, `FAQSection` with
  FAQ schema, and `TestimonialsSection` behind an `isLive` flag.
- Hero reworked from an embedded enquiry form into an application pitch card.

**Tracking Fixes**
- `SubmitApplication` added as a distinct Meta event for completed applications
  (`metaPixel.js`, `metaCAPI.js`, `meta-capi.php` whitelist) — pixel and CAPI
  share one `event_id` so the pair deduplicates.
- Fixed phone hashing for Meta/Google: numbers are now normalised to E.164
  (`91` + subscriber digits) before SHA-256 (`metaCAPI.js`,
  `enhancedConversions.js`). Previously hashed in a format Meta could not match.
- Fixed the Google Ads offline-conversion export, which filtered on a
  `'converted'` status that does not exist in `leadStatus.js` and therefore
  exported 0 rows forever — it now filters on the canonical `completed` key
  (`src/admin/utils/googleAdsExport.js`).
- Fixed the course → dataLayer key mismatch in `trackFormSubmission`, which was
  silently sending an empty `investmentInterest` (`src/utils/gtm.js`).
- New `src/utils/attribution.js` — first-touch persistence of `utm_*`, `gclid`,
  `fbclid`, `fbp` and `fbc`, so a visitor who lands on `/` with ad parameters and
  only then navigates to `/apply` keeps full attribution on the lead.
- Unicode-safe name validation, so applicants with non-ASCII names are no longer
  rejected.

**Lead API Hardening** (`public/api/leads.php`)
- Server-side field whitelist and length caps — unknown keys are dropped.
- Honeypot (`website`), read before the whitelist strips it and never stored.
- Time-trap on `submitted_at − form_started_at` (`LEADS_MIN_FORM_SECONDS`).
- Suspicious-number flagging (repeated-digit and straight-sequence mobiles).
- Sliding-window per-IP rate limiting (`LEADS_RATE_LIMIT_MAX` / `_WINDOW`),
  failing open on I/O trouble so infrastructure hiccups never drop real leads.
- Anti-bot rejections respond exactly like a success, so a bot learns nothing;
  flagged payloads are stored as `lead_tier: 'spam'` instead of being lost.
- Upsert by `lead_id` and silent duplicate merge by `mobile` — a re-submitter is
  a hot lead, not an error. The old `duplicate` response flag is gone; it was a
  public enumeration vector for stored phone numbers.
- Removed the committed fallback admin key from `leads.php` **and**
  `telecalls.php`. Both now answer `503` until `ADMIN_API_KEY` is configured —
  a default key that ships in the repository cannot gate anything.

**Admin Qualification Data**
- Lead detail regrouped into Academic Details / Family & Funding / Logistics
  with the full application payload rendered (`src/admin/pages/LeadDetail.jsx`).
- Lead quality score and lead-tier badges (`src/admin/utils/leadQuality.js`);
  partial leads are visually distinct and filterable.
- New list columns and filters (tier, eligibility, intake year, funding plan)
  plus updated search and CSV export (`LeadManagement.jsx`, `leadService.js`),
  covered by `src/admin/utils/__tests__/csvRoundTrip.test.js`.
- Dashboard counts split by lead tier.

**Meta Quality Feedback Loop**
- New `public/api/capi-feedback.php` — a shared server-side CAPI sender included
  by both stores. Telecaller verdicts now flow back to Meta: `contacted` / `hot`
  → `QualifiedLead`, `completed` / `seat_booked` → `Purchase` with
  `currency: INR` and a value from `CONVERSION_VALUE_ADMISSION`.
- Events fire only on a genuine status transition; `event_id` is
  `"{event}_{recordId}"` so retries deduplicate; `action_source` is
  `system_generated`.
- `user_data` is hashed server-side from the stored record only — never the
  admin's cookies, IP or user agent. The event is about the applicant, not the
  telecaller looking at it.
- Fire-and-forget with a 3s timeout after the HTTP response is flushed, so a
  slow or unreachable Meta can never block or fail an admin save. Failures land
  in `public/api/data/capi-feedback.log`; missing credentials are a silent no-op.
- New `src/utils/contactTracking.js` — `trackContactClick(channel, source)`
  fires GTM `phone_click`/`whatsapp_click`, the Meta Pixel `Contact` event and
  the Google Ads call conversion from one call site. The Meta and Google legs
  previously existed as dead code with zero callers; phone and WhatsApp taps
  were an invisible side door out of the funnel. Now wired at every `tel:` and
  WhatsApp surface (Header, Footer, MobileNavigation, MobileDrawer, Hero,
  WhyChooseCIT, CTASection, SecondaryCTASection, ContactSection, LocationSection,
  FAQSection, ThankYou and the `/apply` submit-error banner).
- `MetaAdsGuide` rewritten as a campaign playbook for this funnel: the
  three-tier optimisation-event model, the students 17-24 / parents 35-55 ad-set
  split across the 8 NE states, manual placements excluding Audience Network,
  eligibility-led creative guidance, quality-seeded lookalikes and Step-1-partial
  retargeting, an Events Manager verification walkthrough, and an operator
  launch checklist.
- New `LAUNCH_NOTES.md` — pre-launch operator runbook (rotate the admin key,
  configure Meta credentials and `CONVERSION_VALUE_ADMISSION`, supply real
  testimonials and recruiter logos, weekly Google offline-conversion upload).

**Removed**
- Placeholder recruiter logos. The wall rendered machine-generated
  `placehold.co` images, which read as a broken page to a parent choosing a
  college. It now renders name chips, and an image can only appear by adding
  licensed artwork to `RECRUITER_LOGOS` in `StatsSection.jsx`.
- The "PG & Research" block from `ContactSection.jsx` — the campaign sells B.E.
  2026 admission, and PG copy pulled traffic off that offer.
- Drawer reachability. `openLeadDrawer()` now has zero call sites, so the short
  enquiry form is no longer reachable from anywhere. `LeadFormDrawer`,
  `UnifiedLeadForm`, `ModalContext` and `webhookSubmit.js` stay in the repo
  untouched.
- "Free counselling" angles and fabricated scarcity from public copy.

### Server-side leads as the single source of truth (cross-device sync fix)

**Fixed**
- Leads now sync correctly across every browser and device. The public form
  writes each submission directly to the shared server store
  (`public/api/leads.php`), and the admin panel reads/writes only the server
  (auto-refreshing every 15s). Previously leads were kept in per-browser
  `localStorage` and never reliably reached the server, so the admin panel
  showed different data on different devices.
- `webhookSubmit.js` now `POST`s straight to `/api/leads.php?action=create`
  and reports honest success/failure; the lead is no longer stored only in the
  submitting browser.
- Duplicate prevention is now server-side (by mobile number), so it works
  across devices instead of per-browser.

**Removed**
- **Pabbly Connect** integration entirely — webhook URL, `USE_PABBLY` /
  `DUMMY_MODE` flags, the admin Pabbly mirror (`REACT_APP_ADMIN_PABBLY_WEBHOOK_URL`),
  `adminConfig.js`, the Pabbly setup guide tab, and `PABBLY_GUIDE.md`.
- All `localStorage` use for lead data (`lp_submitted_leads` / `lp_test_leads`).
  Per-device essentials (admin login session, theme preference, Google Ads
  gclid attribution) still use `localStorage` by design.

**Notes**
- Meta Pixel / CAPI and Google Ads tracking are kept (env-driven, IDs blank —
  ready for CIT's own Pixel/Ads IDs). No third-party/other-client IDs remain.
- Added a "Lead Storage" tab to the admin Guideline page documenting the new
  architecture.

## [1.0.0] - 2026-04-01

### Converted from Brand-Specific to Generic Boilerplate

**Content & Branding**
- Replaced all brand-specific text (company names, taglines, descriptions) with generic placeholder content
- Replaced all product images with `placehold.co` placeholder images
- Replaced all logo references with placeholder logo URLs
- Updated all contact info to generic `+91-XXXXXXXXXX` / `info@yourbusiness.com` patterns
- Updated all social media links to empty/placeholder values

**Data Files Renamed & Genericized**
- `servicesData.js` — Generic service/plan card data
- `serviceDetailsData.js` — Generic detailed service information
- `featuresData.js` — Generic feature categories and items
- `statsData.js` — Generic statistics/highlights
- `locationData.js` — Generic location and contact data

**Admin Panel (New)**
- Built admin authentication system with login page at `/admin/login`
- Created admin dashboard at `/admin/dashboard` with lead analytics
- Created admin layout with sidebar navigation and topbar
- Protected routes require authentication via `ProtectedRoute` component
- Admin credentials configurable via `.env` variables

**Lead Management System — LMS (New)**
- Built full-featured Lead Management page at `/admin/lms`
- Lead table with search, filter by status, sort, and pagination
- Status management (New, Contacted, Qualified, Converted, Lost)
- Notes system for adding per-lead notes
- CSV export functionality for offline use
- Google Ads offline conversion export format
- Conversion tracking data (mark as converted with value)
- Leads stored in localStorage (easily replaceable with backend API)

**GTM Integration (New)**
- Integrated Google Tag Manager with `initGTM()` utility
- Created `useGTMTracking` hook for automatic page-level tracking
- DataLayer events: `page_view`, `cta_click`, `generate_lead`, `scroll_depth`, `section_view`
- Engagement tracking via `EngagementTracker` component
- Google Consent Mode v2 support via `consentMode.js`
- Created `GTM_GUIDE.md` documentation

**Meta Conversions API — CAPI (New)**
- Browser-side Meta Pixel tracking via `metaPixel.js`
- Server-side CAPI endpoint at `public/api/meta-capi.php`
- Event deduplication via `eventDedup.js` (shared event IDs between browser & server)
- Test Event Code support for debugging in Meta Events Manager

**Google Ads Conversion Tracking (New)**
- Browser-side gtag.js conversion tracking via `googleAds.js`
- GCLID capture and persistent storage via `gclidManager.js`
- Enhanced conversions support via `enhancedConversions.js`
- Offline conversion import CSV export via `googleAdsExport.js`

**SEO System (New)**
- Dynamic SEO head management via `SEOHead` component
- Configurable schemas in `src/config/seo.js`
- JSON-LD structured data: Organization, LocalBusiness, FAQPage, BreadcrumbList, WebPage
- Proper meta tags, Open Graph, Twitter Cards in `index.html`
- `robots.txt` with admin route exclusions
- `sitemap.xml` template
- Created `SEO_GUIDE.md` documentation

**Webhook & Form System**
- Pabbly Connect webhook integration in `webhookSubmit.js`
- Dummy mode for local testing without webhook
- Lead duplicate prevention
- Multiple form sources tracked (hero, contact, drawer, secondary CTA)
- UTM parameter capture and GCLID enrichment
- Created `PABBLY_GUIDE.md` documentation

**Infrastructure & Performance**
- React 18 with concurrent features and lazy loading
- Idle-time section preloading via `requestIdleCallback`
- Error boundaries per section
- Web Vitals monitoring
- CSS Modules for component-scoped styles
- CSS custom properties in `variables.css`
- Responsive design with mobile-first approach
- PWA manifest and service worker support

**Files Added**
- `src/admin/` — Complete admin panel (components, pages, context, utils)
- `src/components/common/SEO/SEOHead.jsx` — Dynamic SEO management
- `src/components/common/EngagementTracker/EngagementTracker.jsx` — Analytics tracker
- `src/components/common/LeadFormDrawer/` — Slide-in lead form drawer
- `src/config/seo.js` — SEO configuration
- `src/hooks/useGTMTracking.js` — GTM tracking hook
- `src/utils/gtm.js` — GTM initialization
- `src/utils/consentMode.js` — Google Consent Mode
- `src/utils/metaPixel.js` — Meta Pixel helpers
- `src/utils/metaCAPI.js` — Meta CAPI client
- `src/utils/googleAds.js` — Google Ads tracking
- `src/utils/gclidManager.js` — GCLID persistence
- `src/utils/enhancedConversions.js` — Enhanced conversions
- `src/utils/eventDedup.js` — Event deduplication
- `public/api/meta-capi.php` — Server-side CAPI endpoint
- `public/api/google-offline-conversions.php` — Offline conversions endpoint
- `public/api/config.example.php` — API config template
- `PABBLY_GUIDE.md` — Pabbly webhook setup guide
- `GTM_GUIDE.md` — Google Tag Manager setup guide
- `SEO_GUIDE.md` — SEO configuration guide
- `CUSTOMIZATION_GUIDE.md` — Quick-start customization guide
- `CHANGELOG.md` — This file

**Dependencies Added**
- `canvas-confetti` — Thank You page confetti animation
- `react-router-dom` v7 — Client-side routing
- `react-intersection-observer` — Scroll-triggered animations
- `sweetalert2` + `sweetalert2-react-content` — Success/error modals
- `swiper` — Mobile carousels
- `@iconify/react` — MDI icon system
- `@mui/lab` — MUI experimental components
- `web-vitals` — Performance monitoring
