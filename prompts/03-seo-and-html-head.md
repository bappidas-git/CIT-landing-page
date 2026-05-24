# 03 — SEO Configuration & HTML Head

**Prerequisite:** Read `prompts/00-cit-master-reference.md`.

## Goal
Rebrand all SEO/metadata to CIT B.E. admissions and switch structured data from a
medical business to an **educational organization**, so the page is correctly
indexed and shareable.

## Files to edit
- `src/config/seo.js` (site name, titles, descriptions, FAQs, schema settings)
- `src/utils/seo.js` (any hardcoded Monjoven strings / schema type)
- `public/index.html` (title, meta description, OG/Twitter tags, favicon refs,
  any inline GTM comment, theme-color, preconnect)
- `public/robots.txt` (sitemap URL / host)
- `public/sitemap.xml` (URLs → cittumkur admissions domain or a placeholder)

## Requirements
1. **`seo.js` site-level:**
   - `siteName: "CIT Admissions"`, `siteUrl` → use `https://www.cittumkur.org`
     (or a campaign subdomain placeholder).
   - `defaultTitle: "CIT Tumakuru | Direct B.E. Engineering Admission 2026 — North East India"`
   - `titleTemplate: "%s | CIT Tumakuru"`
   - `defaultDescription`: benefit-led, ~155 chars, mentions direct B.E.
     admission 2026, NAAC/AICTE/VTU, placements, North East students.
   - `defaultImage`: a placehold.co OG image URL with label `CIT+Admissions+2026`.
2. **Organization schema** → change to an **EducationalOrganization /
   CollegeOrUniversity** type. Use canonical name, Tumakuru address (§2), phones,
   email, `foundingDate` reflecting 25 years, and drop founder/medical fields.
   Remove `MedicalBusiness`/`medicalSpecialty`/`isAcceptingNewPatients` and the
   medical `availableService` list; replace with the 7 B.E. programs (§3) as
   `hasOfferingCatalog`/course offerings or simply remove if not needed.
3. **`localBusiness`** block → repurpose to `CollegeOrUniversity` with Tumakuru
   geo (lat `13.3133`, lng `76.9971` approx for Tumakuru) and standard hours.
4. **FAQs** → replace all 9 medical FAQs with **admission FAQs** (keep ~6-8):
   - eligibility for B.E. direct admission, how to apply, courses offered,
     fees/scholarship guidance, hostel for NE students, placements, accreditation,
     last date / 2026 intake. Keep answers short and lead-driving. Use only facts
     from the master reference; for unknowns, say "contact our admission team".
5. **`public/index.html`:** title, description, OG/Twitter title+description+image,
   `theme-color` = `#0B3D91`, apple-touch-icon/favicon stay (placeholder), remove
   any Monjoven preconnects/structured data, update `lang`/locale.
6. **robots.txt / sitemap.xml:** point to the CIT campaign domain placeholder;
   keep `/admin` and `/thank-you` rules (thank-you noindex) intact.

## Constraints
- Keep GTM/Pixel snippet IDs untouched (infra).
- No medical keywords in any meta/keyword/FAQ.

## Acceptance criteria
- View source shows CIT title/description/OG; no "Monjoven", "hair", "transplant".
- JSON-LD validates as an educational org (no MedicalBusiness type).
