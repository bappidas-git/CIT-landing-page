# 09 — Location Data

**Prerequisite:** Read `prompts/00-cit-master-reference.md` (§2 Facts, §9 Images).

## Goal
Update the location dataset to CIT's **Tumakuru campus**, with North-East states
as the audience/served region (the students come FROM the NE; the campus is in
Karnataka — frame it clearly).

## Files to edit
- `src/data/locationData.js`

## Requirements
Set the object using canonical §2 data:
- `name: "Channabasaveshwara Institute of Technology (CIT)"`
- `address: "NH 206, B.H. Road, Gubbi, Tumakuru – 572 216, Karnataka"`
- `city: "Tumakuru"`, `state: "Karnataka"`
- `phone: "+918867354168"`, `phoneDisplay: "+91 88673 54168"`
- `altPhone: "+919342123255"` (and you may add the third number in copy)
- `email: "admin@cittumkur.org"`, `website: "www.cittumkur.org"`
- `whatsapp: "918867354168"`
- `mapUrl`: placehold.co map image, e.g.
  `https://placehold.co/800x500/EAF1FB/0B3D91?text=CIT+Tumakuru+Campus+Map`
- Repurpose `nearbyAreas` → nearby/landmarks for the campus (e.g. Gubbi,
  Tumakuru City, Bengaluru ~70 km, NH-206, Kyathsandra) — used by the location UI.
- `servingStates` → the 8 NE states (Assam, Arunachal Pradesh, Manipur,
  Meghalaya, Mizoram, Nagaland, Tripura, Sikkim) — these are the **audience**
  states. Add a short note in a new field if the UI supports it, e.g.
  `audienceNote: "Welcoming students from across North East India"`. Only add
  fields the UI reads, or add and then surface them in prompt 18.

## Constraints
- Do not break keys consumed by `LocationSection.jsx` / footer (verify usage).
- placehold.co map image only.

## Acceptance criteria
- Location points to Tumakuru, Karnataka with CIT contacts.
- NE states represented as the served/audience region.
- No Guwahati/Monjoven address remains.
