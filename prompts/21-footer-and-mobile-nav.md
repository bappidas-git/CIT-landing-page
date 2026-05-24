# 21 — Footer, Mobile Navigation & Mobile Drawer

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§2).

## Goal
Rebrand the footer and the mobile-only navigation/drawer so the whole shell is
CIT, with persistent admission CTAs on mobile.

## Files to edit
- `src/components/common/Footer/Footer.jsx` (+ `.module.css`)
- `src/components/common/MobileNavigation/MobileNavigation.jsx` (+ `.module.css`)
- `src/components/common/MobileDrawer/MobileDrawer.jsx` (+ `.module.css`)

## Requirements
1. **Footer:**
   - Logo placeholder (`?text=CIT+Logo`) + one-line description (NAAC-accredited
     engineering institute, Tumakuru; direct B.E. admission 2026 for NE students).
   - Quick links → the page anchors (About, Courses, Placements, Campus, Contact).
   - Contact column → Tumakuru address, all three phones, emails, website.
   - Accreditation strip: "NAAC Accredited • AICTE Approved • VTU Affiliated • ISO
     9001:2015". CET/COMED-K codes (E101 / E035) optional.
   - "Marketed by Assam Digital" small credit line is allowed.
   - Bottom bar: "© 2026 Channabasaveshwara Institute of Technology" + Privacy
     Policy link. Remove Monjoven socials (only add real CIT socials if known).
2. **MobileNavigation** (bottom bar) → keep mechanics; relabel actions to
   admissions (e.g. Call, WhatsApp, Apply/Enquiry → `openLeadDrawer`). Amber
   primary action.
3. **MobileDrawer** → CIT logo, nav links matching the header, phone/WhatsApp,
   and a prominent "Apply Now" button. Keep the `onBookConsultation`→ openLeadDrawer
   wiring but rename labels (the prop can stay; just change the visible text).
4. Swap colours to CIT blue/amber; remove all medical text and the doctor name.

## Constraints
- **Do NOT change** the drawer/bottom-nav open/close mechanics or props contract
  with `App.jsx` (per CLAUDE.md "DO NOT MODIFY" list — change content/labels only).
- Keep accessibility labels.

## Acceptance criteria
- Footer + mobile nav/drawer are fully CIT-branded with working CTAs.
- No Monjoven/medical text; CIT colours throughout.
