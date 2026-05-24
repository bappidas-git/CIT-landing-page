# 14 — Courses Section (B.E. branches)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§3). Complete prompt 06 first.

## Goal
Turn the medical "Services" section into a clean **Courses** grid showing the 7
B.E. branches, each with a per-card "Apply" nudge.

## Files to edit
- `src/components/sections/ServicesSection/ServicesSection.jsx`
- `src/components/sections/ServicesSection/ServicesSection.module.css` (colours/labels)

## Requirements
1. **Section label / title** → "Courses Offered" / "Choose Your B.E. Engineering
   Branch — 2026 Intake". Set `id="courses"` for nav.
2. **Data source** → render from the updated `servicesData.js` (prompt 06). Show
   name, shortName, the "Ideal for" line, 3-4 features, and badge where present.
3. **Card CTA** → each card has "Apply / Enquire" → `openLeadDrawer('apply-now')`
   (optionally pass the course name as `extraData` so the form can pre-select it —
   only if straightforward; otherwise just open the drawer).
4. **Copy** → relabel any "service"/"procedure"/"treatment" wording to course
   terms ("branch", "programme", "career scope"). Remove duration/"book
   consultation" medical phrasing.
5. **Section-level CTA** → "Not sure which branch? Talk to us" →
   `openLeadDrawer('get-details')`.
6. Swap teal/navy/orange to CIT blue/amber.

## Constraints
- Keep the grid/animation/`useInView` logic and responsive columns.
- Keys read from data must match prompt-06 output.

## Acceptance criteria
- 7 B.E. branches render as cards with badges and an apply nudge.
- No medical service copy remains; CIT colours applied.
