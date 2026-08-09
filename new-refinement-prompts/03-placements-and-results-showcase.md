# 03 — Placements & University Results Showcase (Last 3 Years, Built From `resources/` Evidence)

> **Series:** CIT Landing Page Repositioning (prompt 3 of 10). **Depends on:** prompt 02 (narrative repositioning) — runs fine after 01+02.
> **You are:** Claude Code in a fresh session with full repo access.

## Purpose

The repositioning claims CIT is **not** an ordinary Karnataka college — the proof is its placement record and University (VTU) results. Build prominent, mobile-first proof sections from the **verified figures transcribed below out of the seven poster images in `resources/`** (`Info-1.jpeg` … `Info-7.jpeg`). Do not render the poster JPEGs themselves on the page (600 KB scans, unreadable at 360 px) — transcribe their data into typed data modules and render native components. **Never invent a number that is not in this transcription or already on the site.**

## Verified evidence (transcribed from the resources/ images — treat as the complete allowed fact set)

**From `resources/Info-1.jpeg` (Career Advancement & Development Cell poster):**

Year-wise placements (— placements & % of eligible students placed · highest CTC · companies visited):

| Academic Year | Placements | % of Eligible Placed | Highest CTC | Companies |
|---|---|---|---|---|
| 2022-23 | 303 | 88% | 11.0 LPA | 80 |
| 2023-24 | 252 | 84% | 14.5 LPA | 80 |
| 2024-25 | 316* | 86%* | 14.5 LPA | 98 |

(*2024-25 figures carry an asterisk on the poster — treat as provisional and keep the `*` with a footnote `*As published by CIT's Career Advancement & Development Cell; 2024-25 figures provisional.` Older years also on the poster if you want a longer trend: 2019-20: 303 & 75%, 4.5 LPA, 49 companies · 2020-21: 325 & 80%, 7.0 LPA, 47 · 2021-22: 562 & 96%, 10.0 LPA, 96 — but the section leads with the **last 3 years**.)

Branch-wise (poster's asterisked recent-year stats — companies visited · offers · highest CTC): CSE 76·86·14.5 LPA / ISE 75·42·5.5 / ECE 40·60·5.0 / EEE 35·30·4.5 / CV 18·34·5.0 / ME 19·33·4.5 / AD (AI&DS) 45·31·4.5. Other Info-1 facts: `100+ reputed companies visit campus every year`, `86%+ overall placement for eligible students from past 6 years`, placed student `Yashaswini N. (1CG21CS122) — CTC 14.5 LPA`.

**From `resources/Info-2.jpeg` (VTU Gold Medalist poster):** `Himaja S (1CG21CS048) — awarded the prestigious Late Shri A Thimmaiah Gold Medal` · `Mohammed Sufiyann (1CG21EE014) — VTU 7th Rank, CGPA 9.43`.

**From `resources/Info-3.jpeg` / `Info-4.jpeg` (Admissions-open posters) — MAJOR RECRUITERS wall (name list):** Accenture, IDFC First Bank, Zscaler, UST Global, Wipro, NTT Data, Infosys, Deloitte, HCLTech, HashedIn by Deloitte, Cognizant, Nag Interiors, PCC Park Controls, Tech Mahindra, Mphasis, NASH, Deduce Technologies, CGS, Khyath, Ivoyant, Acmegrade, Indo-MIM, RCCL, Aarbee, DNR, RGSM Power, Travancore Analytics, Eleation, Corizo, MCoreta, Boomi (Boomi from Info-1). Leadership (if needed): G.S. Basavaraju (Chairman, CIT Group), G.B. Jyothi Ganesh (MD & Secretary), Dr. Suresh D.S. (Director & Principal), Dr. Shantala C.P. (Vice Principal & HoD CSE).

**From `resources/Info-6.jpeg` (CIT Group poster) — VTU Rank Holders wall:** Chaitra T R — 1st Rank, MBA (15th Convocation, 2016) · Pravesh Kumar — 1st Rank, Mechanical Engg (16th Convocation, 2017) · Sharath D N — 6th Rank, B.E. EEE (2016) · Srinivas B S — 7th Rank, B.E. Civil (2016) · Raghuchandra G — 5th Rank, B.E. Civil (2017) · Shagufta Nazneen — 3rd Rank, M.Tech (2017) · Chandrashekar Gowda — 4th Rank, B.E. ME (2018) · Navya Shree R — 6th Rank, B.E. CSE (2018) · Sushmitha P R — 6th Rank, B.E. EEE (2019) · Vinutha K — 8th Rank, B.E. EEE (2019) · Dedeepya M — 8th Rank, B.E. EEE (2024 batch).

**Awards timeline (Info-1/3/5/6, identical across posters):** 2016 Excellent Engineering Institution in Rural India (National Education Summit & Awards) · 2018 Most Promising Engineering Institution (Leaders Conclave) · 2019 Outstanding & Positive Accomplishment of the Institution (Academic Insights) · 2022 Best Engineering College for Building Global Technocrats for Rural Talents (4th Asia Pacific Education & Technology) · 2024 Outstanding Contribution to Rural Engineering Education (Federation for World Academics, New Delhi) · 2025 Best Brand (IIRF, New Delhi). Accreditations: ISO 9001:2015, NAAC Accredited, Affiliated to VTU Belagavi, Approved by AICTE New Delhi, CET Code E101, COMED-K Code E035.

**Known cross-poster inconsistencies — resolve conservatively (decided; do not re-litigate):** posters variously say 80%+/85%+/86%+ placement, Z-Scaler highest CTC 14.00 vs 15.00 LPA, 21 vs 29 patents, ₹2 Cr vs ₹3 Cr grants. **Keep the site's existing conservative claims** (85%+ placements · 90+ recruiters · highest CTC 15 LPA · median ~5 LPA · 21 patents · ₹2 Cr grants) for headline stats, and use the Info-1 year-table numbers *as table rows* without attaching company names to specific CTC figures (the posters disagree on which company paid what).

## What to build

### 1. New data modules

- `src/data/placementsData.js` — export `PLACEMENT_YEARS` (the 3-year table above, with `provisional: true` on 2024-25), `BRANCH_PLACEMENTS` (branch-wise stats, keyed with the same branch short names used in `src/data/meritProgram.js`), `PLACEMENT_SOURCE_NOTE` (the footnote string). Include the older years in a `PLACEMENT_YEARS_EXTENDED` export (unused by default).
- `src/data/vtuResultsData.js` — export `GOLD_MEDALISTS` (Himaja S entry), `RANK_HOLDERS` (the 11-entry wall, each `{ name, rank, program, year }`), `AWARDS_TIMELINE` (the 6 awards, `{ year, title, by }`).

### 2. Upgrade `src/components/sections/StatsSection/StatsSection.jsx` into the placements showcase

Keep the existing headline stat cards (85%+ / 90+ / 15 LPA — ids untouched in `statsData.js`) and the recruiter-chip wall mechanism (`RECRUITERS` array + `RECRUITER_LOGOS` upgrade map — per `LAUNCH_NOTES.md`, name chips until licensed logo artwork exists; **do not add placeholder logo images**). Then add:

- **"Last 3 Years — Placement Record" table/cards**: at 360 px render as year cards (one per year: placements, % of eligible placed, highest CTC, companies visited); ≥ 768 px as a real table. Source note underneath.
- **Branch-wise strip** (optional compact accordion): offers + companies per branch from `BRANCH_PLACEMENTS`.
- **Extend the `RECRUITERS` name list** with the verified names from the transcription above that are missing (e.g. HashedIn by Deloitte, Mphasis is present, add Indo-MIM, RGSM Power, Aarbee, Eleation, Travancore Analytics, Ivoyant, Deduce Technologies, NASH, CGS, Khyath, Corizo, MCoreta, DNR, Nag Interiors, Acmegrade, Boomi…). Keep TCS/Bosch (already on the site = existing verified content). Cap the visible wall at ~20 chips with a `+N more recruiters` affordance if it gets crowded at 360 px.
- Section heading direction: `Proof, Not Promises` / `The placement record behind the 15 seats`.

### 3. New section `src/components/sections/UniversityResultsSection/UniversityResultsSection.jsx` (+ `.module.css`, `index.js`)

VTU results showcase: gold-medalist highlight card (Himaja S — Late Shri A Thimmaiah Gold Medal; Mohammed Sufiyann — VTU 7th Rank, CGPA 9.43), the rank-holders wall (compact grid of name + rank + branch + year — text cards, no student photos), the line `Consistent VTU rank holders year after year` (already a site claim), and the awards timeline (horizontal scroll strip at 360 px). Heading direction: `University Results That Ordinary Colleges Don't Have`.

Wire it into `src/App.jsx` exactly like the other lazy sections: add the `lazy(() => import(...))` entry, a `<Suspense>` block **right after StatsSection**, and add it to the `useIdlePreload` sections list. Follow the ErrorBoundary + SectionLoader pattern used by every existing section.

### 4. Cross-checks

- `src/data/statsData.js`: leave values as-is (conservative set). If you touch descriptions, keep every number identical.
- The FAQ placements answer (rewritten in prompt 02) and these sections must agree (85%+, 90+, 15 LPA).

## Ground rules

- Mobile-first 360 px: tables become cards; the rank wall wraps; nothing scrolls horizontally except intentional strips.
- No framer-motion additions beyond the patterns already in StatsSection; keep bundle discipline (data modules are plain JS).
- Do not modify: the do-not-modify list from CLAUDE.md, `src/pages/Apply/**`, `src/pages/ThankYou/**`, admin files, HeroSection.
- Every figure rendered must trace to the transcription above or to pre-existing site content. The resources/ images stay in the repo untouched as the evidence trail.
- `npm run build` must pass.

## Acceptance criteria

- [ ] `placementsData.js` + `vtuResultsData.js` exist and match the transcription exactly (spot-check 2024-25 = 316*, 86%, 14.5 LPA, 98 companies; Sufiyann = 7th rank, CGPA 9.43).
- [ ] StatsSection shows the 3-year table (cards at 360 px) with the provisional footnote; recruiter wall extended, still name chips (no images).
- [ ] UniversityResultsSection renders after StatsSection with medalists, rank wall, awards strip; lazy-loaded + preloaded like the other sections.
- [ ] Headline stats remain 85%+ / 90+ / 15 LPA everywhere (no contradictions between sections).
- [ ] No poster JPEG is served on the page; no placeholder logo images introduced.
- [ ] 360 px pass on both sections; `npm run build` passes; the homepage renders with no console errors and all pre-existing sections intact.
