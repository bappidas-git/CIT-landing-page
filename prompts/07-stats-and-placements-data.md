# 07 — Stats & Placements Data

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§4 Placements, §6 Awards).

## Goal
Replace the medical stats with CIT's **placement & achievement proof points** —
the strongest conversion drivers for admission seekers.

## Files to edit
- `src/data/statsData.js`

## Requirements
Rewrite each stat object (keep shape: `id`, `icon`, `title`, `description`,
`stat`, `statLabel`) using ONLY numbers from §4/§6:
1. `25+` — `statLabel: "Years of Excellence"`; title "25 Years of Academic Excellence"
2. `90+` — `statLabel: "Companies Visit / Year"`; about recruiters on campus
3. `85%+` — `statLabel: "Placement Rate"`; eligible students, last 8 years
4. `15 LPA` — `statLabel: "Highest CTC"`; (median 5 LPA can go in description)
5. `4★` — `statLabel: "IIC Rating (MHRD)"`; innovation council rating AY 2024-25
6. `21` — `statLabel: "Patents Filed"`; R&D strength (₹2 Cr research grants in desc)
7. `NAAC` — `statLabel: "Accredited"`; plus AICTE-approved, VTU-affiliated in desc

Pick appropriate `mdi` icons (e.g. `mdi:calendar-star`, `mdi:office-building`,
`mdi:briefcase-check`, `mdi:cash-multiple`, `mdi:star-circle`,
`mdi:lightbulb-on-outline`, `mdi:certificate`). Keep descriptions to one short,
parent-reassuring sentence each.

## Constraints
- Do not fabricate figures beyond the master reference.
- Keep the array length compatible with how `StatsSection.jsx` maps it (check it).

## Acceptance criteria
- Stats reflect placements/accreditation/R&D, not medical procedures.
- All figures trace back to §4/§6.
