# 15 — Placements & Recruiters Section

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§4). Complete prompt 07 first.

## Goal
Make the stats section a **placement-proof powerhouse** — the numbers plus a
recruiter logo wall. This is a top conversion driver for admission seekers.

## Files to edit
- `src/components/sections/StatsSection/StatsSection.jsx`
- `src/components/sections/StatsSection/StatsSection.module.css`
- (Reuse `AnimatedCounter` for the headline numbers.)

## Requirements
1. **Section label / title** → "Placements" / "Strong Placements, Bright Futures".
   Set `id="placements"` for nav.
2. **Headline stats** → from `statsData.js` (prompt 07): 90+ companies, 85%+
   placement, 15 LPA highest CTC, 5 LPA median (in supporting text). Keep the
   `AnimatedCounter` animation.
3. **Recruiter logo wall (new)** → a responsive grid of placehold.co logos for
   the recruiters in §4 (Accenture, Infosys, Deloitte, HCLTech, TCS, Tech
   Mahindra, Cognizant, Wipro, Mphasis, IDFC First Bank, Zscaler, UST, NTT Data,
   Bosch, Park Controls, Boomi). Each:
   `https://placehold.co/160x80/FFFFFF/0B3D91?text=Accenture` (label = recruiter
   name). Add a small caption: "Our students are hired by 90+ leading companies."
4. **CTA** → "Apply for 2026 Admission" → `openLeadDrawer('apply-now')`.
5. Swap colours to CIT blue/amber; remove all medical stat copy.

## Constraints
- Keep `AnimatedCounter` and `useInView` working.
- Logo wall must be mobile-friendly (wrap, sensible sizes).

## Acceptance criteria
- Placement numbers animate; recruiter wall renders (placeholders).
- No "patients"/"procedures"/"satisfaction" medical stats remain.
