# 17 — Campus Life, NE Support & Awards (Features Section)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§5, §6, §7). Complete prompt 08.

## Goal
Reassure parents and students with campus facilities, **hostel & NE-student
support**, and a credibility **awards timeline**.

## Files to edit
- `src/components/sections/FeaturesSection/FeaturesSection.jsx`
- `src/components/sections/FeaturesSection/FeaturesSection.module.css`

## Requirements
1. **Section label / title** → "Campus Life & Recognition" / "A Safe, Supportive
   Home for North East Students". Set a stable `id` if used by nav.
2. **Features** → render from updated `featuresData.js` (prompt 08): Academics &
   Innovation, Placements & Industry, Campus Life & NE Support. Emphasise hostel/
   mess, inclusive campus, and end-to-end admission guidance for NE students.
3. **Awards timeline (new sub-block)** → compact horizontal/vertical timeline from
   §6: 2016, 2018, 2019, 2021, 2024, 2025 (IIRF Best Brand). One short line each.
   Use placehold.co badge images only if the design needs images
   (`?text=Award+2025`).
4. **CTA** → "Apply for 2026 Admission" → `openLeadDrawer('apply-now')`.
5. Swap colours to CIT blue/amber; remove all medical feature copy.

## Constraints
- Keep animation/`useInView` and the data-driven mapping intact.
- Keep it scannable — short lines, no long paragraphs.

## Acceptance criteria
- Section covers facilities + NE support + awards timeline.
- No medical/clinic features remain; CIT colours applied.
