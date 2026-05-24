# 16 — Infrastructure & Labs (Highlights Section)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§5).

## Goal
Showcase CIT's modern infrastructure and research labs as proof of a future-ready
engineering education.

## Files to edit
- `src/components/sections/HighlightsSection/HighlightsSection.jsx`
- `src/components/sections/HighlightsSection/HighlightsSection.module.css`

## Requirements
1. **Section label / title** → "Infrastructure & Innovation" / "Learn on a
   Future-Ready Campus". Optional `id="campus"` (shared with campus life) — or a
   distinct id; keep nav targets consistent with prompt 10.
2. **Highlight items** (from §5) — 6-8 compact cards, each icon + one short line:
   - ICT-enabled smart classrooms & state-of-the-art computing
   - Centre for Creativity + start-up incubation (data centre & private cloud)
   - IOS-MCN R&D Centre with Bharat 6G Labs
   - Aero-vision Drone Lab (AICTE Centre of Excellence)
   - Brain-Computer Interface (BCI) & IoT/Embedded R&D labs
   - 4-Star IIC (MHRD) rating, AY 2024-25
   - 21 patents filed · ₹2 Cr research grants
   - Robust R&D environment + cutting-edge internships
3. **Images** (if the layout uses any) → placehold.co labelled e.g.
   `Drone+Lab`, `6G+Research+Lab`, `Smart+Classroom`.
4. Swap colours to CIT blue/amber; remove all medical highlight copy.

## Constraints
- Keep grid/animation logic; match data shape the component expects.
- Keep copy minimal — one line per highlight.

## Acceptance criteria
- Highlights reflect CIT labs/innovation; no medical "highlights" remain.
- Renders cleanly on mobile and desktop.
