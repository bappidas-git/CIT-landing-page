# 05 — Unique Test Login Keys (Server-Side) + Thank-You Page Rebuild

> **Series:** CIT Landing Page Repositioning (prompt 5 of 10). **Depends on:** prompt 04 (5-step form; not strictly required to compile, but the funnel story assumes it).
> **You are:** Claude Code in a fresh session with full repo access.

## Goal

After submitting the application, the student is redirected to `/thank-you` showing a **unique Test Login Key** (large, copyable) and a **"Start Your 30-Minute Online Merit Assessment Test"** button. Keys are generated and assigned **server-side** in `public/api/leads.php`, written onto the lead record (so telecallers can re-share them from the admin panel), and returned in the create response. A key stays valid until the test is completed once (enforcement in prompts 07–08).

## Server side — extend `public/api/leads.php`

Architecture context (verified): `leads.php` is a single-file router; storage `public/api/data/leads.json` (dir auto-created with `.htaccess` "Require all denied" + blank `index.html`); writes go through `save_leads()` using `flock(LOCK_EX)` + truncate/rewrite; `now_iso()` emits JS-compatible ISO; `merge_into_lead()` handles upserts (by `lead_id`, then silent duplicate-merge by `mobile`); anti-bot paths (honeypot/time-trap/suspicious-number → `lead_tier: 'spam'`; over rate limit → request silently discarded with `{"success":true}`); responses are deliberately indistinguishable from success for bots. `.gitignore` excludes `public/api/data/` and `public/api/config.php`.

### 1. Key pool — `public/api/data/login_keys.json`

- Format: `CIT26-XXXXX` — 5 chars from the 32-char set `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (ambiguous `0 O 1 I` excluded). ~33.5M combinations.
- File shape: `[{ "key": "CIT26-7K2MQ", "lead_id": null, "assigned_at": null }, …]`.
- Helpers in `leads.php` (place near the existing helpers, reusing the exact `save_leads`-style flock pattern):
  - `generate_login_key()` — random 5 chars from the charset, prefixed.
  - `load_key_pool($file)` / `save_key_pool($file, $pool)` — flock like `save_leads`.
  - `seed_key_pool_if_missing($file)` — on first use, generate **100 unique** keys (uniqueness within the pool) and write the file. Never fails lead capture: on I/O failure fall through to on-the-fly generation.
  - `assign_login_key($file, $leadId)` — under one exclusive lock: seed if missing; find the first entry with `lead_id === null`, stamp `lead_id` + `assigned_at`; if none free, **auto-extend** the pool by 50 fresh unique keys and assign from those; return the key string. Uniqueness check on extension must cover existing keys.
  - `decoy_login_key()` — `generate_login_key()` result that is **never persisted**.

### 2. Assignment rules inside the `action=create` route (verified current flow at lines ~361–488)

- Assign a key **only** when the payload is an apply-funnel lead: incoming `lead_tier` is `'partial'` or `'application'` (drawer/CSV-import/legacy creates are not part of the test funnel and must not consume keys).
- **Fresh insert path** (~line 480): before appending, if eligible, `$lead['login_key'] = assign_login_key(...)` and append an activity entry `{action: 'Test login key assigned', status: 'new', timestamp: now_iso()}` via the existing `merge_lead_array` shape. Respond `{"success": true, "login_key": "<key>"}`.
- **Upsert-by-`lead_id` path** (~439–455) and **merge-by-mobile path** (~461–478): after merging, if the stored lead has no `login_key` and the incoming payload is eligible, assign one now (+ the activity entry). Respond with the stored lead's `login_key` (existing or just-assigned): `{"success": true, "login_key": "<key>"}`. This makes the full submit (2nd create on the same `lead_id`) return the key the Step-1 partial already earned — idempotent, never two keys for one lead.
- **Indistinguishability paths** — the anti-bot contract says a bot must learn nothing: rate-limit discard (~426), spam-vs-existing-lead early exits (~442–444, 464–467) currently return bare `{"success": true}` → return `{"success": true, "login_key": decoy_login_key()}` instead. A honeypot/time-trap lead that IS stored (as `lead_tier: 'spam'`, fresh insert) is not eligible (tier is spam) → also gets a decoy in the response. Humans never hit these paths; bots can't tell a decoy from a real key.
- **`login_key` must NOT be added to `lead_field_whitelist()`** — it is server-authored only; a client-supplied `login_key` in the create payload must be stripped (the whitelist already does this by omission). Admin `action=update` (admin-keyed, patches arbitrary keys) can correct one manually — that's fine and unchanged.
- While editing `leads.php`, add `header('Cache-Control: no-store');` next to the existing headers (~line 43) — admin list responses must never be cached by Varnish/any proxy. (Spec assumed this header existed; it doesn't yet.)

### 3. Client — `src/utils/applicationSubmit.js`

- `postLead()` (~131): parse the JSON body on `response.ok` (`const data = await response.json().catch(() => ({}))`) and return `{ success: true, login_key: data.login_key || '' }`.
- `submitFullApplication()` (~460): on success, alongside the existing `lead_submitted`/`lead_name` sessionStorage writes, store `sessionStorage.setItem('lead_login_key', result.login_key || '')` and `lead_lead_id` (the draft's `lead_id`) — the Thank-You page and `/test` handoff read these. Export the storage key names as constants (`THANKYOU_KEY_STORAGE = 'lead_login_key'`).
- `submitPartialApplication()` stays fire-and-forget, but attach `.then((r) => { if (r && r.login_key) sessionStorage.setItem('lead_login_key', r.login_key); })` so the key is already on-device if the full submit's response is lost mid-flight.
- Retry-queue flushes (`flushApplicationRetryQueue`) need no key handling — by then the visitor left; the telecaller path covers them.

## Thank-You page rebuild — `src/pages/ThankYou/ThankYou.jsx` (+ module.css)

Current page (verified): gated by `sessionStorage.lead_submitted` (redirects home if absent; flags cleared after 5 min), fires `virtualPageview` + `lead_form_submission_complete` dataLayer events, canvas-confetti celebration, "our team will call you shortly" copy, trust badges incl. `No consultancy or agent fees`, contact card (+91 8069645014 phone/WhatsApp), framer-motion/iconify (allowed on this lazy route).

Rebuild for the merit posture (serious, exam-like — **remove the confetti**; keep the gate, the two dataLayer events, `trackContactClick` on phone/WhatsApp links, and the SEO/noindex handling exactly as they are):

1. **Headline:** `Application received, {firstName}. Your next step: the test.` Sub: `Your application for the CIT Merit-Based Selection Program 2026 is in. Selection is on merit — the 30-Minute Online Merit Assessment Test decides who gets one of the 15 remaining seats.`
2. **Login-key card (the centerpiece):** label `Your unique Test Login Key`; the key rendered large (monospace, ~28px+, letter-spaced) with a **Copy** button (`navigator.clipboard.writeText` + "Copied ✓" feedback; clipboard API may be absent on old Android — fall back to a select-on-tap `<input readonly>`). Note under it: `Keep this key safe — you need it to enter the test. Our team can also re-share it with you on call.`
   - Read the key from `sessionStorage.lead_login_key`. **Fallback when empty** (older submission, storage blocked, decoy-path human): show the card with `Your Test Login Key will be shared by our admission team on WhatsApp/call shortly` — never a broken empty box.
3. **Primary CTA:** `Start Your 30-Minute Online Merit Assessment Test →` linking to `/test` (route exists after prompt 07; build the link now — a 404 until then is acceptable mid-series, note it in the commit message). Secondary: `I'll take it later` (link home) with the reminder that the key stays valid until the test is completed once.
4. **What-to-expect strip:** 30 MCQs (15 Maths + 15 Physics) · 60 seconds per question · +4 per correct answer, 0 for wrong/unanswered · no going back · one attempt · stable internet recommended.
5. Keep a compact contact card (phone/WhatsApp with existing tracking); update the WhatsApp prefill text to merit-program wording. Update `trustBadges` → `NAAC Accredited` / `AICTE Approved · VTU Affiliated` / `Merit-Based Selection — Session 2026`.
6. Session flags: keep the 5-minute cleanup for `lead_submitted`/`lead_name`, but **do not** auto-expire `lead_login_key` (the `/test` login screen pre-fills from it).

## Ground rules

- Program naming fixed ("30-Minute Online Merit Assessment Test", "CIT Merit-Based Selection Program 2026"). Simple English. Mobile-first 360 px.
- DO NOT MODIFY: `webhookSubmit.js`, `validators.js`, `swalHelper.js`, `UnifiedLeadForm.jsx`, `LeadFormDrawer.jsx`, `ModalContext.jsx`.
- leads.php contracts preserved: whitelist behavior, honeypot, time-trap, suspicious-number, rate limit, upsert/dedup semantics, 400 on truly invalid payloads, admin auth, CAPI feedback hook. Only the additions above.
- PHP style: match the file's existing conventions (guard clauses, `@`-silenced FS ops on bootstrap, comments explaining *why*).

## Acceptance criteria (test with `php -S localhost:8080 -t public` + the CRA dev server)

- [ ] First partial create → `login_keys.json` appears (100 seeded keys, deny-all `.htaccess` already covers the dir), one key assigned to the lead; response carries `login_key`; lead record in `leads.json` has `login_key` + `Test login key assigned` activity entry.
- [ ] Full submit (same `lead_id`) returns the **same** key; no second key consumed.
- [ ] A second, different lead gets a different key. Exhausting the pool (temporarily edit it down to 1 free key, then create 2 leads) auto-extends without failing capture.
- [ ] Spam-path responses (fill the honeypot) still return `{"success":true, "login_key":…}` with a decoy — byte-shape identical to real success; nothing about the response reveals the classification. Rate-limit discard likewise.
- [ ] A create with `login_key` injected in the payload does not store the attacker's value.
- [ ] `leads.php` responses now include `Cache-Control: no-store`.
- [ ] `/thank-you` shows the key large + Copy works (with fallback), the Start-Test CTA, the what-to-expect strip; the no-key fallback copy renders when sessionStorage is empty; no confetti; gate/redirect + both dataLayer events still fire; page still `noindex`.
- [ ] Legacy leads (no key) unaffected; admin panel still lists/updates/deletes; CSV import creates don't consume keys.
- [ ] `npm run build` passes.
