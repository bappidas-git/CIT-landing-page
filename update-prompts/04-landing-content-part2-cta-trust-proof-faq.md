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
  EXCEPT the protected files (`ModalContext.jsx`, `App.jsx`'s
  `LeadFormDrawerWrapper`, `LeadFormDrawer.jsx` internals). Expected call sites
  include: `AboutSection`, `WhyChooseCIT`, `ServicesSection`, `StatsSection`,
  `FeaturesSection`, `LocationSection`, `CTASection`, `ContactSection`,
  `SecondaryCTASection`, `Header`, `MobileDrawer`, `MobileNavigation` — verify
  with the grep, miss none.
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
- `src/utils/applicationSubmit.js`: read `cit_apply_source` and set it as the
  lead's `source` (fallback `'apply-direct'`), suffixing the step tag for
  partials, e.g. `courses-cse → courses-cse/step1-partial`. Small additive edit.

### 2. Re-point every CTA (the drawer becomes unreachable)

1. Replace each `openLeadDrawer('<key>')` call with `useApplyCTA('<same key>')`
   so source attribution is preserved (`apply-now`, `get-details`,
   `request-callback`, course-card keys, etc.).
2. Course cards in `ServicesSection`: additionally store the card's course label
   in sessionStorage `cit_apply_course` — exact `COURSE_OPTIONS` em-dash strings
   (map the data-file names to the option strings; they currently differ) — and
   pre-select it in `/apply` Step 1 when present (small additive edit in the
   Apply page's draft initializer).
3. `MobileNavigation`'s "Apply" item must navigate to `/apply`. Change ONLY the
   item's action/target — do not touch the nav's structure, animations, or
   open/close mechanics.
4. Update CTA labels page-wide: primary CTAs read `Start My Application` (or
   `Apply for 2026 Admission` where space is tight); no CTA says "Enquire".
5. `App.jsx`'s `LeadFormDrawerWrapper` and the drawer/modal components stay
   mounted and untouched (dead but present) — CLAUDE.md protection; removal is a
   later decision.

### 3. Copy tone-down (find with grep, exact replacements)

1. `grep -rn "100% Free\|Free Guidance\|Free counselling\|Free Admission Guidance\|free consultation" src/` — replace every instance with `No consultancy or agent fees` (adjust casing/grammar in place). ONE instance may remain page-wide (keep the one in the hero checklist card from prompt 03).
2. Scarcity sweep: `grep -rn "Limited Seats\|Filling Fast\|apply early\|close quickly\|Limited 2026" src/` — keep exactly ONE instance: the hero badge `Direct B.E. Admission 2026 • Limited Seats`. Rewrite all others into process/value statements (e.g. `2026 seats are allotted in order of completed applications` in CTASection — factual, no countdown).
3. `grep -rn "No trips to Karnataka\|simple paperwork" src/` — reframe to support language: `We guide you through every step — eligibility, documents, travel and hostel.`
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

- [ ] `grep -rn "openLeadDrawer" src/components src/hooks` → matches ONLY inside `ModalContext.jsx` / `LeadFormDrawer.jsx` / `App.jsx` (protected, dead wiring).
- [ ] `grep -rn "placehold.co" src/components/sections/StatsSection` → no matches.
- [ ] `grep -rn "100% Free\|Free counselling\|Free Guidance" src/` → at most the single hero-card instance.
- [ ] `grep -rn "Limited Seats\|Filling Fast" src/` → exactly one match (hero badge).
- [ ] `grep -n "M.Tech\|MBA\|MCA" src/components/sections/ContactSection/ContactSection.jsx` → no matches.
- [ ] `grep -n "isLive" src/data/testimonialsData.js` → `false`; TestimonialsSection absent from the rendered page until flipped.
- [ ] FAQ answers in `faqData.js` match the JSON-LD in `seo.js` (single source).
- [ ] `npm run build` passes; manual at 360 px: every CTA (including mobile sticky nav Apply) lands on `/apply`, with course pre-selected when coming from a course card.
