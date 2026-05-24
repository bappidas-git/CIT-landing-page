# 10 — Header & Navigation

**Prerequisite:** Read `prompts/00-cit-master-reference.md`.

## Goal
Rebrand the sticky header: CIT logo, admission-focused anchor nav, phone + a
prominent **Apply Now** CTA.

## Files to edit
- `src/components/common/Header/Header.jsx`
- `src/components/common/Header/Header.module.css` (colour/spacing only as needed)

## Requirements
1. **Logo** → placehold.co logo, `https://placehold.co/200x60/FFFFFF/0B3D91?text=CIT+Logo`,
   alt text "CIT — Channabasaveshwara Institute of Technology". Wrap to scroll to
   top / hero.
2. **Nav links** → anchor links matching the new section IDs (set/confirm IDs in
   the section prompts): About, Courses, Placements, Campus, Contact. Keep the
   smooth-scroll behaviour the app already uses (hash scroll in `App.jsx`).
3. **Top-bar contact** → show primary phone `+91 88673 54168` (click-to-call) and
   optionally an accreditation strip ("NAAC • AICTE • VTU"). Keep it compact.
4. **Primary CTA button** → "Apply Now" → `openLeadDrawer('apply-now')`, styled
   with the amber accent. Keep GTM `trackCTAClick`.
5. Swap all colours from teal/navy to CIT blue/amber. Remove any Monjoven brand
   text, doctor name, or medical menu items.

## Constraints
- Do NOT change the mobile menu open/close mechanics or the `forceCloseMenu` prop
  contract with `App.jsx`.
- Keep header accessible (aria labels, keyboard focus).

## Acceptance criteria
- Header shows CIT logo, admission nav, phone, amber "Apply Now".
- Clicking nav links smooth-scrolls to the right sections.
- No medical/Monjoven text or teal colours remain.
