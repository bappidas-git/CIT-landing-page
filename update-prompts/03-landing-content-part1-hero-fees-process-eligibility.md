# 03 — Landing Content Part 1: Hero, Fees & Funding, Admission Process, Eligibility

**Prerequisite:** `update-prompts/02-apply-multistep-application-form.md` completed
(the `/apply` route must exist). Read `update-prompts/README.md`.

## Goal

Give serious admission-seekers the information they currently leave the page to
find — the funding story, the admission process, and eligibility — and convert the
hero from a soft enquiry pitch into an application pitch. This is the
highest-impact content change for lead quality: families who read a fees/process
section before applying self-qualify; junk doesn't read it.

## Files to edit

- `src/components/sections/HeroSection/HeroSection.jsx` (+ `.module.css`) — copy +
  right-side card swap
- **NEW** `src/components/sections/FeesFundingSection/FeesFundingSection.jsx` (+ `.module.css`, `index.js`)
- **NEW** `src/components/sections/AdmissionProcessSection/AdmissionProcessSection.jsx` (+ `.module.css`, `index.js`)
- **NEW** `src/components/common/EligibilityStrip/EligibilityStrip.jsx` (+ `.module.css`, `index.js`)
- `src/pages/Apply/steps/StepAcademics.jsx` — import EligibilityStrip at the top of Step 2 (§4 below; additive only)
- `src/App.jsx` — section order only (lazy-import the two new sections)

## Requirements

### 1. Hero rework (`HeroSection.jsx`)

1. Keep the badge, background, trust-indicator row, and layout system untouched.
2. H1 → `Direct B.E. Admission 2026 at CIT Tumakuru — Apply Online in 3 Minutes`.
   Subhead → `NAAC-accredited, AICTE-approved VTU degree with 85%+ placements.
   Complete the online application and CIT's North-East admission desk will
   confirm your eligibility on the first call.`
3. Primary CTA `Start My Application →` navigates to `/apply` (fire the existing
   `cta_click` GTM event with source `hero-apply`, then `navigate('/apply')`;
   preload the Apply chunk on `pointerdown` via the helper exported by
   `src/pages/Apply/index.js`). Secondary CTA `Call +91 8069645014` unchanged.
4. Replace the desktop embedded `UnifiedLeadForm` card with an **Application
   Checklist card** (same visual slot/width): title `Your 2026 Application`,
   list — `✔ Takes about 3 minutes` · `✔ Keep your 10th & 12th marks handy` ·
   `✔ Parent/guardian's mobile number` · `✔ Instant VTU eligibility check
   inside the form`, then a full-width `Start My Application` button →
   `/apply`, and the microcopy `No consultancy or agent fees · Direct college
   admission`. Remove the `UnifiedLeadForm` import from this file.
5. Mobile hero: same CTA behavior; no checklist card (keep hero height as-is).

### 2. NEW `FeesFundingSection` (`#fees`) — place immediately AFTER WhyChooseCIT, BEFORE ServicesSection

No fee amounts anywhere (confirmed decision). Structure:

1. Badge `FEES & FUNDING`; H2 `Transparent Fees. Real Funding Support.`; sub
   `Direct admission at CIT means you deal with the college — not agents.`
2. Three cards:
   - **`No hidden charges`** (icon: shield-check) — `No capitation fee. No
     consultancy or agent charges. You pay the college directly, and the complete
     fee structure — tuition, hostel and mess — is shared in writing on your
     first counselling call.`
   - **`Education loan assistance`** (icon: bank) — `CIT's admission desk helps
     your family with education-loan paperwork from nationalised and private
     banks, so funding is arranged before you travel.`
   - **`Scholarships & concessions`** (icon: school) — `Students from the
     North-East can check their eligibility for state scholarship schemes and
     institute concessions during counselling.`
3. Closing band inside the section: `Want the full fee structure? Submit your
   application — our counsellor shares it on the very first call.` + button
   `Start My Application` → `/apply`.
4. Reuse existing section patterns (SectionTitle, card styles, tokens); lazy-load
   like other below-the-fold sections.

### 3. NEW `AdmissionProcessSection` (`#admission-process`) — place immediately AFTER FeesFundingSection

1. Badge `HOW IT WORKS`; H2 `Your Admission in 4 Clear Steps`; sub `From online
   application to your first day on campus — guided at every step.`
2. Four numbered step cards (vertical timeline on mobile, horizontal on desktop):
   1. **Apply online (3 minutes)** — `Fill the application with your 10th & 12th
      details. You get an instant VTU eligibility check.`
   2. **Eligibility & counselling call** — `CIT's NE admission desk calls within
      24 hours, confirms eligibility, and shares the complete fee structure and
      document checklist (10th & 12th marksheets, transfer certificate, ID).`
   3. **Seat confirmation** — `Complete the admission formalities and receive
      your provisional admission letter for the 2026 intake.`
   4. **Travel & hostel onboarding** — `The NE desk helps plan your journey via
      Bengaluru and allots your hostel room before you arrive.`
3. CTA under the steps: `Start Step 1 Now` → `/apply`.

### 4. NEW `EligibilityStrip` common component

A slim, reusable info strip (light-teal background, left accent border):
`VTU B.E. eligibility: 45% aggregate in Physics + Maths + one more science
subject in 12th (40% for reserved categories). Diploma holders can join 2nd year
via lateral entry.` Render it in two places: inside `AdmissionProcessSection`
(below the steps) and at the top of the `/apply` page's Step 2 (import in
`StepAcademics.jsx`).

### 5. Section order in `src/App.jsx`

New order: Hero → About → WhyChooseCIT → **FeesFunding** → **AdmissionProcess** →
Services (courses) → Stats (placements) → Highlights → Features → Location → CTA →
Contact → SecondaryCTA. Both new sections lazy-loaded with the existing
Suspense/skeleton pattern; add them to the idle-preload list.

## Constraints

- Navigation to `/apply` only — this prompt must NOT call `openLeadDrawer`
  anywhere it touches (remaining drawer call sites are prompt 04's job).
- Do not modify `UnifiedLeadForm.jsx`, `LeadFormDrawer.jsx`, `ModalContext.jsx`;
  removing the hero's *usage* of `UnifiedLeadForm` is allowed and required.
- No fee amounts, no new scarcity claims, no "free counselling" phrasing, 2026-only.
- Match existing brand tokens, mobile-first at 360 px, lazy-loading and
  `prefers-reduced-motion` patterns. Icons via existing project conventions.
- Do not break section anchor ids used by the nav (`#about`, `#courses`,
  `#placements`, `#campus`, `#contact`).

## Acceptance criteria

- [ ] `npm run build` passes; two new lazy chunks appear.
- [ ] `grep -n "UnifiedLeadForm" src/components/sections/HeroSection/HeroSection.jsx` → no matches.
- [ ] `grep -rn "openLeadDrawer" src/components/sections/HeroSection src/components/sections/FeesFundingSection src/components/sections/AdmissionProcessSection` → no matches.
- [ ] `grep -rn "₹\|LPA\|lakh" src/components/sections/FeesFundingSection` → no fee amounts (the word "fee" is fine).
- [ ] `grep -n "FeesFundingSection\|AdmissionProcessSection" src/App.jsx` → ordered after WhyChooseCIT, before ServicesSection.
- [ ] EligibilityStrip renders in AdmissionProcessSection and in `/apply` Step 2.
- [ ] Manual at 360 px: hero CTA opens `/apply`; new sections have no horizontal scroll; timeline reads vertically.
