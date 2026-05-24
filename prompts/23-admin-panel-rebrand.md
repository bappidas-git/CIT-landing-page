# 23 — Admin Panel Rebrand & Lead Fields

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§10). Complete prompts 04-05.

## Goal
Rebrand the admin panel to CIT and make the lead views show the **course** and
**state** captured by the admission form, so the team can qualify leads.

## Files to edit
- `src/admin/components/AdminLogin.jsx` (+ `.module.css`)
- `src/admin/components/AdminTopbar.jsx` (+ `.module.css`)
- `src/admin/components/AdminLayout.jsx`
- `src/admin/pages/Dashboard.jsx` (+ `.module.css`)
- `src/admin/pages/LeadManagement.jsx` (+ `.module.css`)
- `src/admin/pages/LeadDetail.jsx` (+ `.module.css`)
- `src/admin/utils/leadService.js` (field mapping only)
- `src/admin/utils/adminAuth.js` (any branded strings)
- `src/admin/utils/googleAdsExport.js` (column headers if they reference service)

## Requirements
1. **Branding** → replace every "Monjoven"/medical string with "CIT Admissions"
   (login title, topbar brand, page headers, footer credit). Logo placeholder
   `?text=CIT+Admin`. Swap teal/navy to CIT blue/amber.
2. **Lead fields** → wherever the admin shows or exports a lead's
   `service_interest`, relabel the column/field to **"Course Interested"** and add
   the new **"State"** field. If prompt 04/05 renamed the key to `course_interest`,
   use that key here consistently (read + display + export + filters/search).
3. **Dashboard** → relabel any service-based metric/grouping to course-based
   (e.g. "Leads by Course"). Keep chart/stat logic; just change labels/keys.
4. **LeadManagement** → table columns: Name, Mobile, Email, Course, State, Source,
   Status, Date. Update any filter/search that referenced services to courses.
5. **LeadDetail** → show course + state; relabel medical terms.
6. **googleAdsExport.js** → CSV headers reflect course/state, not service.
7. Keep all data plumbing (localStorage keys, Pabbly admin webhook, leads API,
   status workflow, notes) untouched — change labels/keys/branding only.

## Constraints
- **Do NOT** alter auth flow, storage keys, webhook URLs, or the sync logic.
- Keep the existing key consistent with the public form (one canonical key).

## Acceptance criteria
- Admin is CIT-branded; login/topbar/dashboard/lead views show no medical text.
- Lead list & detail display Course + State; export columns match.
- `grep -ri "monjoven\|service_interest\|consultation" src/admin` returns nothing
  (unless `service_interest` was deliberately kept as the canonical key — then it
  must be labelled "Course" in the UI and used identically on the public side).
