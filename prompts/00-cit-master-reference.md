# 00 — CIT Master Reference (read this first, every time)

> This file is the **single source of truth** for every other prompt in this
> folder. Whenever a prompt says "use the canonical data", it means the data
> below. Do not invent facts about CIT that are not here. If something is not
> listed, keep it generic or omit it rather than fabricate.

---

## 1. The campaign in one sentence

A landing page for **Channabasaveshwara Institute of Technology (C.I.T)** to
capture **quality leads for Direct B.E. (Engineering) Admissions — 2026 intake**,
targeted at **students & parents across North East India**, marketed by
**Assam Digital** through Google Ads & Meta.

**Primary conversion goal:** the visitor submits the **Unified Lead Form**
(or taps call/WhatsApp). Everything on the page exists to drive that action.

---

## 2. Institution facts (verified from the resource images)

- **Name:** Channabasaveshwara Institute of Technology
- **Short name / brand:** C.I.T (display as "CIT")
- **Tagline:** "Partnering in Academic Excellence"
- **Milestone:** Celebrating **25 Years** of academic excellence
- **Accreditations & approvals:**
  - NAAC Accredited
  - ISO 9001:2015 Certified
  - Affiliated to **VTU, Belagavi** (Visvesvaraya Technological University)
  - Approved by **AICTE, New Delhi**
- **Admission codes:** CET Code **E101** · COMED-K Code **E035**
- **Campus address:** NH 206, B.H. Road, Gubbi, **Tumakuru – 572 216, Karnataka**
- **Corporate office:** CITRS, 1st Floor, Sridagange Complex, B.H. Road, Tumakuru
- **Phones:** +91 8867354168 · +91 9342123255 · +91 9886115105
- **Email:** hr@cittumkur.org · admin@cittumkur.org
- **Website:** www.cittumkur.org

> **Lead-capture contact for THIS campaign (Assam Digital):** keep the CIT phone
> numbers above as the public call/WhatsApp CTAs. Use the **first number
> (+91 8867354168)** as the primary click-to-call/WhatsApp throughout, unless a
> prompt says otherwise.

---

## 3. B.E. (Engineering) programs — the ONLY courses to feature

Use these seven B.E. branches everywhere a course list/dropdown is needed:

1. **B.E. — Artificial Intelligence & Data Science** (badge: "High Demand")
2. **B.E. — Computer Science & Engineering** (badge: "Most Popular")
3. **B.E. — Information Science & Engineering**
4. **B.E. — Electronics & Communication Engineering**
5. **B.E. — Electrical & Electronics Engineering**
6. **B.E. — Mechanical Engineering**
7. **B.E. — Civil Engineering**

> Do **not** surface PG (M.Tech/MBA/MCA), Ph.D, PU College, Polytechnic, or the
> "CIT Group of Institutions" allied schools as primary content. This page is
> strictly B.E. direct admissions. (A single low-key "PG & research also
> available — ask us" line in the footer/contact is the maximum allowed.)

---

## 4. Placement & outcome stats (proof points — high converting)

- **90+** reputed companies visit campus every year
- **85%+** overall placement for eligible students (consistent over the last 8 years)
- **Highest CTC: 15 LPA**
- **Median CTC: 5 LPA**
- Awarded for **excellent placement of B.E. students in rural India**
- VTU **Rank Holders & Gold Medalists** every year (e.g. VTU 7th Rank, CGPA 9.43)

**Major recruiters** (use as placeholder logo wall — these are real recruiters):
Accenture, Infosys, Deloitte, HCLTech, TCS, Tech Mahindra, Cognizant, Wipro,
Mphasis, IDFC First Bank, Zscaler, UST, NTT Data, Bosch, Park Controls, Boomi.

---

## 5. Infrastructure & academic highlights (differentiators)

- State-of-the-art computing facilities with **ICT-enabled classrooms**
- Robust **R&D-oriented environment**; internships in cutting-edge tech + project-based learning
- **Centre for Creativity in Engineering** with start-up incubation, data centre & private cloud
- **4-Star rating** by the Institution's Innovation Council (IIC), MHRD (AY 2024-25)
- **IOS-MCN R&D Centre** in collaboration with **Bharat 6G Labs**
- **Aero-vision Drone Lab** — AICTE-sponsored Centre of Excellence
- **Brain-Computer Interface (BCI) R&D Lab**, IoT & Embedded Systems R&D Lab
- **21 patents filed** and **₹2 crore** in research grants
- Consistent **VTU rank** performance every year
- Active **Institution–Industry Cell**

---

## 6. Awards & recognition (trust timeline)

- **2016** — Excellent Engineering Institution in Rural India (National Education Summit)
- **2018** — Most Promising Engineering Institution (Leaders Conclave)
- **2019** — Outstanding & Positive Accomplishment of the Institution (Academic Insights)
- **2021** — Best Engineering College for Building Global Technocrats for Rural Talents
- **2024** — Outstanding Contribution to Rural Engineering Education (Federation for World Academics, New Delhi)
- **2025** — **Best Brand** (IIRF, New Delhi) for academic performance

---

## 7. Why "Direct Admission" angle matters (the campaign hook)

North-East students often find Karnataka's CET/COMED-K counselling confusing and
far away. CIT offers a **guided direct-admission pathway** for the 2026 B.E.
intake. Lead the messaging with:

- **Direct B.E. admission for 2026 — simple, guided, no confusing counselling trips**
- **Hostel & mess facilities** — safe, supportive home away from home for NE students
- **End-to-end admission guidance** from the Assam Digital / CIT NE desk
- **NAAC-accredited, AICTE-approved degree** with strong placements
- **Limited seats — apply early for the 2026 intake**

> Tone: aspirational, trustworthy, parent-reassuring. Avoid any guarantee of
> admission/job; say "guided assistance", "strong placement record", etc.

---

## 8. Brand colour system (use consistently EVERYWHERE)

CIT branding is blue + red with a warm CTA accent. Replace the boilerplate's
medical teal/navy palette with:

| Token | Hex | Use |
|-------|-----|-----|
| `--color-primary` | `#0B3D91` | Deep CIT blue — headers, primary surfaces |
| `--color-primary-dark` | `#072A66` | Darker blue — gradients, hovers |
| `--color-secondary` | `#C8102E` | CIT red — accents, section labels, badges |
| `--color-accent` | `#F4A300` | Gold/Amber — **primary CTA buttons only** |
| `--color-accent-dark` | `#D98C00` | CTA hover |
| `--color-success` | `#1E8E5A` | Placement/positive highlights |
| `--color-tint` | `#EAF1FB` | Light blue card/section backgrounds |
| `--color-text` | `#11203A` | Body text on light |
| `--color-white` | `#FFFFFF` | — |

The boilerplate hardcodes the old teal `#148F77` / `#1ABC9C` and navy `#1A5276`
in many JSX `sx` props and CSS modules. Every prompt that touches a file must
swap those for the tokens above (blue for navy/teal structural colour, amber for
CTA orange `#FF6B35`).

**Fonts:** keep the existing Poppins (headings) + system/body stack. No change.

---

## 9. Placeholder images — strict format

The user will replace all images later. For every image use **placehold.co**
with a **visible descriptive label** and brand colours:

```
https://placehold.co/{WIDTH}x{HEIGHT}/{BG_HEX}/{TEXT_HEX}?text={Readable+Label}
```

Rules:
- Background = `0B3D91` (blue) or `EAF1FB` (light) ; text = `FFFFFF` or `0B3D91`.
- The `text=` label must describe the image, e.g.
  `?text=CIT+Campus+Aerial`, `?text=CIT+Logo`, `?text=CSE+Lab`,
  `?text=Placement+Drive`, `?text=Hostel+Block`, `?text=Recruiter+Logo`.
- Use sensible sizes: logo `200x60`, hero `1600x900`, cards `600x400`,
  recruiter logos `160x80`, avatars `120x120`, map `800x500`.
- Replace the existing Cloudinary hero/map URLs with placehold.co equivalents.

---

## 10. Unified Lead Form spec (the conversion core)

The form must stay a single reusable component but capture **admission-relevant**
fields. Keep it short — 5 visible fields max.

**Fields (in order):**
1. **Full Name** (text, required) — existing
2. **Mobile Number** (10-digit, +91, required) — existing
3. **Email** (optional, validated if present) — existing
4. **Course Interested In** (dropdown, required) — replaces "service_interest".
   Options = the 7 B.E. branches from §3, plus a final **"Not Sure — Need Guidance"**.
5. **State** (dropdown, required) — NE states: Assam, Arunachal Pradesh, Manipur,
   Meghalaya, Mizoram, Nagaland, Tripura, Sikkim, plus "Other".
6. **Message** (optional textarea) — keep, relabel placeholder to
   "Any question about admission, hostel, or fees? (optional)".

**Submit button label:** "Apply for 2026 Admission" (or "Get Admission Details").
**Trust badges under form:** "100% Free Guidance", "Limited 2026 Seats",
"NAAC Accredited" (swap the medical confidentiality badges).
**Consent line:** "By submitting, I agree to be contacted by CIT / Assam Digital
about 2026 B.E. admissions." + link to a CIT-appropriate Privacy Policy.
**Success message:** "Thank you! Our admission team will call you shortly to
guide you through the 2026 B.E. direct-admission process."

> Keep the field key plumbing working: the webhook payload currently uses
> `service_interest`. You may keep that JSON key but **relabel it as the course**,
> OR rename to `course_interest` consistently across `UnifiedLeadForm.jsx`,
> `webhookSubmit.js` payload, `leadService.js`, and the admin lead views. Pick one
> and apply it everywhere so the admin panel still shows the value.

---

## 11. Suggested page section order (final landing page)

1. **Header** (sticky): CIT logo, anchor nav, phone + "Apply Now" CTA
2. **Hero**: "Direct B.E. Admission 2026 at CIT" + lead form (desktop) + trust badges
3. **About CIT**: 25 years, accreditations, why CIT in 3-4 points
4. **Why CIT / Direct-Admission advantages** (the repurposed USP+CTA band)
5. **Courses** (7 B.E. branches)
6. **Placements & Recruiters** (stats + logo wall)
7. **Infrastructure & Labs** (highlights)
8. **Campus Life & Awards** (hostel/facilities + recognition timeline)
9. **Location** (Tumakuru campus + reaching from NE)
10. **CTA band** (Apply for 2026)
11. **Contact** (details + form)
12. **Secondary CTA / urgency** (limited seats)
13. **Footer**

Keep it tight — this should feel like a focused campaign page, not a full college
website.

---

## 12. Global rules (repeat of README — apply always)

- Zero Monjoven/medical traces anywhere.
- CIT + B.E. + 2026 + North East only.
- Minimal, benefit-led, scannable copy.
- placehold.co images with labels; CIT brand colours.
- Never break form/tracking/drawer/mobile-nav/animation logic.
- Mobile-first; verify at 360px.
- No fabricated stats — only use numbers from this file.
