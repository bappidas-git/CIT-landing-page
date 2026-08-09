# 09 — Post-Test Thank-You + 24-Hour Tele-Counselling Slot Booking

> **Series:** CIT Landing Page Repositioning (prompt 9 of 10). **Depends on:** prompt 08 (test engine writes `completed` attempts and `test_*` lead fields; the engine hands off to a completion placeholder that this prompt replaces).
> **You are:** Claude Code in a fresh session with full repo access.

## Goal

The moment a student finishes the 30-Minute Online Merit Assessment Test they see a post-test screen that (a) tells them **if they qualify, CIT's Counselling Officer will tele-counsel them within the next 24 hours**, (b) makes them **pick the best time to receive that call within the next 24 hours** (hourly slots), and (c) instructs them to **keep their marksheets ready and have their parents with them for the ~15-minute call**. The chosen slot is saved onto the lead so the officer calls at exactly that time (admin surfacing in prompt 10).

Scores are **never** shown to the student (qualification cutoff undecided — every student gets the same conditional messaging; contract set in prompt 08).

## Server — extend `public/api/test.php` with `action=book_slot`

Body `{key, slot}` where `slot` is an ISO timestamp for the **start of an hour**.

1. Resolve the attempt by key (07/08 helpers). No completed attempt → `{"success":false,"error":"not_completed"}`.
2. Already booked (`counselling_slot` set on the attempt) → `{"success":true,"already_booked":true,"slot":"<stored iso>"}` — booking is **write-once from the student side** (changes go through the telecaller; the admin can edit the lead field directly).
3. Validate server-side (never trust the client list): parse ISO; must be exactly on the hour; must satisfy `completed_at ≤ slot ≤ completed_at + 24h` **and** `slot ≥ now − 5min` (a student may book minutes after completing; a slot already in the past is invalid). Invalid → `{"success":false,"error":"invalid_slot"}`.
4. Persist under the flock helper: attempt `counselling_slot = slot`; then `patch_lead(lead_id, {counselling_slot: slot}, 'Counselling slot booked')` (activity text exactly `'Counselling slot booked'` — prompt 10's timeline rendering expects it).
5. Respond `{"success":true,"slot":"<iso>"}`.

Also update `action=login` / `action=state` completed responses (from 07/08): include `"slot_booked": bool` and, when booked, `"slot": "<iso>"` — so a student who logs back in sees their confirmed slot instead of the picker.

## Client — the post-test screen in `src/pages/Test/`

Replace the 08 completion placeholder with `PostTestScreen` (same route chunk, same constraints: no framer-motion/iconify, 360-px-first):

1. **Header:** `Test submitted, {student_name}.` — calm, serious; no confetti, no score.
2. **Qualification message (exact framing):** `Your answers are being evaluated. If you qualify, CIT's Counselling Officer will tele-counsel you within the next 24 hours — at the time you choose below.`
3. **Slot picker:** hourly slots from the next full hour after `completed_at` (client receives `completed_at`already? — derive the window from the server response of the completing `answer`/`state` call; if absent, request `state`). Render 24 options grouped `Today` / `Tomorrow`, each a chip `4:00 – 5:00 PM` (12-hour, en-IN), radio semantics, 44 px targets; a two-column grid at 360 px. Selecting + `Confirm my call time` → `POST ?action=book_slot`. Handle `invalid_slot` (stale list after midnight — refresh the window and re-render) and network retry honestly.
4. **Confirmed state** (also the re-login state when `slot_booked`): `Your tele-counselling call is booked for {slot, long format}.` plus the prep checklist:
   - `Keep your 10th & 12th marksheets with you.`
   - `Have your parents with you — the officer speaks to the family too.`
   - `Keep your phone reachable; the call takes about 15 minutes.`
5. **Support line:** the existing support phone `+91 8069645014` as `tel:`/WhatsApp links with `trackContactClick('phone'|'whatsapp', 'test_post')` from `src/utils/contactTracking.js`.
6. GTM: `counselling_slot_booked` via `trackApplicationStep` (payload: none beyond the event — no key, no PII, no slot time).

## Ground rules

- Naming fixed: "30-Minute Online Merit Assessment Test" / "CIT Merit-Based Selection Program 2026". Simple English; the student must understand the next step in one read.
- Server-side validation is the source of truth; the client list is convenience. `Cache-Control: no-store` on every response (already endpoint-wide).
- Timezone: render slots in the device's local time (IST audience); store ISO UTC; format with `toLocaleTimeString('en-IN', …)`.
- DO NOT MODIFY the CLAUDE.md protected list; no `leads.php` changes.
- Docs: CHANGELOG; CLAUDE.md test-flow section gains the slot-booking contract (`counselling_slot` lead field, write-once rule, activity string).

## Acceptance criteria (`php -S localhost:8080 -t public` + dev server)

- [ ] Completing a test (or logging in with a completed key) shows the post-test screen: conditional qualification message, hourly picker bounded to `completed_at + 24h`, marksheets/parents/15-minute instructions.
- [ ] Booking persists: attempt + lead both carry `counselling_slot`; lead activity shows `Counselling slot booked`; response and subsequent logins show the confirmed slot (picker gone).
- [ ] curl checks: slot in the past → `invalid_slot`; slot 25 h out → `invalid_slot`; slot not on the hour → `invalid_slot`; second booking → `already_booked` with the original slot; `book_slot` before completion → `not_completed`.
- [ ] Student never sees any score anywhere in the flow; responses contain no score fields.
- [ ] `counselling_slot_booked` reaches the dataLayer with no PII.
- [ ] 360 px pass on picker + confirmed states; `npm run build` passes; earlier flows (login/instructions/engine, `/apply`, admin) unaffected.
