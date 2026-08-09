# 04 — Landing Content Part 2: CTA Re-Pointing, Copy Cleanup, Trust Proof, FAQ

**Prerequisite:** `update-prompts/03-landing-content-part1-hero-fees-process-eligibility.md`
completed. Read `update-prompts/README.md`.

## Goal

Finish the funnel switch: every remaining CTA on the site sends visitors to
`/apply` (the enquiry drawer is no longer reachable from anywhere), the copy stops
recruiting freebie-seekers, the trust-destroying placeholder recruiter wall is
fixed, and the page gains social proof scaffolding and an FAQ section.

## Files to edit

- **NEW** `src/hooks/useApplyCTA.js` — shared CTA handler (track + preload + navigate)
- All `openLeadDrawer` call sites — find with
  `grep -rln "openLeadDrawer" src/ --include="*.jsx"` and re-point every one
  EXCEPT `ModalContext.jsx` (definition — protected) and `App.jsx`'s
  `LeadFormDrawerWrapper` (drawer mount — protected). Actual call-site files:
  `AboutSection`, `WhyChooseCIT`, `ServicesSection`, `StatsSection`,
  `FeaturesSection`, `LocationSection`, `CTASection`, `SecondaryCTASection`,
  `HeroSection` (if any remain after prompt 03), `Header`, and — critically —
  `App.jsx`'s `handleEnquiryClick` (a LIVE path: it feeds BOTH
  `MobileNavigation`'s Apply item and `MobileDrawer`'s "Apply for 2026
  Admission" button via props; `MobileNavigation.jsx`/`MobileDrawer.jsx`
  themselves contain no `openLeadDrawer` calls and need no edits). Verify with
  the grep, miss none.
- `src/utils/applicationSubmit.js` — already reads `cit_apply_source` (prompt 02); verify only
- `src/pages/Apply/Apply.jsx` — draft initializer reads `cit_apply_course` (§2.2; additive only)
- `src/components/sections/StatsSection/StatsSection.jsx` — recruiter wall fix
- **NEW** `src/components/sections/TestimonialsSection/TestimonialsSection.jsx` (+ `.module.css`, `index.js`)
- **NEW** `src/components/sections/FAQSection/FAQSection.jsx` (+ `.module.css`, `index.js`)
- **NEW** `src/data/faqData.js`, **NEW** `src/data/testimonialsData.js`
- Copy tone-down across: `HeroSection`, `WhyChooseCIT`, `CTASection`,
  `SecondaryCTASection`, `ContactSection`, `UnifiedLeadForm`-independent trust
  copy in section files (see §3)
- `src/config/seo.js` — FAQ JSON-LD source of truth
- `src/App.jsx` — mount the two new sections (order in §4/§5)

## Requirements

### 1. `useApplyCTA(source)` hook

Returns `{ onClick, onPointerDown }`:
- `onPointerDown`/`onTouchStart` → preload the Apply chunk (helper from
  `src/pages/Apply/index.js`).
- `onClick` → fire the existing GTM `cta_click` event with the given source
  string (reuse the tracking call currently made by `openLeadDrawer` — call
  `trackCTAClick` from `src/utils/gtm.js` directly), store the source in
  sessionStorage key `cit_apply_source`, then `navigate('/apply')`.
- `src/utils/applicationSubmit.js` already consumes `cit_apply_source` per the
  README source contract (base + `/step1-partial` or `/full` suffix, e.g.
  `apply-now/step1-partial`) — no change needed here, just keep the keys
  consistent.

### 2. Re-point every CTA (the drawer becomes unreachable)

1. Replace each `openLeadDrawer('<key>')` call with `useApplyCTA('<same key>')`
   so source attribution is preserved. The only keys in use today are
   `apply-now`, `get-details`, `request-callback`, and `default` (there are NO
   per-course source keys — course cards share `apply-now` and pass the course
   in `extraData`, which is currently a broken no-op; the course now rides in
   `cit_apply_course` per §2.2).
2. Course cards in `ServicesSection`: additionally store the card's course label
   in sessionStorage `cit_apply_course` — exact `COURSE_OPTIONS` em-dash strings
   (map the data-file names to the option strings; they currently differ) — and
   pre-select it in `/apply` Step 1 when present (small additive edit in the
   Apply page's draft initializer).
3. The mobile Apply surfaces (`MobileNavigation` Apply item + `MobileDrawer`
   apply button) are both driven by `handleEnquiryClick` in `App.jsx`'s
   `HomePageContent` — change THAT function to track (`cta_click`, source
   `apply-now`) and `navigate('/apply')`. Do not touch `MobileNavigation.jsx` /
   `MobileDrawer.jsx` structure, animations, or open/close mechanics, and do
   not touch `LeadFormDrawerWrapper`.
4. Update CTA labels page-wide: primary CTAs read `Start My Application` (or
   `Apply for 2026 Admission` where space is tight); no CTA says "Enquire".
5. `App.jsx`'s `LeadFormDrawerWrapper` and the drawer/modal components stay
   mounted and untouched (dead but present) — CLAUDE.md protection; removal is a
   later decision.

### 3. Copy tone-down (find with grep, exact replacements)

1. `grep -rni "100% Free\|Free Guidance\|Free counselling\|Free Admission Guidance\|free consultation" src/` — replace every instance with `No consultancy or agent fees` (adjust casing/grammar in place) EXCEPT inside `UnifiedLeadForm.jsx` (protected file, unreachable UI — its "100% Free Guidance" trust badge stays untouched). Expected end state: zero instances outside `UnifiedLeadForm.jsx`.
2. Scarcity sweep: `grep -rni "Limited Seats\|Filling Fast\|apply early\|close quickly\|Limited 2026" src/` — keep exactly ONE instance: the hero badge `Direct B.E. Admission 2026 • Limited Seats`. Rewrite all others into process/value statements (e.g. `2026 seats are allotted in order of completed applications` in CTASection — factual, no countdown). `UnifiedLeadForm.jsx`'s "Limited 2026 Seats" badge is protected and stays (unreachable UI) — expected end state: one instance outside `UnifiedLeadForm.jsx`.
3. `grep -rni "trips to Karnataka\|counselling trips\|CET trips\|simple paperwork" src/` (case-insensitive — the real copy is lowercase and includes sibling phrasings in `CTASection.jsx`, `WhyChooseCIT.jsx`, `featuresData.js`, and `src/config/seo.js`) — reframe to support language: `We guide you through every step — eligibility, documents, travel and hostel.`
4. ContactSection: remove the `PG & Research (M.Tech / MBA / MCA)` block (off-scope, generates off-target leads). Align the response-time promise to one statement: `Our admission team responds within 24 hours, Monday–Saturday.`
5. Keep all accreditation copy (NAAC, AICTE, VTU, ISO, CET E101, COMED-K E035) untouched.

### 4. Trust proof

1. **Recruiter wall (`StatsSection.jsx`):** delete the `placehold.co` logo
   generator. Render recruiter names as styled text chips (brand-tinted pills,
   same grid) — real logos can replace them later via a single
   `RECRUITER_LOGOS` map where a name → image URL entry flips that chip to an
   `<img>`. Placeholder images must be impossible to ship.
2. **NEW `TestimonialsSection` (`#student-stories`)** — H2 `Students From the
   North East, Now at CIT`; 3 testimonial cards (name, home town + state, branch,
   quote, photo slot). Populate from `src/data/testimonialsData.js` where every
   entry is wrapped in `SAMPLE_TESTIMONIALS` with this comment block at the top:
   `// ⚠ LAUNCH BLOCKER: sample structure only. Replace with real, consented
   student testimonials (name, hometown, branch, quote, photo) before going
   live. Publishing fabricated testimonials violates ASCI guidelines and
   destroys trust.` The section renders ONLY when
   `testimonialsData.isLive === true`; sample data ships with `isLive: false`
   (section hidden in production until real content lands). Photo slots use
   initials-avatars, not placehold.co.
3. Mount TestimonialsSection after StatsSection (placements), before Highlights.

### 5. FAQ section

1. **NEW `FAQSection` (`#faq`)** mounted after Location, before CTASection.
   Accessible accordion (`<details>/<summary>` or ARIA button pattern — no MUI
   Accordion, no framer-motion).
2. `src/data/faqData.js` — 8 Q&As covering: direct-admission meaning &
   legitimacy (VTU-affiliated, college-direct), eligibility (mirror
   EligibilityStrip), documents needed, how fees are shared (transparent, on
   first call, no amounts), education-loan help, hostel & food for NE students,
   placement reality (85%+ for eligible students, 90+ recruiters), how
   parents/guardians are involved in counselling. Each answer ends factual, no
   scarcity, ≤ 60 words.
3. Sync `src/config/seo.js`'s FAQ JSON-LD to source from `faqData.js` so page
   and schema can't drift.

## Constraints

- DO NOT modify `ModalContext.jsx`, `LeadFormDrawer.jsx`, `UnifiedLeadForm.jsx`,
  `webhookSubmit.js`, or the mobile nav's open/close mechanics.
- No new npm dependencies; no framer-motion in the new sections; lazy-load both.
- 2026-only copy; no fee amounts; no fabricated stats or live fake testimonials.
- Preserve every `cta_click` source key so campaign reporting stays continuous.

## Acceptance criteria

- [ ] `grep -rn "openLeadDrawer" src/` → matches ONLY in `src/context/ModalContext.jsx` (definition) and `src/App.jsx`'s `LeadFormDrawerWrapper`; `handleEnquiryClick` in `App.jsx` no longer calls it.
- [ ] `grep -rn "placehold.co" src/components/sections/StatsSection` → no matches.
- [ ] `grep -rni "100% Free\|Free counselling\|Free Guidance" src/` → matches only inside `UnifiedLeadForm.jsx` (protected, unreachable).
- [ ] `grep -rni "Limited Seats\|Filling Fast" src/` → exactly one match outside `UnifiedLeadForm.jsx` (the hero badge).
- [ ] `grep -n "M.Tech\|MBA\|MCA" src/components/sections/ContactSection/ContactSection.jsx` → no matches.
- [ ] `grep -n "isLive" src/data/testimonialsData.js` → `false`; TestimonialsSection absent from the rendered page until flipped.
- [ ] FAQ answers in `faqData.js` match the JSON-LD in `seo.js` (single source).
- [ ] `npm run build` passes; manual at 360 px: every CTA (including mobile sticky nav Apply) lands on `/apply`, with course pre-selected when coming from a course card.
