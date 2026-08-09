# 08 — Test Engine: Random 15+15 Delivery, 60-Second Timer, Server-Side Scoring, Resume

> **Series:** CIT Landing Page Repositioning (prompt 8 of 10). **Depends on:** prompt 06 (`public/api/question-bank.php`, 120 guarded questions) and prompt 07 (`/test` route with login/instructions/T&C + `public/api/test.php` with `action=login`). Extend those files — do not create parallel ones.
> **You are:** Claude Code in a fresh session with full repo access.

## The contract being built

30 questions per attempt (15 random unique Maths + 15 random unique Physics, order shuffled), **one question per screen**, visible 60-second countdown, Next records the chosen option, timeout auto-advances scoring 0, **no back navigation of any kind**, server-side scoring (+4 correct / 0 wrong / 0 blank, max 120), refresh/disconnect resumes at the current question, **one attempt per key** (key locks on completion). Correct answers must never reach the browser — not in any response, not in the bundle.

## Server — extend `public/api/test.php`

### Attempt record (in `public/api/data/test_attempts.json`, the store scaffolded in 07)

```
{
  "key": "CIT26-7K2MQ", "lead_id": "<uuid>",
  "started_at": "<iso>", "completed_at": null,
  "questions": [ { "qid": "M017", "subject": "maths",
                   "first_served_at": "<iso>|null",
                   "selected": null, "answered_at": null, "timed_out": false }, … 30 … ],
  "current": 0,
  "score": null, "maths_score": null, "physics_score": null,
  "correct_count": null, "wrong_count": null, "blank_count": null,
  "counselling_slot": null
}
```

Load the bank only server-side: `define('CIT_TEST_INTERNAL', true); $bank = require __DIR__ . '/question-bank.php';` — build a `qid → question` index. **Answers live only in the bank; the attempt stores `selected` indices and derives correctness at scoring time.**

### Timing model (be exact — prompt 09 and the admin rely on it)

- `GRACE_SECONDS = 15`. A question's clock starts at its **first** serving: stamp `first_served_at` when a question is first returned; never re-stamp on resume.
- An answer for question *i* is accepted only while `now − first_served_at ≤ 60 + GRACE_SECONDS`; later (or on explicit timeout) the question is finalised `selected: null, timed_out: true`.
- Serving a question returns `remaining_seconds = clamp(60 − elapsed, 0, 60)` so a resumed question shows the true remaining time, not a fresh 60.
- If a question is already out of time when it would be served (student vanished mid-question), finalise it server-side and advance until an in-time question (or completion) is found. Auto-advance is therefore **server-authoritative**; the client timer is UX.

### Actions to add

**`action=start`** — body `{key, tnc_accepted: true}`: resolve the lead by key (07's helper). If an attempt already exists → **do not create another**; behave like `state` (resume) — this is the one-attempt rule. Else: `tnc_accepted !== true` → `{"success":false,"error":"tnc_required"}`. Create the attempt: shuffle the 60 maths qids, take 15; same for physics; merge and shuffle the 30 (PHP `shuffle()`); persist under flock; `patch_lead(lead_id, {test_status: 'in_progress', test_started_at: now}, 'Merit test started')` (07's `patch_lead`); respond with the first question (serving shape below).

**`action=state`** — body `{key}`: no attempt → `{"success":true,"state":"not_started"}`. Completed → `{"success":true,"state":"completed","slot_booked":bool}`. Else finalise any overdue questions (rule above) and return the current question. **The resume path: a refreshed page calls this and lands exactly where it was.**

**`action=answer`** — body `{key, index, selected}` where `selected` ∈ 0–3 or `null` (client timeout): reject `index !== attempt.current` with `{"success":false,"error":"out_of_sync"}` + the current serving payload (client re-syncs; also the no-back enforcement — an old index can never overwrite). Within time → record `selected`/`answered_at`; out of time → finalise as timed out regardless of payload. Advance `current`; serve the next question, or if all 30 finalised → **score**.

**Serving shape** (from start/state/answer): `{"success":true,"state":"in_progress","question":{"index":n,"total":30,"subject":"maths","q":"…","options":["…","…","…","…"],"remaining_seconds":s}}` — qid stays server-side; `index`+`options` text only; **never `answer`, never `topic`/`difficulty`, never the full question list.**

**Scoring (server, on the 30th finalisation):** correct = bank answer === selected → +4; wrong/blank → 0. Persist `score` (0–120), per-subject splits, `correct_count`/`wrong_count`/`blank_count`, `completed_at`. Then `patch_lead(lead_id, {test_status: 'completed', test_score, test_maths_score, test_physics_score, test_correct_count, test_wrong_count, test_blank_count, test_completed_at}, 'Merit test completed — scored')` — the activity string is fixed: `'Merit test completed — scored'` (no score in the public-ish activity text; the admin reads the fields). Completion response: `{"success":true,"state":"completed","slot_booked":false}` — **no score to the student** (the cutoff is undecided; every student sees the same "if you qualify" messaging, prompt 09). The **qualification cutoff** is a single config constant: in `test.php`, `$qualifyCutoff = defined('TEST_QUALIFY_CUTOFF') ? (int) TEST_QUALIFY_CUTOFF : null;` (documented in `config.example.php` as commented-out; `null` = manual review in the admin panel — the default). Don't branch student-visible behavior on it yet; store it into the lead as `test_qualified: true|false` only when the constant is set.

Concurrency: every read-modify-write of the attempts file goes through the flock helper; keep the critical section tight (load → mutate → save in one lock via a `with_attempts_locked(fn)`-style helper if cleaner).

## Client — the engine screen in `src/pages/Test/`

Replace 07's placeholder with `TestEngine` (same route chunk; no new deps; no framer-motion/iconify):

- On mount (post-T&C `start`, or `Resume` from login) render from the serving payload. Elements: progress counter `Question 7 of 30` + subject tag (`Mathematics` / `Physics`), question text (plain text with Unicode notation — render inside `<p>`/`<pre>`-free normal flow, `white-space: pre-wrap` for safety), 4 full-width option buttons (radio semantics, 44 px+, selected state obvious), **Next** button (disabled until an option is chosen), and the countdown.
- **Countdown:** derive from a captured `deadline = Date.now() + remaining_seconds*1000`; tick with `setInterval` 250 ms; render seconds + a shrinking bar (CSS `transform: scaleX` — no layout thrash). Last 10 seconds: color shift + `aria-live="polite"` announcement. On reaching 0: immediately POST `answer` with `selected: null` and render the next serving payload. The countdown continues correctly across tab-backgrounding because it's deadline-based, not tick-counted.
- **Next:** POST `answer` with the chosen index; optimistic-disable the buttons while in flight; on `out_of_sync` re-sync silently to the returned serving payload; on network failure show a retry banner (the draft rule of `/apply` applies: never lose the student — the server clock keeps running, which the banner must say honestly: `Reconnect quickly — the question timer keeps running`).
- **No back:** no back button anywhere in the engine; the browser back button may leave the page — that's fine because resume works; add a `beforeunload` confirm while `in_progress` as a courtesy guard.
- **Resume:** if the engine mounts with an in-progress state (login said so), call `action=state` and continue. A refresh mid-question resumes the same question with the true remaining seconds.
- On `state: "completed"` hand off to the post-test screen (placeholder until prompt 09 — show `Test submitted. Evaluation in progress.` if 09 hasn't run).
- GTM (no PII, never the key): `merit_test_start` (on successful start), `merit_test_complete` (on completion response) via `trackApplicationStep` from `src/utils/gtm.js`.

## Lead fields written by the server (admin panel + prompt 10 read these — exact names)

`test_status` (`'in_progress'` → `'completed'`), `test_started_at`, `test_completed_at`, `test_score`, `test_maths_score`, `test_physics_score`, `test_correct_count`, `test_wrong_count`, `test_blank_count`, optional `test_qualified`. **None of these go into `lead_field_whitelist()` in `leads.php`** — they are server-authored via `patch_lead` only; a bot POSTing them to `action=create` must find them stripped (verify).

## Ground rules

- Mobile-first 360 px; the option buttons + Next must be reachable one-handed; timer visible without scrolling.
- Answers/keys never in any client payload, bundle, or log. No `console.log` of serving payloads.
- Update docs: CLAUDE.md (test engine contract: timing model, one-attempt, server-authoritative advance, lead fields list), CHANGELOG.
- DO NOT MODIFY the CLAUDE.md protected list; `leads.php` untouched in this prompt.

## Acceptance criteria (curl + two-browser manual run; `php -S localhost:8080 -t public`)

- [ ] `start` creates a 30-question attempt (15+15, no duplicate qids, shuffled order — create two attempts with two keys and confirm different question sets/orders); second `start` on the same key resumes instead of recreating.
- [ ] Serving payloads never contain `answer`/qid/topic; completion/login/state responses never contain scores; grep the built JS bundle for a bank question string → zero hits.
- [ ] Answer flow: correct index advances; `out_of_sync` on a stale index re-serves the current question; answering after 75 s records a timeout-blank; a question left overnight finalises and advances on the next `state`.
- [ ] Full 30-question run scores correctly (seed a known attempt by temporarily logging the drawn qids server-side during dev, verify +4/0/0 math against the bank, then remove the logging); lead record gains all the `test_*` fields + both activity entries (`Merit test started`, `Merit test completed — scored`).
- [ ] Refresh mid-question → same question, honest remaining seconds; completed key → login says `completed`, engine unreachable (one attempt).
- [ ] POSTing `test_score: 120` to `leads.php?action=create` does not store it.
- [ ] Timer UX at 360 px: countdown + bar + last-10s state render without jank; timeout auto-advance works with the tab backgrounded.
- [ ] `npm run build` passes; `/apply`, `/thank-you`, admin panel all unaffected.
