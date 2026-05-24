# 19 — CTA Bands (Primary + Secondary / Urgency)

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§7).

## Goal
Convert the two CTA bands into focused admission calls-to-action, including an
urgency/limited-seats message near the end of the page.

## Files to edit
- `src/components/sections/CTASection/CTASection.jsx` (+ `.module.css`)
- `src/components/sections/SecondaryCTASection/SecondaryCTASection.jsx` (+ `.module.css`)

## Requirements
1. **CTASection** (mid-page) → headline like "Ready to Secure Your B.E. Seat for
   2026?" + one supporting line (guided direct admission, free counselling).
   Primary amber button "Apply Now" → `openLeadDrawer('apply-now')`; secondary
   "Call +91 88673 54168".
2. **SecondaryCTASection** (near footer) → **urgency**: "Limited Seats for the
   2026 Intake — Apply Early". Short reassurance (NAAC/AICTE/VTU, 85%+ placements,
   hostel for NE students). It may embed `UnifiedLeadForm` (`source="contact"` or
   a dedicated `formId`) OR a strong button to open the drawer — keep whichever
   the current layout uses, but ensure the form/CTA works.
3. Replace all medical CTA copy (consultation/transformation/price) and teal/orange
   colours with CIT admission copy and blue/amber.

## Constraints
- Keep animations and any embedded-form wiring functional.
- Don't duplicate the exact same headline as the hero — vary the angle (urgency).

## Acceptance criteria
- Both bands drive "Apply for 2026 admission"; one carries clear urgency.
- No medical CTA copy or teal/orange remains.
