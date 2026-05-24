# 18 — Location & "Reaching CIT from North East" Section

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§2, §9). Complete prompt 09.

## Goal
Show where CIT is (Tumakuru, Karnataka) and make it feel reachable & supported for
students travelling from North East India.

## Files to edit
- `src/components/sections/LocationSection/LocationSection.jsx`
- `src/components/sections/LocationSection/LocationSection.module.css`

## Requirements
1. **Section label / title** → "Location" / "Find Us in Tumakuru, Karnataka".
   Set `id="location"` (or align with the nav target chosen in prompt 10).
2. **Address & contacts** → from `locationData.js` (prompt 09): full campus
   address, primary phone `+91 88673 54168` (+ alt numbers), email, website.
   Click-to-call and WhatsApp links.
3. **Map** → use the placehold.co map image from `locationData.mapUrl`
   (`CIT+Tumakuru+Campus+Map`). Keep it lightweight (no real Google embed needed
   for placeholder stage).
4. **"Coming from North East?" helper block (new)** → short, reassuring lines:
   well-connected via Bengaluru (~70 km) by train/bus/flight; hostel from day one;
   CIT NE admission desk helps with travel & settling in. Frame as support, not
   guarantees.
5. **NE audience strip** → list the 8 served NE states (from `servingStates`) as
   "Proudly welcoming students from across North East India".
6. **CTA** → "Get Admission Guidance" → `openLeadDrawer('request-callback')`.
7. Swap colours to CIT blue/amber; remove the Guwahati/Monjoven address entirely.

## Constraints
- Keep keys consumed from `locationData.js` consistent with prompt 09.
- Mobile-friendly map + tappable contacts.

## Acceptance criteria
- Location shows Tumakuru campus + NE-travel reassurance + NE states.
- No Guwahati/clinic data remains.
