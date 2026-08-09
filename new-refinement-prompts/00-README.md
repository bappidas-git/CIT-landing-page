# new-refinement-prompts/ — CIT Repositioning: Merit-Based Selection Program 2026

Third-generation prompt series for the CIT landing page. The first series (`prompts/00-25`)
built the page; the second (`update-prompts/01-06`) turned it into a high-intent application
funnel. **This series repositions the entire product** from "free guidance / direct admission"
to a selective, exam-like offer:

> **Session 2026 is almost closed — only 15 seats remain across 7 B.E. branches.** CIT fills
> them with talented students on merit through a **30-Minute Online Merit Assessment Test**
> (the **CIT Merit-Based Selection Program 2026**) — a second chance for students who could
> not clear JEE/KCET/COMEDK, without losing another academic year.

Each numbered prompt is **self-contained**: run it in a fresh Claude Code session with repo
access and zero memory of this folder's creation. Execute **strictly in order**; verify each
prompt's acceptance checklist (and `npm run build`) before moving on.

## Execution order

| # | File | Scope (one line) | Depends on |
|---|---|---|---|
| 01 | `01-hero-identity-and-disambiguation.md` | Hero rewrite ("CIT Engineering College, Near Bengaluru… Karnataka", not-Kokrajhar clarifier, recognitions strip, 15-seat merit headline) + `src/data/meritProgram.js` data module + head/SEO identity metadata | — |
| 02 | `02-landing-repositioning-copy.md` | Site-wide kill of free/direct-admission copy (full inventory embedded), 5-step "How the selection works", per-branch seats-left counters, FAQ rewrite + JSON-LD sync | 01 |
| 03 | `03-placements-and-results-showcase.md` | Last-3-years placements + VTU results sections built from the transcribed `resources/Info-1..7.jpeg` evidence (transcription embedded) | 02 |
| 04 | `04-lead-form-fee-affordability-step.md` | `/apply` Step 5: full fee tables (all figures embedded), affordability question (2 exact options), 80%-loan panel with worked ECE example, exactly-two branch preference; payload + `leads.php` whitelist + docs | 01 |
| 05 | `05-login-keys-and-thank-you-page.md` | Server-side login-key pool (seed 100, auto-extend, decoys on anti-bot paths), key on the lead + in the create response, Thank-You rebuild (key + Start-Test CTA) | 04 |
| 06 | `06-mcq-question-bank.md` | Author 120 original Class-12 MCQs (60 Maths + 60 Physics) in guarded `public/api/question-bank.php` — answers never leave the server | — |
| 07 | `07-test-platform-login-instructions-tnc.md` | `/test` route (login → instructions → T&C) + `public/api/test.php` foundation (`action=login`, rate limit, key-is-credential) | 05 |
| 08 | `08-test-engine-timer-scoring.md` | Random 15+15 delivery, one-question-per-screen 60 s flow, server-authoritative auto-advance, +4/0/0 scoring, resume, one attempt per key, `test_*` lead write-back | 06, 07 |
| 09 | `09-post-test-counselling-slot-booking.md` | Post-test screen: "if you qualify → call within 24 h", next-24-hours hourly slot picker, marksheets+parents instructions, `counselling_slot` on the lead | 08 |
| 10 | `10-admin-panel-test-and-counselling-upgrades.md` | Admin columns/filters/queues (push-to-test + counselling-by-slot), detail test card, CSV round-trip, Dashboard stats, executed end-to-end QA, Cloudways deployment notes | 04, 05, 08, 09 |

(06 has no dependencies — it can run any time before 08 — but keeping numeric order is simplest.)

## Architecture the prompts extend (verified against the code, 2026-08)

- **Lead store:** flat-file JSON `public/api/data/leads.json` behind `public/api/leads.php`
  (`?action=create|list|update|delete`); `flock(LOCK_EX)` writes; upsert by `lead_id`, silent
  duplicate-merge by `mobile`; field whitelist + honeypot/time-trap/suspicious-number/rate-limit
  anti-bot with success-indistinguishable responses; admin actions gated by `X-Admin-Key`
  (`ADMIN_API_KEY` in `public/api/config.php` ↔ `REACT_APP_LEADS_ADMIN_KEY`, no committed
  fallback → 503); data dir auto-created with deny-all `.htaccess`; `.gitignore` excludes
  `public/api/data/` and `config.php`.
- **Form:** `/apply` (4 steps → 5 after prompt 04), Step-1 partial submit + full submit sharing
  one `lead_id`; `source` = `<cta-key>/step1-partial|/full`; sessionStorage draft; localStorage
  retry queue; attribution (`utm_*`, gclid, fbclid, fbp, fbc, `form_started_at`) rides every payload.
- **Admin:** in-memory cache + 15 s visibility-gated poll + BroadcastChannel (`lp_leads_channel`);
  optimistic mutations mirrored via `action=update` (union-merge `notes`/`activity`,
  last-write-wins scalars). Status keys in `src/admin/utils/leadStatus.js` are frozen.
- **New in this series:** `public/api/test.php` (student-facing, login-key-authenticated),
  `public/api/question-bank.php` (guarded data-only PHP), `public/api/data/login_keys.json` +
  `test_attempts.json` (runtime, deny-all dir), `/test` route, `/thank-you` rebuild,
  `src/data/meritProgram.js` (seats + fees single source of truth).

## Canonical new lead fields introduced by this series

Flat on the lead object, alongside the existing schema in `update-prompts/README.md`
(prompt 04 appends the first three rows there; server-authored fields are documented in CLAUDE.md):

| Field | Values | Written by |
|---|---|---|
| `fee_affordability` | `own_income` \| `education_loan` | form Step 5 (04) |
| `branch_pref_1`, `branch_pref_2` | exact course strings (7 branches) | form Step 5 (04) |
| `login_key` | `CIT26-` + 5 chars of `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` | server, at create (05) — **never client-writable** |
| `test_status` | `in_progress` \| `completed` (absent = not started) | `test.php` (08) |
| `test_score`, `test_maths_score`, `test_physics_score`, `test_correct_count`, `test_wrong_count`, `test_blank_count`, `test_started_at`, `test_completed_at`, `test_qualified?` | numbers / ISO / bool | `test.php` (08) — never client-writable |
| `counselling_slot` | ISO, on the hour, within 24 h of completion | `test.php` (09) |

Fixed vocabulary: **"30-Minute Online Merit Assessment Test"**, **"CIT Merit-Based Selection
Program 2026"**, seats **15** (CSE 2 · AI & DS 2 · ISE 2 · ECE 2 · EEE 2 · Civil 3 · Mech 2),
marking **+4 / 0 / 0, max 120**, ₹ Indian number formatting everywhere.

## Open questions / conflicts found during analysis

1. **"No fee amounts anywhere on the public page" is superseded — scoped.** CLAUDE.md and
   `update-prompts/README.md` list it as a do-not-re-litigate decision; the new business spec
   requires full fee tables. Resolution encoded in the prompts: fee numbers appear **only inside
   `/apply` Step 5** (and its loan panel); landing sections still carry no numbers. Prompt 04
   updates both docs.
2. **Do-not-modify files contain dead "free" copy.** `UnifiedLeadForm.jsx` (~1202 `100% Free
   Guidance`, ~1213 `Limited 2026 Seats`) and `ModalContext.jsx` (~42 `Book a free counselling
   call`) are on CLAUDE.md's protected list. The drawer has **zero call sites** and never
   renders, so this copy is unreachable; the series deliberately leaves those files untouched.
   If the drawer is ever re-activated, this copy must be dealt with first.
3. **`Cache-Control: no-store` was assumed but is not present** in today's `leads.php` /
   `telecalls.php`. Prompt 05 adds it to `leads.php`; `test.php` ships with it from day one.
   `telecalls.php` left as-is (out of scope).
4. **Cloudways static-file risk:** `.htaccess` deny-all protects `api/data/` only if Apache
   serves the request; an nginx static layer could bypass it. That is why the question bank is
   a **guarded `.php`**, not a JSON. Prompt 10's deployment notes make the operator verify
   `leads.json`/`login_keys.json`/`test_attempts.json` are unreachable in production.
5. **Branch-name mapping:** the business spec says "Artificial Intelligence Engineering (AI)";
   on this site that branch is `B.E. — Artificial Intelligence & Data Science` (the existing
   `COURSE_OPTIONS` string, kept for admin/CSV compatibility). Spec's CSE/ISE/ECE/EEE/CV/MECH map
   1:1 to the existing seven branches.
6. **`resources/` posters disagree with each other** (80%+/85%+/86%+ placement; Z-Scaler
   highest CTC 14.00 vs 15.00 LPA and Bhoomi vs IDFC attribution; 21 vs 29 patents; ₹2 Cr vs
   ₹3 Cr grants). Resolution: keep the site's existing conservative claims (85%+ · 90+
   recruiters · 15 LPA highest · ~5 LPA median · 21 patents · ₹2 Cr) and use Info-1's year
   table without company-to-CTC attribution (prompt 03 embeds the full transcription).
7. **`intake_year` options (2027 / "just researching") vs "final closure 2026" copy.** Existing
   decision says the form question is a filter, not page copy — kept. Operator may want to
   drop the 2027 option later; not done in this series to avoid breaking quality scoring.
8. **`funding_plan` (Step 3) vs new `fee_affordability` (Step 5).** Deliberately both:
   funding *plan* before seeing numbers vs affordability *after* seeing them; telecallers get
   both signals, and removing `funding_plan` would break the quality score + CSV round-trip.
9. **Master-spec paths vs repo paths:** spec says `api/leads.php` / `api/data/`; the repo
   truth is `public/api/…` (deployed at `/api/…`). Spec's "≈10 keys/leads" wording aside, the
   key pool seeds 100 and auto-extends so lead capture can never fail on exhaustion.
10. **Two GTM funnel changes** need container-side attention after prompt 04: new
    `application_step_view/complete` events for step 5, and the completion event now reporting
    `step: 5, step_name: 'fees_branches'`. Prompts also add `merit_test_login/start/complete`,
    `counselling_slot_booked`. Existing event names/keys are unchanged.
11. **Out-of-scope leftovers flagged during analysis:** OG/Twitter images are still
    `placehold.co` placeholders; `serviceDetailsData.js` branch images likewise;
    testimonials remain `isLive: false` pending real consented quotes; admin guideline pages
    (`src/admin/pages/guidelineContent/`) still describe the old ad angles and should be
    refreshed by the operator after launch. None of these block the series.
12. **Rate-limit interplay:** each applicant costs 2 creates (partial + full) against
    `LEADS_RATE_LIMIT_MAX` (default 5/IP/hour) — unchanged and adequate; the test flow adds no
    creates. `test.php` gets its own 30/hour login limit.

## Verification ritual (every prompt)

`npm run build` must pass; when admin utils are touched, `CI=true npx react-scripts test -- --watchAll=false`
must pass; PHP legs are tested with `php -S localhost:8080 -t public` + curl; every prompt ends
with its own acceptance checklist — do not proceed to the next prompt with an unchecked box.
