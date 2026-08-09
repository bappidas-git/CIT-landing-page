# 02 — Site-Wide Narrative Overhaul: Merit Selection, Seats-Left Counters, "How the Selection Works"

> **Series:** CIT Landing Page Repositioning (prompt 2 of 10). **Depends on:** prompt 01 (`src/data/meritProgram.js` must exist — if it doesn't, create it first exactly as specified in `01-hero-identity-and-disambiguation.md`).
> **You are:** Claude Code in a fresh session with full repo access. The hero was already repositioned by prompt 01; this prompt does everything below the hero.

## The new narrative (drive every section toward it)

Old story (remove everywhere): *free counselling → direct admission → we guide you → apply in 3 minutes*.
New story: **Session 2026 is almost closed → only 15 seats remain across 7 branches → CIT fills them on merit via the 30-Minute Online Merit Assessment Test (CIT Merit-Based Selection Program 2026) → this is a second chance for talented students who couldn't clear JEE/KCET/COMEDK → qualifying now beats dropping a year for coaching with no guarantee → CIT's placements & VTU results prove it's worth earning → apply now.**

Tone: serious, selective, exam-like, aspirational, urgent. Simple English for Tier-2/Tier-3 students & parents. Admission is **earned**, never handed out. No "free" anything, no fake scarcity beyond the true 15-seat figure, no invented stats.

## Ground rules

- Exact program names: "**30-Minute Online Merit Assessment Test**", "**CIT Merit-Based Selection Program 2026**". Seats: **15 total** — CSE 2, AI & DS 2, ISE 2, ECE 2, EEE 2, Civil 3, Mech 2 (import from `src/data/meritProgram.js`, don't hard-code).
- **No fee amounts on the landing page.** Fee numbers appear only inside the `/apply` form (prompt 04). Landing copy may say the full year-wise fee structure is shown transparently inside the application.
- **DO NOT MODIFY** (CLAUDE.md): `src/utils/webhookSubmit.js`, `src/utils/validators.js`, `src/utils/swalHelper.js`, `src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx`, `src/components/common/LeadFormDrawer/LeadFormDrawer.jsx`, `src/context/ModalContext.jsx`, MobileDrawer/MobileNavigation open-close mechanics. Three inventory hits live inside those files (`100% Free Guidance` + `Limited 2026 Seats` badges in UnifiedLeadForm ~1202/1213, `Book a free counselling call` in ModalContext ~42). **Leave them** — the drawer has zero call sites and never renders. Do not re-point any CTA at the drawer.
- **Do not touch in this prompt:** `src/pages/Apply/**` and `src/pages/ThankYou/**` (owned by prompts 04/05), `StatsSection`/stats data (owned by prompt 03), HeroSection (done in 01), admin panel (prompt 10).
- CTA behavior: labels may change; `useApplyCTA` source keys (`apply-now`, `get-details`, `request-callback`), `cta_click`/GTM event names, and `/apply` routing must not change.
- Mobile-first 360 px; keep existing component/animation patterns; `npm run build` must pass.

## Kill list — every remaining "effortless admission" hit (verified inventory with line numbers; re-grep to confirm before and after)

Rewrite or delete each of these in place (files not on the do-not-modify list):

| File | Line(s) | Current text | Action |
|---|---|---|---|
| `src/data/serviceDetailsData.js` | 6, 19, 32, 45, 58, 71, 84 | `commencement: "2026 Intake — Direct Admission Open"` ×7 | → `"Session 2026 — Final Closure · Merit-Based Selection"` |
| `src/data/serviceDetailsData.js` | 25 | `"Most popular branch — high demand seats fill early"` | Replace with the branch's true seats-left line (see counters below) |
| `src/components/sections/CTASection/CTASection.jsx` | ~93 | `Direct B.E. Admission · 2026 Intake` | → `CIT Merit-Based Selection Program 2026` |
| ″ | ~96–104 | `Ready to Secure Your B.E. Seat for 2026?` + `…2026 seats are allotted in order of completed applications.` | New copy: seats are **earned through the merit test**, not allotted first-come. E.g. title `15 Seats. One Test. Your Second Chance.`; sub: apply → login key → 30-minute test → qualify → counselling within 24 hours. |
| ″ | ~23 | reassurance `"No consultancy or agent fees — you deal with the college directly"` | Keep the fact, reframe: `"You deal directly with the college — no agents, no consultancy fees, full fee structure shown inside the application"` |
| `src/components/sections/SecondaryCTASection/SecondaryCTASection.jsx` | ~88, 98–99, 109–113 | `Direct B.E. Admission — 2026 Intake` badge; `…allotted in order of completed applications` | Same repositioning as CTASection; closing argument = don't lose an academic year: `A drop year for coaching costs ₹ lakhs and a full year — with no guaranteed seat. Qualify in CIT's merit test and start your B.E. now.` (no specific coaching-fee number) |
| ″ | ~39–41, 45 | trust items `No consultancy or agent fees` / `Direct college admission`; WhatsApp prefill `"Hi, I'd like to apply for Direct B.E. Admission 2026…"` | Reframe trust items (merit program, direct-to-college); prefill → `"Hi CIT Admissions, I want to apply for the CIT Merit-Based Selection Program 2026 (15 seats). Please share the details."` |
| `src/components/sections/WhyChooseCIT/WhyChooseCIT.jsx` | ~25–27 | `objection: "Confused by Karnataka CET / COMED-K counselling?"` + guided-direct-pathway answer | This is now the **second-chance card**: `"Couldn't clear JEE / KCET / COMEDK this year?"` → answer: dropping a year for coaching costs a valuable academic year with no guarantee; CIT's merit-based selection lets talented students prove themselves in a 30-minute online test and start now. |
| ″ | ~45, 176–182, 202 | `"End-to-end direct B.E. admission guidance…"`, `The CIT Direct-Admission Promise`, `Guided B.E. Admission for the 2026 Intake`, `Direct Admission · 2026 Intake` | Rebuild around "The CIT Merit Promise": selective, transparent, proof-driven |
| `src/components/sections/FeesFundingSection/FeesFundingSection.jsx` | ~26–40, 114–120, 144–147 | `No hidden charges…full fee structure…shared in writing on your first counselling call`, `"Direct admission at CIT means you deal with the college — not agents."`, `Want the full fee structure? Submit your application — our counsellor shares it on the very first call.` | Keep the three cards' honesty but re-anchor: the **complete year-wise fee structure for all 7 branches is shown inside the application form itself** (Step 5) before you submit; education-loan guidance (loans covering ~80% of total study cost, in the student's own name, repaid after placement — details on the tele-counselling call); scholarships/concessions discussed on the qualification call. No numbers here. |
| `src/components/sections/AdmissionProcessSection/AdmissionProcessSection.jsx` | whole `steps` array (~26–46) + headings (~112–125, 167) | 4 steps starting `Apply online (3 minutes)` / `instant` / `Eligibility & counselling call` | Replace with the 5-step **"How the selection works"** below |
| `src/components/sections/ServicesSection/ServicesSection.jsx` | ~229–231 | `"…strong placement record, and end-to-end admission guidance…"` | → merit-program framing + seats-left counters (below) |
| `src/components/sections/AboutSection/AboutSection.jsx` | ~127–130 | `"…CIT is now welcoming students from North East India for direct B.E. admission in the 2026 intake."` | → `"…CIT is closing Session 2026 with a merit-based selection for the final 15 seats — open to talented students across India, including the North East."` Keep every credential/award claim as-is (all verified). |
| `src/components/sections/LocationSection/LocationSection.jsx` | ~174, 359–360 | WhatsApp prefill + `"…the 2026 B.E. direct-admission process"` | Merit-program wording; keep all travel/hostel/NE content (true and useful) |
| `src/components/sections/ContactSection/ContactSection.jsx` | ~58, 123–124, 289–290 | WhatsApp prefill + `direct-admission` + `counsellor responds…` | Merit-program wording; "admission office responds within 24 hours" is fine |
| `src/data/featuresData.js` | ~68–70 | `title: "Guided Direct-Admission Support"` | → `"Merit-Based, Transparent Admission"` (support facts stay) |
| `src/components/sections/FeaturesSection/FeaturesSection.jsx` | ~159–161 | `"Hostel, mess, guided admission and an inclusive campus…"` | drop "guided admission", keep the rest |
| `src/components/common/Footer/Footer.jsx` | ~235–236, 367; privacy modal ~32, 67 | `Guided Direct B.E. admissions for the 2026 intake…`, `· Direct B.E. Admissions 2026` | → merit-selection identity; privacy modal wording: "about B.E. admissions 2026 at CIT" (plain) |
| `src/components/common/MobileNavigation/MobileNavigation.jsx` | ~17 | WhatsApp prefill `"Hello CIT, I'd like guidance on Direct B.E. admission 2026."` | → merit-program prefill (**content-only change — allowed**; do not touch open/close mechanics) |
| `src/data/faqData.js` | all 8 entries | Q1 explains "direct admission"/management quota; counselling-call framing throughout | Full rewrite — see below |
| `public/index.html` | ~217–262 | six hard-coded FAQ JSON-LD entries incl. `"no confusing counselling trips required"` | Sync to the new FAQ (same Q/A text as `faqData.js`, first 6 entries) |
| `src/theme/muiTheme.js` ~4, `src/styles/variables.css` ~4 | header comments `Direct B.E. Engineering Admissions 2026` | Update comment text only |

Also sweep with `grep -rniE "direct admission|direct b\.e\.|free counselling|3 minutes|instant|allotted in order" src/ public/ --include='*.{js,jsx,html,json,xml}'` after editing; remaining hits must only be inside the four do-not-modify files, `src/pages/Apply/**`, `src/pages/ThankYou/**` (later prompts), or admin guideline content (`src/admin/pages/guidelineContent/` — out of scope, internal docs).

## New section content

### A. "How the selection works" — rebuild `AdmissionProcessSection` with exactly these 5 steps

1. **Fill the application form** — tell us who you are, your 12th marks, family details, and see the complete fee structure before you submit.
2. **Receive your unique Test Login Key** — shown instantly after submission; keep it safe.
3. **Take the 30-Minute Online Merit Assessment Test** — 30 MCQs (15 Maths + 15 Physics, Class-12 level), 60 seconds per question, +4 marks per correct answer.
4. **If you qualify — tele-counselling within 24 hours** — CIT's Counselling Officer calls at the time you choose. Keep your marksheets ready and your parents with you (~15 minutes).
5. **Final admission** — against one of the 15 remaining seats for Session 2026.

Section heading direction: `How the Selection Works` / sub: `Five steps between you and one of the last 15 seats.` Keep the existing step-card layout/animation; update `EligibilityStrip` usage if its 45%-eligibility text renders here (that eligibility fact stays true — keep it).

### B. Per-branch seats-left counters — `ServicesSection` + `serviceDetailsData.js`

- Import `MERIT_BRANCHES` from `src/data/meritProgram.js`. Match branches to service cards by name (`servicesData.js` ids: computer-science, ai-data-science, information-science, electronics-communication, electrical-electronics, mechanical, civil).
- On each course card render a prominent seats-left badge: `Only 2 seats left` (Civil: `Only 3 seats left`) + `Session 2026 — Final Closure`. Style: urgent but factual (accent color, no countdown timers).
- Update each branch's `badge`/`frequency` lines where they conflict (`"Most Popular"`/`"High Demand"` may stay — they're demand facts, not admission promises).
- Section subtitle mentions the total: `Seven VTU-affiliated B.E. branches — 15 seats in total remain for Session 2026, filled strictly on merit.`

### C. FAQ rewrite — `src/data/faqData.js` (schema auto-propagates via `src/config/seo.js` → keep the same export shape)

Replace the 8 entries with (draft answers in simple English, 2–4 sentences each; no fee numbers; no "free"):

1. **What is the CIT Merit-Based Selection Program 2026?** — final 15 seats across 7 B.E. branches, filled through a 30-minute online merit test instead of first-come enquiry.
2. **Who should apply?** — talented students who could not clear JEE/KCET/COMEDK for any reason; 12th (PCM) as per VTU eligibility (45% aggregate in Physics+Maths+one more science subject; 40% reserved categories); appearing-2026 students may apply.
3. **How does the 30-Minute Online Merit Assessment Test work?** — 30 MCQs: 15 Maths + 15 Physics, Class-12 standard; 60 seconds per question; +4 per correct, 0 for wrong/unanswered; no going back; one attempt with your Login Key.
4. **What happens after the test?** — if you qualify, CIT's Counselling Officer tele-counsels you within 24 hours at the slot you pick; keep marksheets ready, parents present (~15 min).
5. **Why not drop a year and re-attempt entrance exams?** — a drop year costs a full academic year and coaching money with no guaranteed seat; qualifying here starts your engineering journey now.
6. **How will I know the fees?** — the complete year-wise fee structure for every branch (tuition, admission fee, extra fees, hostel) is shown inside the application form itself, before you submit. No capitation, no consultancy or agent charges — you pay the college directly.
7. **Can my family get an education-loan?** — yes; for qualified students CIT's team explains how an education loan in the student's own name can cover about 80% of the total study cost including hostel, repaid after placement. Details on the tele-counselling call.
8. **Is hostel available for outstation / North East students?** — keep the existing true hostel/mess/security answer.

Then sync `public/index.html` JSON-LD FAQ fallbacks (~217–262) to the first 6 of these — the static copies must not contradict the runtime ones.

### D. Fees & Funding + CTA bands + About + Features — apply the kill-list rewrites above, keeping every verified credential claim (NAAC/AICTE/VTU/ISO, 25 years, IIRF 2025, 4★ IIC, 21 patents, hostel facts) untouched.

## Acceptance criteria

- [ ] Every kill-list row is done; the post-edit grep shows no remaining hits outside do-not-modify files, `src/pages/Apply/**`, `src/pages/ThankYou/**`, and `src/admin/pages/guidelineContent/**`.
- [ ] AdmissionProcessSection shows the exact 5-step selection flow; ServicesSection cards show per-branch seats-left summing to 15; FAQ (page + `index.html` JSON-LD) tells the merit story.
- [ ] "30-Minute Online Merit Assessment Test" and "CIT Merit-Based Selection Program 2026" are spelled identically everywhere they appear.
- [ ] No fee amounts anywhere on the landing page; no "free", no invented stats, no countdown timers.
- [ ] All CTAs still navigate to `/apply` with unchanged source keys and GTM event names; drawer still unreachable.
- [ ] The unreachable drawer files (`UnifiedLeadForm`, `LeadFormDrawer`, `ModalContext`) have zero diff.
- [ ] 360 px check on every edited section: no overflow, counters readable.
- [ ] `npm run build` passes; `npm start` renders every section without console errors.
