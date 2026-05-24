# 06 — Courses Data (B.E. branches)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§3 Programs, §9 Images).

## Goal
Replace the medical "services" data with CIT's **7 B.E. engineering branches** so
the Courses section and any course detail UI render real programs.

## Files to edit
- `src/data/servicesData.js`
- `src/data/serviceDetailsData.js`

## Requirements
1. **`servicesData.js`** — one entry per B.E. branch from §3. For each, keep the
   existing object shape (`id`, `name`, `shortName`, `target`, `duration`,
   `description`, `features[]`, `frequency`, `badge`, `icon`) but repurpose the
   fields for a course:
   - `name`: e.g. "B.E. Computer Science & Engineering"
   - `shortName`: e.g. "CSE", "AI & DS", "ISE", "ECE", "EEE", "MECH", "CIVIL"
   - `target` → relabel meaning to "Ideal for" (e.g. "Coding, software & IT careers")
   - `duration` → "4-Year B.E. Degree (VTU)"
   - `description`: 1-2 lines, benefit-led, what the student becomes / career scope
   - `features[]`: 3-4 short bullets (core skills / career paths / labs)
   - `frequency` → relabel to e.g. "Strong placement record" or remove if unused
     by the UI (check ServicesSection before deleting a key)
   - `badge`: "High Demand" for AI&DS, "Most Popular" for CSE, else `null`
   - `icon`: relevant mdi icons (e.g. `mdi:robot-outline` AI&DS,
     `mdi:laptop` CSE, `mdi:database-outline` ISE, `mdi:radio-tower` ECE,
     `mdi:flash-outline` EEE, `mdi:cog-outline` MECH, `mdi:bridge` CIVIL)
2. **`serviceDetailsData.js`** — provide a matching detail entry per branch
   (or per the branches the detail UI uses). Keep the shape (`id`, `title`,
   `image`, `commencement`, `frequency`, `highlights[]`):
   - `title`: the full course name
   - `image`: a placehold.co URL labelled with the branch + "Lab"/"Students",
     e.g. `https://placehold.co/600x400/0B3D91/FFFFFF?text=CSE+Lab`
   - `commencement` → "2026 Intake — Direct Admission Open"
   - `frequency` → "4-Year VTU Degree | NAAC Accredited | AICTE Approved"
   - `highlights[]`: 3-4 points (career scope, key labs, placement angle)
3. Use only facts from the master reference. Generic, accurate course descriptions
   are fine; do not invent specific CIT statistics per branch.

## Constraints
- Match object keys to what `ServicesSection.jsx` actually reads (open it to
  confirm) so nothing breaks. If a key is unused, you may drop it consistently.
- All images via placehold.co with labels.

## Acceptance criteria
- 7 B.E. branches present; AI&DS and CSE carry badges.
- No hair/beard/eyebrow/cosmetic entries remain.
- Courses render without console errors.
