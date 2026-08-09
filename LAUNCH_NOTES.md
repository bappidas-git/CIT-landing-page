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
