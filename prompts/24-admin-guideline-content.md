# 24 — Admin Guideline / Help Content

**Prerequisite:** Read `prompts/00-cit-master-reference.md`. Complete prompt 23.

## Goal
Rebrand the in-admin guideline/help pages so screenshots, examples, and copy refer
to CIT admissions rather than Monjoven medical services.

## Files to edit
- `src/admin/pages/Guideline.jsx` (+ `.module.css`)
- `src/admin/pages/guidelineContent/DeploymentGuide.jsx`
- `src/admin/pages/guidelineContent/DeveloperGuide.jsx`
- `src/admin/pages/guidelineContent/GTMSetupGuide.jsx`
- `src/admin/pages/guidelineContent/GoogleAdsGuide.jsx`
- `src/admin/pages/guidelineContent/MetaAdsGuide.jsx`
- `src/admin/pages/guidelineContent/PabblySetupGuide.jsx`
- `src/admin/pages/guidelineContent/SEOSetupGuide.jsx`
- `src/admin/pages/guidelineContent/ConversionTrackingGuide.jsx`

## Requirements
1. Replace every Monjoven/medical reference (brand name, doctor, clinic, hair
   transplant, consultation, service examples, sample domains/emails) with CIT
   admission equivalents (e.g. example email `admin@cittumkur.org`, example
   conversion = "admission enquiry submitted", example course filters).
2. Keep all **technical instructions accurate** — GTM/Meta/Google Ads/Pabbly/SEO
   setup steps stay valid; only the brand-specific examples change. Do not alter
   real IDs or required env-var names.
3. Update any example lead-field names to the canonical course/state keys from
   prompt 23.
4. Swap teal/navy accent colours to CIT blue/amber where styled inline.

## Constraints
- Don't break the guideline routing/tab structure.
- Keep instructions technically correct; change only examples/branding.

## Acceptance criteria
- All guideline pages read as CIT admission docs; technical steps intact.
- `grep -ri "monjoven\|transplant\|porag\|neog" src/admin/pages/guidelineContent`
  returns nothing.
