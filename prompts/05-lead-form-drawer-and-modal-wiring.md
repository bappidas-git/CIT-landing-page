# 05 — Lead Form Drawer, Secondary Form & Modal Wiring

**Prerequisite:** Read `prompts/00-cit-master-reference.md`. Complete prompt 04 first.

## Goal
Align every other lead-capture entry point (the drawer, the standalone
`LeadForm`, the webhook payload, and the contextual drawer titles) with the new
CIT admission form, so the conversion experience is consistent everywhere.

## Files to edit
- `src/context/ModalContext.jsx` (`DRAWER_TITLES` map + the "Monjoven drawer
  title configuration" comment)
- `src/components/common/LeadFormDrawer/LeadFormDrawer.jsx`
- `src/components/common/LeadForm/LeadForm.jsx` (the secondary/legacy form — bring
  it in line with the unified form fields/copy, or have it render
  `UnifiedLeadForm` if that is cleaner)
- `src/utils/webhookSubmit.js` (payload field mapping ONLY — keep the config,
  Pabbly/dummy logic, duplicate keys, and webhook URL handling untouched)

## Requirements
1. **`DRAWER_TITLES`** — rewrite each entry for admissions context:
   - `apply-now` → "Apply for 2026 Admission" / "Share your details — our team
     will guide you"
   - `get-details` → "Get Admission Details" / "Courses, fees, hostel & placements"
   - `request-callback` → "Request a Callback" / "Our admission team will call you"
   - `book-meeting` → "Talk to an Admission Counsellor" / "Book a free counselling call"
   - `download-brochure` → "Download CIT Brochure" / "Get the full 2026 prospectus"
   - `default` → "Enquire About Admission" / "Fill the form — we'll assist you"
   - Remove `investment-plans` (real-estate leftover) or repurpose to
     `fees-scholarship` → "Fees & Scholarship Info".
   - Update the file-top comment to reference CIT.
2. **`LeadFormDrawer.jsx`** — replace any Monjoven/medical title, subtitle, trust
   text, or phone with CIT equivalents. Ensure it passes the course+state fields
   through (it renders `UnifiedLeadForm`).
3. **`LeadForm.jsx`** — if it duplicates form markup, update its service options,
   labels, consent, success copy, and phone to match prompt 04. Prefer
   refactoring it to reuse `UnifiedLeadForm` to avoid drift.
4. **`webhookSubmit.js`** — ensure the lead payload carries `name`, `mobile`,
   `email`, the course value, `state`, `message`, and `source`. If prompt 04
   renamed `service_interest` → `course_interest`, mirror that key here. Keep the
   webhook URL, Pabbly toggle, dummy mode, and duplicate-prevention storage keys
   exactly as-is.

## Constraints
- Do NOT change webhook endpoints, Pabbly config flags, or duplicate-prevention.
- No medical/Monjoven copy anywhere in these files.

## Acceptance criteria
- Opening the drawer from any CTA shows CIT admission titles.
- A submitted lead's payload contains the course and state values.
- `grep -ri "monjoven\|consultation\|transplant" src/context src/components/common/LeadForm src/components/common/LeadFormDrawer src/utils/webhookSubmit.js`
  returns nothing.
