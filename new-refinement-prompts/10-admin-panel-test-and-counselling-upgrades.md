# 10 — Admin Panel: Test & Counselling Upgrades, Telecaller Queues, Final QA + Deployment

> **Series:** CIT Landing Page Repositioning (prompt 10 of 10). **Depends on:** prompts 04 (form fields `fee_affordability`, `branch_pref_1/2`), 05 (`login_key`), 08 (`test_*` lead fields), 09 (`counselling_slot`). All of those write fields onto the lead; this prompt makes them visible and workable.
> **You are:** Claude Code in a fresh session with full repo access.

## Verified admin architecture (extend it — do not replace it)

- **Service:** `src/admin/utils/leadService.js` — in-memory `_cache` hydrated by `syncLeadsFromServer()` (GET `leads.php?action=list` with `X-Admin-Key` from `REACT_APP_LEADS_ADMIN_KEY`); mutations are optimistic + mirrored via `action=update` (server union-merges `notes`/`activity`, last-write-wins scalars); BroadcastChannel `lp_leads_channel` + `lp:leads-changed` DOM event for same-browser sync; CSV export/import at the bottom of the file.
- **List:** `src/admin/pages/LeadManagement.jsx` — `COLUMNS` array (~line 141) drives headers only; body cells AND the mobile card layout are hand-written and must be kept in step (the file says so). Filters: status/source/date + tier/quality/intake/funding dropdowns (~84–112, applied in `loadData` ~248). 15 s visibility-gated poll (~322–363) + `onLeadsChanged` (~370). Sorting: `sortedLeads` switch resolves derived values (~402); `DESC_FIRST_COLUMNS` (~119).
- **Detail:** `src/admin/pages/LeadDetail.jsx` — `InfoField` renders nothing when empty (~94); gated cards `hasAcademicDetails` (~547) / `hasFamilyFunding` (~634) / `hasLogistics` (~689); attribution card with copy-button pattern (`copiedField`, ~760); activity timeline rendered via `formatActivityAction`; same 15 s poll.
- **Labels:** `src/admin/utils/leadQuality.js` — all `*_LABELS` maps + chip configs (`{value,label,color,bg}` shape shared with `leadStatus.js`); field-presence tests. **Status keys in `src/admin/utils/leadStatus.js` are frozen** (only labels may change — don't touch them at all here).
- **Dashboard:** `src/admin/pages/Dashboard.jsx` reads `getLeadStats()`.
- Tests: `src/admin/utils/__tests__/csvRoundTrip.test.js` — must stay green.

## New lead fields to surface (written by earlier prompts; exact names)

`login_key` · `test_status` (`in_progress`/`completed`; absent = not started) · `test_score` (0–120) · `test_maths_score` · `test_physics_score` · `test_correct_count` / `test_wrong_count` / `test_blank_count` · `test_started_at` / `test_completed_at` · optional `test_qualified` · `counselling_slot` (ISO, on-the-hour) · `fee_affordability` (`own_income`/`education_loan`) · `branch_pref_1` / `branch_pref_2` (course strings).

## Part A — `src/admin/utils/leadQuality.js` additions (single source for labels, as the file's header demands)

- `AFFORDABILITY_LABELS = { own_income: 'Own income', education_loan: 'Needs loan' }` (+ a long-label map for the detail view using the two full option sentences from the form).
- `TEST_STATUS_OPTIONS` chip configs: `not_started` (grey `Not Started`), `in_progress` (amber `In Progress`), `completed` (green `Completed`); helper `getTestStatus(lead)` → `completed`/`in_progress` from `lead.test_status`, else `not_started` **only when** `lead.login_key` exists, else `null` (legacy leads show nothing); `getTestStatusConfig()`.
- `formatSlot(iso)` → `Sat 10 Aug, 4:00 PM` (en-IN); `formatScore(lead)` → `84/120` or `—`.
- Presence test `hasSelectionData(lead)` (any of key/test/slot/affordability/prefs) gating the new detail card.
- Short branch-name helper: map the 7 course strings to `CSE / AI & DS / ISE / ECE / EEE / Civil / Mech` (reuse `src/data/meritProgram.js` `MERIT_BRANCHES` — importing from `src/data/` into admin utils is established practice, e.g. leadQuality already imports from `src/utils/`).

## Part B — Lead Management list (`LeadManagement.jsx`)

1. **Columns** — insert after `quality`: `{ id: 'login_key', label: 'Key', width: 110 }` (monospace, click-to-copy with tooltip), `{ id: 'test_status', label: 'Test', sortable: true, width: 120 }` (status chip; when completed append the score: chip + `84/120`), `{ id: 'counselling_slot', label: 'Call Slot', sortable: true, width: 140 }`, and (hideTablet like eligibility/funding) `{ id: 'fee_affordability', label: 'Affordability', sortable: true, width: 120 }`, `{ id: 'branch_prefs', label: 'Pref Branches', width: 140 }` (short names `CSE → ECE`). Update **all three** hand-written surfaces: header (auto from COLUMNS), body cells, mobile card. Trim visual load: `email` can move to `hideTablet` if the table gets cramped — you decide, keeping ≤ ~1400 px comfortable.
2. **Sorting** — extend the `sortedLeads` switch: `test_status` (rank not_started < in_progress < completed, then score), `counselling_slot` (epoch; missing sorts last), `fee_affordability` (label), and add `test_status`+`counselling_slot` to `DESC_FIRST_COLUMNS` only if the natural first-click direction warrants it (slot: **asc** first — the next call belongs on top; leave it out of the desc set).
3. **Filters** — two new dropdowns following the existing pattern: Test (`All / Not Started / In Progress / Completed`) and Affordability (`All / Own income / Needs loan`), applied inside `loadData`'s filter chain (client-side, like tier/quality).
4. **Telecaller queue presets** — two one-tap buttons above the table (visually grouped with Refresh):
   - **"Push-to-test queue"** → tier ∈ {application, partial}, has `login_key`, test not completed; sort `submitted_at` desc. (Telecaller calls, re-shares the key from the list/detail, pushes them to attempt.)
   - **"Counselling queue"** → `test_status === 'completed'`; sort by `counselling_slot` asc (unbooked last), tie-break `test_score` desc. (Officer calls at the exact slot; highest scores first among unslotted.)
   Implement as preset state setters over the existing filter/sort state (a preset chip shows "active" and any manual filter change deactivates it) — no parallel filtering pipeline.
5. **Search** — extend `getLeads()` in `leadService.js` to also match `login_key` (exact/uppercase-insensitive contains).

## Part C — Lead Detail (`LeadDetail.jsx`)

New card **"Merit Test & Selection"**, placed before Academic Details, gated by `hasSelectionData`, using the `InfoField` + `cardTitle` pattern:
- **Login Key** — monospace + copy button (reuse the `copiedField` clipboard pattern from the attribution card ~760).
- **Test Status** chip; **Score** `84/120` with `Maths 44/60 · Physics 40/60`; `Correct 21 · Wrong 6 · Blank 3`; Started/Completed timestamps (`formatDate`).
- **Tele-Counselling Slot** — rendered prominently (highlight box, not a plain row): `formatSlot` + a relative hint (`in 3 hours` / `overdue`). If unbooked but test completed: `No slot chosen — fix a time on the call`.
- **Affordability** (full sentence label) + **Branch Preferences** (`1. CSE — … 2. ECE — …` full course names).
- Timeline: the server already appends `Test login key assigned` / `Merit test started` / `Merit test completed — scored` / `Counselling slot booked` activity entries — verify they render cleanly through `formatActivityAction` (no changes needed unless quoting breaks).

## Part D — CSV round-trip (`leadService.js`)

Append export headers (after `FBCLID`): `Login Key, Test Status, Test Score, Maths Score, Physics Score, Correct, Wrong, Blank, Test Started, Test Completed, Counselling Slot, Affordability, Branch Pref 1, Branch Pref 2` with matching row cells (raw ISO for timestamps; labels for affordability via the established `labelFor` + enum-map pattern). Extend `CSV_FIELD_MAP`, `CSV_ENUM_MAPS` (affordability), `CSV_NUMERIC_KEYS` (the five numeric test fields). `test_status` imports as the raw key. Run `CI=true npx react-scripts test -- --watchAll=false` — extend `csvRoundTrip.test.js` with one lead carrying the full new field set and keep everything green.

## Part E — Dashboard (`Dashboard.jsx` + `getLeadStats`)

Add two stat values to `getLeadStats()` (spam-exclusion honored): `testsCompleted` and `awaitingTest` (has key, not completed); surface them as one compact stat card pair on the Dashboard following its existing card pattern.

## Part F — Final end-to-end QA (execute it, don't just list it)

With `php -S localhost:8080 -t public` + the dev server (and `REACT_APP_LEADS_ADMIN_KEY`/`ADMIN_API_KEY` set locally):
1. `/apply` → complete all 5 steps → `/thank-you` shows a key → `leads.json` has the lead with `fee_affordability`, `branch_pref_1/2`, `login_key` + key-assigned activity.
2. `/test` → login with that key → T&C → complete a run (short-circuiting patience: answer every question quickly) → book a slot.
3. Admin `/admin/lms`: within one 15 s poll the lead shows key, Completed chip, score, slot; both queue presets surface the right leads; detail card complete; copy button works; CSV export→import round-trips the new columns; second browser tab updates via BroadcastChannel on a status change.
4. Regression: legacy lead (no new fields) renders exactly as before (presence gates hold); status change still fires the CAPI feedback path silently; delete/bulk actions fine; `npm run build` + tests green.

## Part G — Cloudways deployment notes (append to `LAUNCH_NOTES.md` as a new section "Merit-test rollout")

Document for the operator: upload order (`public/api/test.php`, `question-bank.php`, updated `leads.php` alongside the React build — server `config.php` and `api/data/` must NOT be overwritten or deleted by the deploy); after deploy verify from a phone: (a) `https://<site>/api/data/leads.json`, `login_keys.json`, `test_attempts.json` all return **403/404** — if any serves JSON, the nginx static layer is bypassing `.htaccess` and the operator must add a server-level deny rule before campaign launch; (b) `https://<site>/api/question-bank.php` returns 404 with empty body; (c) responses carry `Cache-Control: no-store`; (d) one real end-to-end run (apply → key → test → slot → visible in admin from a second device within 15 s); (e) optionally set `TEST_QUALIFY_CUTOFF` in `config.php` once the business fixes a passing score — until then qualification is manual review in the admin panel.

## Ground rules

- **Frozen:** status `value` keys in `leadStatus.js`; `capi-feedback.php` event names; polling/BroadcastChannel architecture; the CLAUDE.md do-not-modify list. New UI must degrade to exactly the old UI for leads without the new fields.
- All new writes from admin actions go through the existing `callLeadsApi('update', …)` path — no new endpoints here.
- Update CLAUDE.md (admin columns/queues summary) + CHANGELOG.
- `npm run build` and the jest suite must pass.

## Acceptance criteria

- [ ] Parts A–E implemented per spec; list/table/mobile-card/detail all show the new data; queues behave as defined; CSV round-trips; Dashboard counts correct.
- [ ] Part F executed end-to-end with a real local run — write the results into the final commit message.
- [ ] Part G section exists in `LAUNCH_NOTES.md`.
- [ ] Legacy leads and every pre-existing admin behavior unchanged; tests + build green.
