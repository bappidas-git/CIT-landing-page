# 07 — Test Platform Foundation: `/test` Route, Key Login, Instructions, T&C + `test.php`

> **Series:** CIT Landing Page Repositioning (prompt 7 of 10). **Depends on:** prompt 05 (login keys exist on leads). Prompt 08 builds the engine on top of exactly what you scaffold here — follow the API contract below precisely.
> **You are:** Claude Code in a fresh session with full repo access.

## What exists (verified context you must match)

- Leads live in `public/api/data/leads.json`; apply-funnel leads carry a server-assigned `login_key` (`CIT26-XXXXX`) after prompt 05. `public/api/leads.php` shows the house PHP conventions: single-file router on `?action=`, `flock(LOCK_EX)` writes via a `save_leads`-style helper, `now_iso()` (JS-compatible ISO), `merge_lead_array()` for append-only activity arrays, per-IP sliding-window rate limiter backed by a JSON file (fails open), CORS headers + `Cache-Control: no-store` (added in prompt 05), data dir auto-created with deny-all `.htaccess`.
- The React app: routes in `src/App.jsx` (`/`, `/apply`, `/thank-you`, `/admin/*`); `/apply` (`src/pages/Apply/`) is the pattern to copy for a lean route — lazy-loaded, **no framer-motion / sweetalert2 / iconify on the route**, native controls + inline SVG icons (`src/pages/Apply/fields.jsx`), CSS module, `updatePageSEO({ robots: 'noindex, nofollow' })` with cleanup restoring `index, follow` on unmount (see `Apply.jsx` ~384–397), 360-px-first.
- Thank-You (prompt 05) stores `sessionStorage.lead_login_key` and links to `/test`.

## Part A — `public/api/test.php` (NEW)

Standalone sibling endpoint (same style as `leads.php`/`telecalls.php` — small helpers duplicated per house convention, no shared lib file). Bootstrap:

- Headers: `Content-Type: application/json`, CORS trio matching leads.php, **`Cache-Control: no-store`**; OPTIONS short-circuit.
- Paths: `$dataDir = __DIR__ . '/data'`; auto-create with `.htaccess` deny-all + blank `index.html` (copy the leads.php block); files: `data/leads.json` (read + targeted write), `data/test_attempts.json` (this endpoint's own store), `data/test_ratelimit.json`.
- Helpers (copy the proven implementations from leads.php, renamed where sensible): `load_json($file)` / `save_json_locked($file, $data)` (the flock+truncate pattern), `now_iso()`, `merge_lead_array()` (for activity appends), `check_rate_limit()` (same sliding-window code).
- **Key/lead lookup:** `find_lead_by_key($key)` — normalise input (`strtoupper(trim())`), validate shape `/^CIT26-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{5}$/`, then scan `leads.json` for `login_key === $key`. Return the lead array or null.
- **Lead write-back:** `patch_lead($leadId, array $patch, ?string $activityAction)` — load leads under the flock helper, find by `lead_id`, apply scalar patch keys (last-write-wins), append the activity entry via `merge_lead_array`, bump `updated_at`, save. This is an **internal server-side write** — it does not go through `action=update` and needs no admin key; it must never touch `notes`.
- **No admin key anywhere on student-facing actions** — the login key *is* the credential. Never accept a `lead_id` from the client; always resolve through the key.

### Actions in this prompt

**`POST ?action=login`** — body `{ "key": "CIT26-XXXXX" }`:
1. Rate limit: max **30 login attempts per IP per hour** (own file, fails open, silently — over-limit answers the same generic error as an invalid key so nothing is enumerable).
2. Malformed/unknown key → `{"success": false, "error": "invalid_key"}` (HTTP 200; one generic error for both cases).
3. Known key → look at the attempt store (`test_attempts.json`, array of attempts keyed by `key`):
   - No attempt yet → `{"success": true, "state": "not_started", "student_name": "<lead.name>", "test": {"total": 30, "maths": 15, "physics": 15, "seconds_per_question": 60, "marks_correct": 4}}`.
   - Attempt exists, not completed → same shape with `"state": "in_progress"` plus `"question_index": <index of first unanswered>` (resume — prompt 08 consumes it).
   - Attempt completed → `"state": "completed"` plus `"completed_at"` and `"slot_booked": <bool>` (prompt 09 consumes it). **Never** include scores or answers in any login response.
4. Login itself writes nothing to the lead (a call is idempotent reconnaissance; the timeline event for starting comes with `action=start` in prompt 08).

**Unknown action** → 400 `{"error": "Unknown action"}` (mirror leads.php's fallthrough).

Leave a clearly-commented `// action=start / answer / state — implemented by the test-engine prompt (08); action=book_slot by prompt 09.` stub note so the next session extends this file rather than creating a second one.

## Part B — React route `/test` (`src/pages/Test/`)

New files: `src/pages/Test/Test.jsx`, `Test.module.css`, `index.js`, `preload.js` (mirror `src/pages/Apply/preload.js`), plus a small `fields.jsx`-style shared bits file **local to the route** (copy only the primitives/icons you need from `src/pages/Apply/fields.jsx` — house convention is per-route duplication, not cross-route imports).

Wire into `src/App.jsx`: `const TestPage = lazy(() => import('./pages/Test'));` + a `<Route path="/test" …>` next to the `/thank-you` route (same Suspense/SectionLoader pattern). Do **not** add `/test` to `public/sitemap.xml`; set `updatePageSEO({ title: '30-Minute Online Merit Assessment Test | CIT Tumakuru', robots: 'noindex, nofollow' })` with the same unmount-restore trick as `Apply.jsx`.

`Test.jsx` is a small screen-state machine: `login → instructions → tnc → engine (08) → done (09)`. Build screens 1–3 now; render a plain "The test engine arrives in the next update" placeholder where the engine mounts (prompt 08 replaces it).

**Screen 1 — Login.** Header: CIT logo (same `LOGO_URL` as Apply.jsx) + `CIT Merit-Based Selection Program 2026`. Title: `Enter your Test Login Key`. One masked input (auto-uppercase, accepts with/without the `CIT26-` prefix and re-adds it, maxlength fits `CIT26-XXXXX`, `inputMode` default, monospace, generous letter-spacing), pre-filled from `sessionStorage.lead_login_key` when present. Submit → `POST /api/test.php?action=login` (endpoint from `process.env.REACT_APP_TEST_API_URL || '/api/test.php'` — add the variable with a comment to `.env.example`). Handle: `invalid_key` → `That key doesn't look right. Check the key we showed you after your application, or call us — our team can re-share it.` (+ the support phone `+91 8069645014` as a `tel:` link tracked via `trackContactClick('phone', 'test_login')` from `src/utils/contactTracking.js`); network error → honest retry message. On success stash `{key, student_name, state, …}` in component state and route: `not_started` → instructions; `in_progress` → instructions with a `Resume test` primary button (skips T&C re-accept, jumps to the engine); `completed` → the completed/slot state (placeholder text now; prompt 09 fills it).
**Screen 2 — Instructions.** Greeting `Welcome, {student_name}.` then the exact rules, as a scannable list: `30 multiple-choice questions — 15 Mathematics + 15 Physics (Class-12 level)` · `60 seconds per question — the timer is always visible` · `+4 marks for every correct answer; 0 for wrong or unanswered — maximum 120` · `No going back to a previous question` · `If time runs out, the next question appears automatically` · `Total duration: about 30 minutes — keep a stable internet connection` · `One attempt only — your key locks after you finish` · `Your answers are saved as you go; if your connection drops, log in again with the same key to continue where you left off.` CTA → T&C screen.
**Screen 3 — Terms & Conditions.** Compact scrollable T&C (draft it; reasonable + plain-English): single attempt per Login Key; the attempt is personal — no external help, no second person answering; the timer/no-back rules are enforced by the server; scores are used only for the CIT Merit-Based Selection Program 2026 admission process; qualification is decided by CIT's admission team; submitted application data + test responses are processed per the site's privacy policy (CIT / marketing partner Assam Digital); attempting to manipulate the test cancels the attempt. Checkbox `I have read and accept the Terms & Conditions` (44 px target) gating a **`Start Test`** button. The button hands off to the engine state (placeholder for now) passing `{key, tnc_accepted: true}` — prompt 08's `action=start` consumes exactly that.

GTM: fire `pushDataLayer`-based events via `trackApplicationStep` from `src/utils/gtm.js` — `merit_test_login` (on successful login; no PII — never the key), and `merit_test_instructions_view`. (Prompt 08 adds start/complete events.)

## Ground rules

- Program naming fixed. Simple English. Mobile-first 360 px, 44 px targets, 16 px inputs; the whole flow must work one-handed on a budget Android.
- Route bundle discipline: no framer-motion/sweetalert2/iconify/MUI-popover on `/test` (match `/apply`).
- Server: never send answers/scores to the browser; never trust a client `lead_id`; generic errors only; `no-store` on every response.
- DO NOT MODIFY the CLAUDE.md do-not-modify list; no changes to `leads.php` in this prompt.
- Docs: CHANGELOG entry; extend CLAUDE.md's architecture notes with `/test` + `test.php` (route map, key-is-the-credential rule, attempt-store location).

## Acceptance criteria (`php -S localhost:8080 -t public` + CRA dev server; note CRA proxying — if the dev server can't reach PHP, test the API legs with curl and the UI with `REACT_APP_TEST_API_URL=http://localhost:8080/api/test.php`)

- [ ] `curl -X POST 'localhost:8080/api/test.php?action=login' -d '{"key":"CIT26-BOGUS"}'` → `{"success":false,"error":"invalid_key"}`; a real key from a seeded lead → `not_started` payload with the exact test-parameter block; responses carry `Cache-Control: no-store`; 31st attempt in an hour behaves like an invalid key.
- [ ] `/test` renders login → instructions → T&C on a 360 px viewport; key input uppercases and tolerates a pasted bare `XXXXX`; sessionStorage pre-fill works from a fresh `/apply` → `/thank-you` run.
- [ ] Start Test stays disabled until the checkbox is ticked; the engine placeholder mounts after it.
- [ ] `/test` is noindex and absent from the sitemap; leaving the route restores `index, follow`.
- [ ] `merit_test_login` / `merit_test_instructions_view` reach the dataLayer without any key/PII payload.
- [ ] `npm run build` passes; `/`, `/apply`, `/thank-you`, `/admin` all still work; `test_attempts.json` is not world-readable in the deployed layout (deny-all dir).
