# 08 — Features & Facilities Data

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§5 Infrastructure, §7 Direct-admission hook).

## Goal
Replace the medical "features" data with CIT's **infrastructure, labs, campus
facilities, and NE-student support** — grouped for the Features section.

## Files to edit
- `src/data/featuresData.js`

## Requirements
Keep the grouped shape (`id`, `category`, `items[]` where each item has `icon`,
`title`, `description`). Replace the 3 medical categories with 3 admission-relevant
categories, each with 2-4 short items:

1. **category: "Academics & Innovation"**
   - ICT-enabled smart classrooms & state-of-the-art computing
   - Centre for Creativity + start-up incubation, data centre & private cloud
   - Advanced R&D labs: IOS-MCN (Bharat 6G), Drone Lab (AICTE CoE), BCI & IoT labs
   - 4-Star IIC (MHRD) rating, 21 patents, ₹2 Cr research grants

2. **category: "Placements & Industry"**
   - 90+ companies, 85%+ placement, top recruiters (Accenture, Infosys, Deloitte, TCS)
   - Active Institution–Industry Cell + internships in cutting-edge tech
   - Strong VTU rank holders & gold medalists every year

3. **category: "Campus Life & NE Student Support"**
   - Safe hostel & mess facilities — a home away from home for NE students
   - End-to-end direct-admission guidance from the CIT NE admission desk
   - Supportive, inclusive campus; help with travel & settling in
   - NAAC-accredited, AICTE-approved degree recognised pan-India

Use appropriate `mdi` icons for each item. Keep every description to one short
sentence. Use only facts from the master reference (hostel/NE-support framing is
from §7 — keep it as "facilities & guidance", no guarantees).

## Constraints
- Match the keys `FeaturesSection.jsx` consumes (verify before editing).
- No medical items (PRP, FUE, surgeon, patient care, etc.).

## Acceptance criteria
- 3 categories focused on academics, placements, and NE campus support.
- No medical wording; all claims trace to the master reference.
