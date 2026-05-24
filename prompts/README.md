# CIT Direct Engineering Admissions 2026 — Build Prompts

This folder contains an ordered set of prompts that transform the current
**boilerplate** (a "Monjoven Hair Transplant" medical landing page) into a
**high-converting, lead-generating landing page for Channabasaveshwara Institute
of Technology (C.I.T)** — promoting **Direct Engineering (B.E.) Admissions 2026**
to students across **North East India**. The campaign is run by **Assam Digital**
via paid digital marketing (Google Ads / Meta).

## How to use these prompts

1. Open Claude Code in this repository.
2. **Always start by giving Claude `00-cit-master-reference.md`** (or tell it to
   read it). It is the single source of truth for all CIT facts, brand colours,
   the lead-form spec, and the global rules. Every other prompt assumes it has
   been read.
3. Run the prompts **in numerical order** (`01` → `25`). Each prompt is
   self-contained and produces a working, incremental change. Do not skip ahead —
   later prompts depend on data/components created by earlier ones.
4. After each prompt, run `npm start` (or `npm run build`) and eyeball the result
   before moving on.
5. Prompt **25** is the final QA sweep — run it last to guarantee zero "Monjoven"
   traces and a clean build.

## Execution batches

| Batch | Prompts | Theme |
|-------|---------|-------|
| **0 — Reference** | `00` | Canonical CIT data, brand system, lead-form spec, global rules |
| **1 — Foundation** | `01`–`03` | Branding/env, colour system + theme, SEO + HTML head |
| **2 — Lead capture** | `04`–`05` | Unified lead form + drawer/modal wiring (the conversion core) |
| **3 — Data layer** | `06`–`09` | Courses, stats/placements, facilities, location data |
| **4 — Sections** | `10`–`21` | Header, hero, about, USP, courses, placements, infra, campus, location, CTAs, contact, footer/mobile |
| **5 — Pages & admin** | `22`–`24` | Thank-you page, admin panel rebrand, admin guides |
| **6 — QA** | `25` | Final sweep: remove all Monjoven traces, placeholder audit, build/lint/responsive |

## Non-negotiable rules (apply to EVERY prompt)

- **Zero "Monjoven" traces** — no Monjoven, Dr. Porag Neog, hair transplant,
  cosmetic surgery, clinic, patient, or any medical wording anywhere in the final
  output (code, copy, comments, meta, alt text, admin).
- **CIT only, Engineering only, 2026 only** — the page sells *direct B.E.
  admission* for the 2026 intake. Do not add unrelated CIT programs (PU College,
  Polytechnic, B.Com, etc.) as primary content.
- **North East India audience** — copy speaks to NE students and parents.
- **Lead generation first** — every section drives toward the unified lead form.
  Keep content **minimal, scannable, and benefit-led**. No long paragraphs.
- **All images are placeholders** — use `https://placehold.co/...` with a visible
  descriptive label and CIT brand colours (see `00-cit-master-reference.md`).
  The user will swap real images later.
- **Do not break** form submission logic, webhook/CAPI/Google-Ads tracking,
  duplicate prevention, drawer/modal mechanics, animations, or mobile navigation.
- **Mobile-first** — verify every change at 360px width and up.
