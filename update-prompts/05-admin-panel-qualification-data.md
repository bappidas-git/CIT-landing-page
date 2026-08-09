# 05 — Admin Panel: Qualification Data, Quality Score, Partial Leads

**Prerequisite:** `update-prompts/02-apply-multistep-application-form.md` completed
(leads now carry the canonical new fields). Read `update-prompts/README.md` —
use the exact field names from its schema table.

## Goal

Make every qualification field visible and actionable in the existing lead
management flow: telecallers must see at a glance who is a 2026-ready,
eligibility-met, funding-clear applicant vs a partial/abandoned or spam lead —
without changing the lead pipeline, statuses, or sync mechanics.

## Files to edit

- **NEW** `src/admin/utils/leadQuality.js` — quality score + tier helpers
- `src/admin/pages/LeadManagement.jsx` (+ `.module.css`) — columns, filters, mobile cards
- `src/admin/pages/LeadDetail.jsx` (+ `.module.css`) — grouped qualification cards
- `src/admin/utils/leadService.js` — CSV export/import quoting, search fields
- `src/admin/pages/Dashboard.jsx` — tier/quality metrics

## Requirements

### 1. `src/admin/utils/leadQuality.js` (new file)

1. `getLeadTier(lead)` → `'application' | 'partial' | 'spam' | 'enquiry'`
   (missing `lead_tier` → `'enquiry'` — legacy drawer leads).
2. `computeQualityScore(lead)` → 0–100 + band:
   - `intake_year === '2026'` +30; `'2027'` +10; `'researching'` 0.
   - `funding_plan` self_funded or education_loan +25; scholarship +10;
     need_discussion +5.
   - `eligibility_met === true` +20; `eligibility_percent >= 60` +5 bonus.
   - `admission_timeline` two_weeks +15; one_month +10; after_results +5.
   - valid `parent_mobile` differing from `mobile` +5.
   - Bands: ≥ 70 `hot`, 40–69 `warm`, < 40 `low`. Partial leads: score only on
     available fields, cap the band at `warm`.
3. `QUALITY_BANDS` config (label, color) following the visual pattern of
   `src/admin/utils/leadStatus.js` — do NOT touch `leadStatus.js` itself.
4. Score is computed on read in the admin (derived, never stored) — the client
   payload can be forged, so the score must not drive anything outside the
   admin UI.

### 2. Lead list — `LeadManagement.jsx`

1. Extend the `COLUMNS` config AND the corresponding body cells AND the mobile
   card layout (three separate hardcoded places in this file — update all
   three consistently): add **Tier** (chip: Application / Partial / Enquiry /
   Spam), **Quality** (band chip with score tooltip), **Intake** (`intake_year`),
   **Eligibility %** (`eligibility_percent`, ✔/– for met), **Funding**
   (short label). Keep the table horizontally scrollable on mobile per the
   existing pattern.
2. New filter controls beside the existing status filter: Tier (default:
   hide `spam`), Quality band, Intake year, Funding plan. Filters compose with
   the existing status filter and search.
3. Partial leads render with a subtle left-border accent + "Application
   incomplete — call to finish" hint in the row/card.
4. Default sort: existing submitted_at desc, but add a "Quality" sort option.

### 3. Lead detail — `LeadDetail.jsx`

1. Add three grouped cards below the existing contact/status area, rendered only
   when the lead has the relevant fields (legacy enquiry leads keep today's
   layout):
   - **Academic Details** — 12th: status, board, school, subjects+marks table
     (subject | marks / 100), computed aggregate with the same
     eligible/reserved/review wording as the form badge, `expected_band` when
     appearing; 10th: school, year, percentage.
   - **Family & Funding** — filled_by, parent name + click-to-call parent
     mobile (tel: link, same styling as the student number), funding plan
     (full label), WhatsApp-confirmed flag.
   - **Logistics** — state, district, counselling mode, admission timeline,
     best time to call, intake year.
2. Header area: Tier chip + Quality band chip (from `leadQuality.js`) beside the
   existing status `<Select>` dropdown (there is no status chip in the header —
   chips appear only inside the select's menu items).
3. Partial lead: amber banner `Application incomplete — the student stopped at
   Step 1. Call and complete the profile together.` The existing editable
   status/notes/activity flow applies to partials unchanged.
4. The existing "Source & UTM Data" card: extend its UTM display array with
   `fbclid`, `fbp`, `fbc` (render only when present).

### 4. CSV + search — `leadService.js`

1. `exportLeadsCSV`: append the new columns (tier, quality score+band computed
   at export time, intake_year, eligibility_percent, eligibility_met, funding
   plan, parent_name, parent_mobile, filled_by, twelfth_board, twelfth_school,
   twelfth_subjects flattened as `Physics:78; Mathematics:66; ...`, tenth fields,
   district, counselling_mode, admission_timeline, whatsapp_confirmed,
   fbclid). Export quoting is ALREADY RFC-4180-compliant (`escapeCSV` in
   `leadService.js` wraps and escapes every value) — do not rework it. The bug
   is in **`importLeadsCSV`**: both header and row parsing use a naive
   `split(",")` that corrupts on quoted/comma-containing values. Replace the
   import parsing with a proper quoted-CSV parser, keeping backward
   compatibility with previously exported files.
2. Search: extend the searched-fields list to include `parent_name`,
   `parent_mobile`, `district`, `twelfth_school`, `tenth_school`.

### 5. Dashboard — `Dashboard.jsx`

1. New stat cards: **Applications** (tier application), **Partials** (tier
   partial, with "recover by phone" sublabel), **Hot quality** (band hot count).
   Spam excluded from ALL dashboard metrics and from the recent-leads list
   (the dashboard has stat cards + a recent-leads table — there is no chart).
2. Keep every existing metric working (the conversion-rate fix landed in
   prompt 01).

## Constraints

- DO NOT modify `leadStatus.js` (status keys are frozen), the polling/sync
  mechanics, `BroadcastChannel` wiring, auth, or the server PHP files.
- Legacy leads (no new fields) must render exactly as today — every new UI
  element is conditional on field presence.
- Follow the existing admin visual language (chips, cards, module CSS patterns);
  admin pages remain desktop-first but must stay usable at 360 px per the
  existing responsive patterns.
- No new npm dependencies.

## Acceptance criteria

- [ ] `npm run build` passes.
- [ ] `grep -n "lead_tier\|intake_year\|funding_plan\|eligibility_percent" src/admin/pages/LeadManagement.jsx src/admin/pages/LeadDetail.jsx src/admin/utils/leadService.js` → wired in list, detail, and CSV.
- [ ] `grep -rn "computeQualityScore" src/admin` → score computed in admin only; `grep -rn "quality_score" src/utils src/pages` → no client-side storage of the score.
- [ ] CSV export of a lead whose message contains a comma re-imports without column shift.
- [ ] Manual: a legacy enquiry lead renders unchanged; a partial lead shows the amber banner and appears under the Partial filter; spam tier is hidden by default and excluded from Dashboard counts.
