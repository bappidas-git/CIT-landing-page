# Launch Notes — CIT Direct B.E. Admissions 2026

Everything below must be done **before the first rupee of ad spend**. The code is
complete; these are the pieces only the operator can supply. The same checklist is
mirrored in the admin panel under **Guideline → Meta Ads → Launch Checklist**, so a
non-developer can follow it without the repo.

---

## 1. Rotate the admin API key (security — do this first)

The previous admin key was committed to this repository, so it is public knowledge
and must be treated as compromised. Both server stores now ship with **no fallback
key at all**: until one is configured, `leads.php` and `telecalls.php` answer `503`
on every admin action.

```bash
openssl rand -hex 32          # generate a fresh key
```

Set the **same value** in both places, then rebuild and redeploy:

| Where | Key |
|---|---|
| `public/api/config.php` (server, not committed) | `define('ADMIN_API_KEY', '<new key>');` |
| `.env` (build-time, baked into the bundle) | `REACT_APP_LEADS_ADMIN_KEY=<new key>` |

They must match exactly or the admin panel gets `401`s. `REACT_APP_*` values are
baked in at build time — editing `.env` on the server changes nothing until
`npm run build` runs again.

## 2. Meta pixel + CAPI credentials

In `public/api/config.php` (copy `config.example.php` if it does not exist yet):

```php
define('META_PIXEL_ID', '…');        // 15-digit ID from Events Manager
define('META_ACCESS_TOKEN', '…');    // Events Manager → Settings → Conversions API
define('META_API_VERSION', 'v19.0');
define('META_TEST_EVENT_CODE', '');  // blank in production
```

In `.env`, then rebuild:

```
REACT_APP_META_PIXEL_ID=<same 15-digit ID>
REACT_APP_META_CAPI_ENDPOINT=/api/meta-capi.php
REACT_APP_ENABLE_ANALYTICS=true
```

> **`REACT_APP_META_PIXEL_ID` is not optional.** Without it the code-level pixel
> never initialises, so `SubmitApplication` and `Contact` are never sent from the
> browser and **CAPI deduplication is not active** — server events still arrive but
> have no browser twin to match against. A pixel installed only through the GTM
> container does not satisfy this.

Missing Meta credentials are safe, not fatal: `capi-feedback.php` no-ops silently
and admin saves behave exactly as before.

## 3. Set the admission conversion value

```php
define('CONVERSION_VALUE_ADMISSION', 50000);   // ← replace with real value
```

This is the rupee value reported with the `Purchase` event when a lead is marked
**Seat Booked**, and it is what lets Meta optimise for revenue instead of lead
count. Set it to the real first-year revenue of one admission. It is internal — it
is only ever sent to Meta and is never rendered on the public page.

## 4. Real testimonials

`src/data/testimonialsData.js` ships with clearly-marked sample content and
`isLive: false`, so the section renders nothing. Collect real, consented student or
parent quotes, replace the samples, and set `isLive: true`. **Never publish invented
testimonials.**

## 5. Real recruiter logos

The recruiter wall in `src/components/sections/StatsSection/StatsSection.jsx` renders
company **name chips**; the machine-generated placeholder images are gone. Adding an
entry to `RECRUITER_LOGOS` (`'Infosys': 'https://…/infosys.svg'`) upgrades that chip
to a real logo. Anything without an entry stays a name chip, so a placeholder image
cannot ship by accident.

## 6. Weekly Google offline-conversion upload

The export that used to produce zero rows forever is fixed (it filters on the
canonical `completed` status key). Export the CSV from **Lead Management → Export
Google Ads Conversions** once a week and import it in Google Ads, so the Google
channel receives the same quality feedback Meta now gets automatically.

While you are there: the phone/WhatsApp `Contact` tracking also fires a Google Ads
call conversion, which needs its own **call conversion action** (Google Ads → Tools →
Conversions → New → Phone calls) with its ID and label in `.env`. Without it that leg
is a silent no-op; the Meta and GTM legs still work.

---

## 7. Merit-test rollout (Cloudways deployment)

The merit test adds three server files and two runtime data files. Everything
below is about **not destroying the server's own state on the way up** — the two
files the deploy must never touch are `public/api/config.php` (your keys) and
`public/api/data/` (leads, keys, attempts).

### Upload order

1. `public/api/question-bank.php` — the 120 MCQs. Upload it **before** `test.php`,
   so the endpoint is never live without its bank.
2. `public/api/test.php` — the merit-test API.
3. `public/api/leads.php` — the updated store (issues the `CIT26-XXXXX` login
   keys).
4. The React build (`build/` → web root) last, so the new front end never calls
   an endpoint that is not there yet.

> **Deploy with an "upload/overwrite changed files" sync — never a
> delete-then-upload of `public/api/`.** `config.php` is not in the repository
> and `api/data/` is created at runtime, so a mirror-style deploy that deletes
> anything absent from the local copy will take your admin key, your Meta
> credentials, every lead, every issued key and every test attempt with it.
> If your tool cannot exclude them, download `api/data/` first.

`api/data/` must stay writable by PHP (`755` on the folder is normal on
Cloudways). `leads.php` and `test.php` create `login_keys.json` and
`test_attempts.json` themselves on first use.

### Verify from a phone, on the real domain, before spending anything

**(a) The data folder must not be readable.** Open each of these:

```
https://<site>/api/data/leads.json
https://<site>/api/data/login_keys.json
https://<site>/api/data/test_attempts.json
```

Every one must answer **403 or 404**. Do this check **after** at least one lead
has been submitted, because `api/data/` and the `Deny from all` `.htaccess`
inside it are written by `leads.php` / `test.php` on first use — an empty folder
proves nothing. If any of them serves JSON, the nginx static layer is answering
before Apache ever reads that `.htaccess`, and your entire lead database —
names, mobile numbers, and every valid test key — is public.
**Stop and have Cloudways add a server-level deny rule for `/api/data/` before
the campaign launches.** This is the single highest-consequence check on this
page.

**(b) The question bank must be unreachable.** `https://<site>/api/question-bank.php`
must return **404 with an empty body**. Anything else — a PHP error, a blank 200,
a stack trace — means the `CIT_TEST_INTERNAL` guard is not doing its job and the
answer key is exposed.

**(c) No caching.** Response headers on `/api/leads.php` and `/api/test.php` must
carry `Cache-Control: no-store`. A CDN or page-cache layer in front of the API is
a correctness bug, not a performance win: cached login responses would hand one
applicant another's state.

**(d) One real end-to-end run.** From a phone on mobile data: `/apply` → complete
all five steps → `/thank-you` shows a key → `/test` with that key → accept the
T&C → answer a few questions → finish → book a call slot. Then, **on a different
device**, open the admin panel and confirm the lead shows its key, a **Completed**
chip with the score, and the booked slot within one 15-second poll. Check the
**Counselling queue** button puts that applicant in the right position.

**(e) The cutoff stays manual until the business fixes a number.**
`TEST_QUALIFY_CUTOFF` ships commented out in `config.php`. While it is unset, no
`test_qualified` verdict is written at all and the admission team applies the
cutoff by eye in the admin panel — which is the correct default, because an
absent field reads as "not decided" where a stored `false` would read as
"rejected". Set it only once the passing score is a real decision:

```php
define('TEST_QUALIFY_CUTOFF', 60);   // out of 120 — only when the business has decided
```

Existing attempts are not re-scored when you set it; the verdict is written at
completion time, so it applies to papers submitted from then on.

---

## Verifying the loop end to end

1. Set `META_TEST_EVENT_CODE` + `REACT_APP_META_TEST_EVENT_CODE` to the same test
   code and keep Events Manager → **Test Events** open.
2. Complete a full test application at `/apply`. Expect **two** `SubmitApplication`
   rows — one *Browser*, one *Server*, sharing an `event_id`, flagged deduplicated.
3. In the admin panel, set that lead's status to **Hot** → a `QualifiedLead` row
   appears with action source `system_generated` (Server only; there is no browser
   twin and that is correct).
4. Set it to **Seat Booked** → a `Purchase` row appears with `value` +
   `currency: INR`.
5. Re-saving the same status sends nothing. Events only fire on a genuine status
   change, and the event ID is deterministic so even a retry deduplicates.
6. Anything missing → read `public/api/data/capi-feedback.log`. Every failure is
   logged there with Meta's own error message.
7. Clear both test event codes before going live.
