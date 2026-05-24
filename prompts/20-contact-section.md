# 20 — Contact Section

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§2, §10).

## Goal
A clean contact band: CIT contact details + the unified lead form, so visitors can
convert or reach out directly.

## Files to edit
- `src/components/sections/ContactSection/ContactSection.jsx`
- `src/components/sections/ContactSection/ContactSection.module.css`

## Requirements
1. **Section label / title** → "Contact / Admissions" / "Talk to CIT's Admission
   Team". Set `id="contact"` for nav.
2. **Contact details** → all three phones (§2: 88673 54168, 93421 23255,
   98861 15105), emails (admin@ / hr@cittumkur.org), website, Tumakuru address,
   WhatsApp link. Click-to-call/WhatsApp on tap.
3. **Embedded form** → render `UnifiedLeadForm` with `source="contact"`,
   `formId="contact-form"`, course+state fields on, submit "Get Admission Details".
4. **Office hours / response promise** → "Our admission team responds within 24
   hours" (reassurance).
5. Optionally surface a single low-key line: "PG (M.Tech/MBA/MCA) & research
   programs also available — ask us." (Max allowed non-B.E. mention per §3.)
6. Swap colours to CIT blue/amber; remove clinic hours/medical copy.

## Constraints
- Keep the embedded form fully functional (it must submit & redirect).
- Mobile-first stacking of details + form.

## Acceptance criteria
- Contact shows CIT details + working admission form.
- No medical contact info / Monjoven remains.
