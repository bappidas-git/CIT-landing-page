# 01 — Tracking Fixes, Attribution Capture & Lead API Hardening

**Prerequisite:** Read `update-prompts/README.md` (context, rules, canonical field
schema). No other prompt needs to run first.

## Goal

Fix every verified tracking bug, capture Meta attribution that is currently thrown
away, and harden the public lead endpoint against bots — all with **zero visible UI
change**. After this prompt, the data foundation is correct for the new application
funnel built in prompts 02–06.

## Files to edit

- **NEW** `src/utils/attribution.js` — fbclid/fbp/fbc + first-touch UTM persistence
- **NEW** `src/utils/applicationValidators.js` — unicode-safe + academic validators
- `src/utils/metaCAPI.js` — E.164 phone hashing, first/last name split (hashing scope only)
- `src/utils/enhancedConversions.js` — E.164 phone hashing (hashing scope only)
- `src/utils/gtm.js` — one-key fix: course value reaching the dataLayer
- `src/admin/utils/googleAdsExport.js` — status-key bug fix
- `src/admin/utils/leadService.js` — status-key bug fix (conversion metric only)
- `src/admin/pages/Dashboard.jsx` — status-key bug fix (conversion rate only)
- `public/api/leads.php` — server-side validation, honeypot, time-trap, rate
  limiting, silent duplicate merge, upsert-by-`lead_id`
- `public/api/config.example.php` — document new constants

## Requirements

### 1. Attribution utility — `src/utils/attribution.js` (new file)

Mirror the pattern of `src/utils/gclidManager.js` (localStorage, 90-day expiry):

1. `captureAttribution()` — called once on app load (add the call in `src/App.jsx`
   next to the existing gclid capture): persist first-touch values for `fbclid`
   (from URL), `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
   `utm_content` under localStorage key `cit_attribution` with a `captured_at`
   timestamp. First-touch: never overwrite an existing non-expired value.
2. `getAttribution()` — returns `{ fbclid, fbp, fbc, utm_source, utm_medium,
   utm_campaign, utm_term, utm_content }`. `fbp`/`fbc` are read live from the
   `_fbp`/`_fbc` cookies. Build `fbc` from stored fbclid when the cookie is absent:
   `fb.1.<captured_at ms>.<fbclid>`.
3. All reads/writes wrapped in try/catch (private-mode Safari throws on
   localStorage).

### 2. Unicode-safe + academic validators — `src/utils/applicationValidators.js` (new file)

Do NOT edit `src/utils/validators.js` (protected as form logic). New file exports:

1. `getUnicodeNameError(name)` — same messages as the existing name validator but
   regex `/^[\p{L}\p{M}\s.'-]{2,60}$/u` so Assamese/Bengali/Manipuri-script names
   pass.
2. `getMarksError(value)` — integer 0–100 required; message `"Enter marks out of 100"`.
3. `getPercentError(value, min = 35)` — number `min`–100, one decimal allowed.
4. `getYearError(value)` — 4-digit year 2015–2026; message `"Enter the year you passed 10th"`.
5. `getParentMobileError(parentMobile, studentMobile)` — reuse
   `INDIAN_MOBILE_REGEX` from `src/utils/validators.js`; additionally return
   `"Parent's number must be different from the student's number"` when equal.
6. `computeEligibility(subjects)` — input array of `{subject, marks}`; returns
   `{ percent, met, bestThird }` where `percent = (Physics + Mathematics + highest
   other subject) / 3` rounded to 1 decimal, `met = percent >= 45`. Return `null`
   unless Physics, Mathematics and at least one other subject have valid marks.
7. `isSuspiciousMobile(mobile)` — true for all-same-digit (`9999999999`) and
   straight ascending/descending sequences (`9876543210`, `6789012345`).

### 3. E.164 + name-split hash fixes

1. `src/utils/metaCAPI.js`: before SHA-256 hashing, normalize phone to E.164
   digits: 10-digit Indian numbers become `91XXXXXXXXXX` (strip `+`, spaces,
   leading `0`; if already 12 digits starting `91`, keep). Split the full name on
   whitespace: first token → `fn`, remaining tokens joined → `ln` (send `ln` only
   when non-empty — the PHP endpoint already accepts it).
2. `src/utils/enhancedConversions.js`: same phone normalization; Google expects
   `+91XXXXXXXXXX` format before hashing — include the `+`.
3. Touch ONLY the normalization/hash-prep code paths — no event names, no call
   signatures, no exports change.

### 4. Course-to-dataLayer fix — `src/utils/gtm.js`

`trackFormSubmission` currently reads `formData.investmentInterest`, but callers
pass `serviceInterest` — so the course is always empty in `lead_form_submission`
and `generate_lead`. Read `formData.serviceInterest` (keep a fallback to
`investmentInterest` for safety). Do not rename the dataLayer parameter itself.

### 5. `'converted'` status bug (three sites, one canonical value)

The canonical status set in `src/admin/utils/leadStatus.js` has NO `'converted'`
key — the conversion flow sets `'completed'`. Fix all filters that use
`status === 'converted'` to use `'completed'`:

1. `src/admin/utils/googleAdsExport.js` (all occurrences — the export currently
   always produces 0 rows).
2. `src/admin/utils/leadService.js` (conversion counting).
3. `src/admin/pages/Dashboard.jsx` (conversion-rate metric).

### 6. Server hardening — `public/api/leads.php`

Keep every existing endpoint contract working (the admin panel and
`webhookSubmit.js` must not need changes). Add to the `create` action, in order:

1. **Field whitelist:** accept only known lead keys — the existing keys plus every
   key in the canonical new-field schema (README table). Drop unknown keys.
   Enforce max lengths (strings ≤ 500 chars; `twelfth_subjects` ≤ 8 entries).
2. **Validation:** `name` non-empty; `mobile` must match `^[6-9][0-9]{9}$`.
   Reject (HTTP 400) when missing/invalid.
3. **Honeypot:** if the payload contains a non-empty `website` field (a hidden
   input the real form never fills), respond `{"success":true}` but store the lead
   with `lead_tier` forced to `'spam'`.
4. **Time-trap:** if `form_started_at` is present and `submitted_at` minus
   `form_started_at` is under 15 seconds, force `lead_tier` to `'spam'` (store,
   respond success).
5. **Suspicious-number flag:** same patterns as `isSuspiciousMobile()` — force
   `lead_tier` to `'spam'`.
6. **Rate limit:** max 5 creates per IP per hour, tracked in
   `api/data/ratelimit.json` (same locking pattern as `save_leads`). Over the
   limit → respond `{"success":true}` and discard. Never reveal the limit.
7. **Upsert by `lead_id`:** if an incoming `lead_id` matches an existing lead,
   MERGE instead of rejecting: scalar fields last-write-wins, `notes`/`activity`
   via the existing `merge_lead_array()`, and append an activity entry
   `"Application step completed"`. Respond `{"success":true}`. (This is how the
   Step-1 partial from prompt 02 is later completed into a full application.)
8. **Silent duplicate merge by mobile:** if `mobile` matches an existing lead with
   a DIFFERENT `lead_id`, do NOT insert a new lead and do NOT return
   `duplicate: true` (public enumeration vector — remove that response). Instead
   merge exactly as in (7) — new non-empty fields fill/overwrite the existing
   lead (never blank out an existing non-empty field with an empty one), append
   activity `"Re-enquiry / re-submission received"`, bump `updated_at`, respond
   plain `{"success":true}`. A repeat submitter is a hot lead, not an error.
9. **Key hygiene:** REMOVE the committed fallback admin key (the hardcoded
   `skdfjsdfweiormcnzxmzdlkfjds` default). When no key is configured via
   `config.php` or environment, `list`/`update`/`delete` return 503 exactly as the
   existing `require_admin_auth` already does. Add a comment block instructing the
   operator to set a fresh key in `config.php` AND update
   `REACT_APP_LEADS_ADMIN_KEY` in `.env` together, and to rotate the current
   compromised values. Document in `public/api/config.example.php`.

Note: `webhookSubmit.js` (protected, unchanged) will keep receiving plain
`{"success":true}` — its `result.duplicate` branch simply never triggers again,
which is the intended behavior.

## Constraints

- DO NOT modify `src/utils/webhookSubmit.js`, `src/utils/validators.js`,
  `src/utils/swalHelper.js`, `UnifiedLeadForm.jsx`, `LeadFormDrawer.jsx`,
  `ModalContext.jsx`.
- DO NOT rename any existing status key, dataLayer event name, or lead field.
- DO NOT change any UI. `npm run build` must pass.
- Keep the existing `leads.php` code style (procedural PHP, same helpers).

## Acceptance criteria

- [ ] `grep -rn "converted" src/admin/utils/googleAdsExport.js src/admin/utils/leadService.js src/admin/pages/Dashboard.jsx` → no `status === 'converted'` comparisons remain.
- [ ] `grep -n "investmentInterest" src/utils/gtm.js` → only as fallback; `serviceInterest` is read first.
- [ ] `grep -n "91" src/utils/metaCAPI.js src/utils/enhancedConversions.js` shows E.164 normalization before hashing.
- [ ] `grep -n "skdfjsdfweiormcnzxmzdlkfjds" public/api/leads.php` → no matches.
- [ ] `grep -n "duplicate" public/api/leads.php` → the create action no longer returns `duplicate: true`.
- [ ] `grep -n "fbclid" src/utils/attribution.js src/App.jsx` → capture wired on app load.
- [ ] New files exist: `src/utils/attribution.js`, `src/utils/applicationValidators.js`.
- [ ] `php -l public/api/leads.php` passes; `npm run build` passes.
- [ ] Manual: POST a create with `website: "x"` → success response, stored with `lead_tier: "spam"`. POST the same mobile twice with different `lead_id`s → one stored lead with a `"Re-enquiry / re-submission received"` activity entry.
