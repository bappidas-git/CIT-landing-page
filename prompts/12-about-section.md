# 12 — About CIT Section

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§2, §5, §6).

## Goal
A concise "About CIT" band that builds instant credibility: 25 years,
accreditations, and 3-4 reasons to trust CIT — then nudges to apply.

## Files to edit
- `src/components/sections/AboutSection/AboutSection.jsx`
- `src/components/sections/AboutSection/AboutSection.module.css` (colours/spacing)

## Requirements
1. **Section label / title** → "About CIT" / "25 Years of Engineering Excellence
   in Karnataka". Set a stable `id` (e.g. `id="about"`) for nav.
2. **Intro** → 2-3 short sentences: CIT is a NAAC-accredited, AICTE-approved,
   VTU-affiliated engineering institute in Tumakuru, Karnataka, recognised
   nationally (IIRF Best Brand 2025) and known for strong placements and rural/
   inclusive engineering education — now welcoming students from North East India
   for direct B.E. admission in 2026.
3. **Credibility points** → 3-4 compact cards/bullets, each one short line:
   accreditations (NAAC/AICTE/VTU/ISO), 25-year legacy, placement strength,
   innovation & R&D (6G/Drone/BCI labs, 4★ IIC).
4. **Image** → placehold.co, labelled `CIT+Campus`, `600x400`, blue/light.
5. **CTA** → "Apply for 2026 Admission" → `openLeadDrawer('apply-now')`.
6. Replace all medical copy, doctor bio, and teal colours with CIT content/colours.

## Constraints
- Keep it brief — this is a trust band, not a history essay.
- Keep `useInView`/animation hooks working.

## Acceptance criteria
- About section reads as CIT credibility + accreditations + NE-2026 invite.
- No Dr. Porag Neog / clinic / years-in-surgery copy remains.
