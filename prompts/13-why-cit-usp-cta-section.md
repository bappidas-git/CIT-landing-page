# 13 — "Why CIT" USP + CTA Band (rename WhyTransplantsFailCTA)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§7 direct-admission hook).

## Goal
Repurpose the high-impact `WhyTransplantsFailCTA` band into a **"Why Choose CIT
for Direct B.E. Admission"** value section that handles objections and drives a
strong CTA. Also rename the component to remove the medical name.

## Files to edit / rename
- Rename folder & files:
  `src/components/sections/WhyTransplantsFailCTA/WhyTransplantsFailCTA.jsx` →
  `src/components/sections/WhyChooseCIT/WhyChooseCIT.jsx`
  (and the `.module.css` accordingly).
- Update imports & the lazy import + `useIdlePreload` list + JSX usage in
  `src/App.jsx`.

## Requirements
1. **Component rename** — new component name `WhyChooseCIT`; update all references
   in `App.jsx` (the `lazy(() => import(...))` line, the preload array, and the
   `<WhyTransplantsFailCTA />` usage). Keep its position in the page flow.
2. **Content** — replace the "reasons transplants fail" pain points with
   **objections NE students/parents have**, answered by CIT:
   - "Confused by Karnataka CET/COMED-K counselling?" → CIT offers guided **direct
     admission** for 2026 — simple and supported.
   - "Worried about being far from home?" → Safe hostel & mess; supportive,
     inclusive campus; help settling in.
   - "Will the degree & placements be worth it?" → NAAC/AICTE/VTU degree, 85%+
     placements, 90+ recruiters, top companies (Accenture, Infosys, Deloitte, TCS).
3. **Reassurance bullets** — 4-5 short points: direct-admission guidance, limited
   2026 seats, NAAC-accredited, strong placements, hostel for NE students.
4. **CTA** — prominent amber button "Apply for 2026 Admission" →
   `openLeadDrawer('apply-now')`, plus a "Call +91 88673 54168" link.
5. Replace the medical `₹30,000` price-led CTA and all clinic copy; swap teal to
   CIT blue/amber. Set an `id` if it's a nav target (optional).

## Constraints
- Keep the section's animation/`useInView` structure and visual impact.
- Ensure the app compiles after the rename (no dangling imports).

## Acceptance criteria
- Section is titled "Why Choose CIT" with NE-objection-handling content + CTA.
- No file, import, or string named "WhyTransplantsFail" / "transplant" remains.
- App builds and the section renders in its original slot.
