# 01 — Hero: Identity Disambiguation + Merit-Selection Headline + Program Data Module

> **Series:** CIT Landing Page Repositioning (prompt 1 of 10). **Depends on:** nothing — run first.
> **You are:** Claude Code in a fresh session with full access to this repo (React 18 + CRA landing page, PHP lead API in `public/api/`, admin panel in `src/admin/`, deployed on Cloudways).
> Read `new-refinement-prompts/00-README.md` first for the series overview, then execute this prompt completely.

## Why this change exists (business context — embed this in your copywriting decisions)

The page currently sells **"Direct B.E. Admission 2026 — Apply Online in 3 Minutes"** with free/effortless framing. That attracts freebie-seekers who don't take CIT seriously. The new positioning:

- **Admissions for Session 2026 are almost closed. Only 15 seats remain across 7 B.E. branches** for the final admission closure.
- CIT fills these last 15 seats with **talented students on merit**, selected through a **30-Minute Online Merit Assessment Test** under the **CIT Merit-Based Selection Program 2026**.
- Target student: talented students who could not clear JEE/KCET/COMEDK for some reason — this is their **second chance** to start engineering **now** instead of losing a year to re-attempt coaching.
- Tone: serious, selective, exam-like, aspirational, urgent. Admission must be **earned**. Simple English readable by Tier-2/Tier-3 students and parents. Mobile-first (360 px).

A second, equally important problem: much of the traffic comes from **North East India** campaigns, and people confuse this college with **CIT Kokrajhar, Assam**. The hero must make the location unmistakable **instantly**: this is **CIT (Channabasaveshwara Institute of Technology), Tumakuru, Karnataka — ~70 km from Bengaluru**. ("Kokrajhar" currently appears nowhere in the codebase; you are *adding* disambiguation, not removing anything.)

## Ground rules

- **Naming is fixed everywhere:** "**30-Minute Online Merit Assessment Test**" and "**CIT Merit-Based Selection Program 2026**" — use these exact strings, never variants.
- **Seat consistency:** total is always **15**; per-branch counts always sum to 15.
- **No invented credentials/stats.** Only claims already on the site or evidenced in `resources/Info-1.jpeg` … `Info-7.jpeg` (verified facts listed below).
- **DO NOT MODIFY** (per CLAUDE.md): `src/utils/webhookSubmit.js`, `src/utils/validators.js`, `src/utils/swalHelper.js`, `src/components/common/UnifiedLeadForm/UnifiedLeadForm.jsx`, `src/components/common/LeadFormDrawer/LeadFormDrawer.jsx`, `src/context/ModalContext.jsx`, and the MobileDrawer/MobileNavigation open-close mechanics.
- **CTA keys must not change.** The hero CTAs call `trackCTAClick(ctaName, "hero", …)` and `setApplySource(...)` with source keys like `'apply-now'` — live GTM reporting depends on these keys. Change **labels only**, never the keys, and keep every CTA routed to `/apply` (via `useApplyCTA` / `setApplySource` + `navigate('/apply')` exactly as today).
- **Mobile-first at 360 px**, 44 px touch targets. Keep the existing component patterns (framer-motion variants, MUI, CSS modules) — no framework changes.
- Currency (if any appears): Indian format with ₹ (e.g. ₹3,50,000). No fee numbers belong in the hero.
- `npm run build` must pass when you finish. Nothing that works today may break.

## Step 1 — Create the shared program data module: `src/data/meritProgram.js` (NEW)

Every later prompt imports from this module, so create it exactly with this data. Branch keys must match the exact `COURSE_OPTIONS` strings in `src/pages/Apply/steps/StepIdentity.jsx` (em-dash format). Note: the business spec calls the AI branch "Artificial Intelligence Engineering (AI)"; on this site that branch **is** "B.E. — Artificial Intelligence & Data Science" — use the existing string.

```js
/* Program constants — the single source of truth for the
   CIT Merit-Based Selection Program 2026. */
export const PROGRAM_NAME = 'CIT Merit-Based Selection Program 2026';
export const TEST_NAME = '30-Minute Online Merit Assessment Test';
export const SESSION_LABEL = 'Session 2026';

// Per-branch seats for the merit program + year-wise tuition (₹).
// Order matters — it is the display order on every surface.
export const MERIT_BRANCHES = [
  { course: 'B.E. — Computer Science & Engineering',        short: 'CSE',    seats: 2, tuition: [350000, 300000, 300000, 300000] },
  { course: 'B.E. — Artificial Intelligence & Data Science', short: 'AI & DS', seats: 2, tuition: [300000, 300000, 300000, 300000] },
  { course: 'B.E. — Information Science & Engineering',     short: 'ISE',    seats: 2, tuition: [275000, 250000, 250000, 250000] },
  { course: 'B.E. — Electronics & Communication Engineering', short: 'ECE',  seats: 2, tuition: [200000, 200000, 200000, 200000] },
  { course: 'B.E. — Electrical & Electronics Engineering',  short: 'EEE',    seats: 2, tuition: [100000, 100000, 100000, 100000] },
  { course: 'B.E. — Civil Engineering',                     short: 'Civil',  seats: 3, tuition: [90000, 85000, 85000, 85000] },
  { course: 'B.E. — Mechanical Engineering',                short: 'Mech',   seats: 2, tuition: [90000, 85000, 85000, 85000] },
];

export const TOTAL_SEATS_LEFT = MERIT_BRANCHES.reduce((n, b) => n + b.seats, 0); // must equal 15

// Universal costs — identical for every branch.
export const EXTRA_FEES_PER_YEAR = 12500;      // Skill & Cultural activities etc.
export const ADMISSION_FEE_ONE_TIME = 107500;  // one-time, payable in the 1st year at admission
export const HOSTEL_FEES_PER_YEAR = 65000;     // boys & girls, in-campus hostel (stay & food)

/** ₹12,17,500-style Indian formatting. */
export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

/** 4-year totals for a branch. */
export const branchTotals = (branch) => {
  const tuition4 = branch.tuition.reduce((a, b) => a + b, 0);
  const exclHostel = tuition4 + EXTRA_FEES_PER_YEAR * 4 + ADMISSION_FEE_ONE_TIME;
  return { tuition4, exclHostel, inclHostel: exclHostel + HOSTEL_FEES_PER_YEAR * 4 };
};
```

Verify the arithmetic (already checked; re-verify): totals incl. hostel must come out CSE ₹16,67,500 · AI&DS ₹16,17,500 · ISE ₹14,42,500 · ECE ₹12,17,500 · EEE ₹8,17,500 · Civil ₹7,62,500 · Mech ₹7,62,500, and `TOTAL_SEATS_LEFT === 15`. Add a `console.assert` nowhere — just verify by hand/`node -e`.

## Step 2 — Rewrite the hero: `src/components/sections/HeroSection/HeroSection.jsx` (+ `HeroSection.module.css` as needed)

Current copy (all of it must go):
- Line ~189 chip: `Direct B.E. Admission 2026 • Limited Seats`
- Lines ~224–228 headline: `Direct B.E. Admission 2026 at CIT Tumakuru — Apply Online in 3 Minutes`
- Lines ~246–250 sub-headline: `NAAC-accredited, AICTE-approved VTU degree with 85%+ placements. Complete the online application and CIT's North-East admission desk will confirm your eligibility on the first call.`
- Lines ~94–99 `applicationChecklist`: `"Takes about 3 minutes"`, `"Instant VTU eligibility check inside the form"`, etc.
- Line ~379 note: `No consultancy or agent fees · Direct college admission`

Build the new hero with these elements (exact copy below is the approved direction — you may polish grammar/rhythm but keep every fact and the tone):

1. **Identity headline (h1):**
   `CIT Engineering College, Near Bengaluru — One of the Finest & Top Engineering Colleges in Karnataka`
   (Keep "CIT" expanded nearby: "Channabasaveshwara Institute of Technology (CIT), Tumakuru".)
2. **Location strip** directly under (or above) the headline — small badge row, instantly scannable:
   `📍 Tumakuru, Karnataka · ~70 km from Bengaluru · NH-206` — and one explicit disambiguation line in smaller text: `This is CIT Tumakuru, Karnataka — not CIT Kokrajhar, Assam.` Style it as a quiet clarifier, not an apology.
3. **Recognitions strip** (all verified — from the existing site + `resources/Info-1.jpeg`/`Info-5.jpeg`): `NAAC Accredited · Approved by AICTE, New Delhi · Affiliated to VTU, Belagavi · ISO 9001:2015 · 25 Years of Excellence · 4★ IIC Rating (MHRD) · IIRF "Best Brand" 2025`. Reuse/extend the existing `trustIndicators` chip pattern.
4. **Proof chips** (existing verified stats, keep): `85%+ Placements` · `90+ Recruiters` · `Highest CTC 15 LPA`.
5. **The new scarcity + merit message** (pre-headline chip + a prominent block):
   - Chip: `Session 2026 — Final Admission Closure`
   - Block: `Only 15 seats remain across 7 B.E. branches. To fill them with talented students on merit, CIT is conducting a 30-Minute Online Merit Assessment Test — the CIT Merit-Based Selection Program 2026.`
   - One second-chance line: `Couldn't clear JEE / KCET / COMEDK this year? Prove your merit and start your engineering journey now — without losing another academic year.`
   Import `TOTAL_SEATS_LEFT`, `TEST_NAME`, `PROGRAM_NAME` from `src/data/meritProgram.js` instead of hard-coding.
6. **Primary CTA:** label `Apply for the Merit Assessment Test` (keep `handleStartApplication` and its existing cta_name keys/`setApplySource('apply-now')` wiring unchanged — label change only). Secondary CTA/link labels likewise re-worded to test-focused language.
7. **Replace the `applicationChecklist` card** with a **selection-summary card**: `How selection works` — `1. Apply online → 2. Get your Test Login Key → 3. Take the 30-minute test → 4. Qualify → tele-counselling within 24 hours → 5. Final admission against one of the 15 seats.` (Condensed; the full section comes in prompt 02.)

Keep: the campus hero image loading logic, framer-motion variants, responsive structure, `preloadApply` on pointerdown, `trackContactClick` on any phone link. Style evolution (badges, seat counter emphasis) is welcome; framework migration is not.

## Step 3 — Head metadata + SEO identity: `public/index.html`, `src/config/seo.js`, `public/manifest.json`, `public/sitemap.xml`

These carry the "Direct B.E." identity and must switch to the new identity + disambiguation. Use this title/description direction (adjust length to fit limits: title ≤ 60 chars where possible, description ≤ 160):

- Title: `CIT Engineering College, Tumakuru (Near Bengaluru) | B.E. Admissions 2026 — Merit-Based Selection`
- Description: `Channabasaveshwara Institute of Technology (CIT), Tumakuru, Karnataka — NAAC accredited, AICTE approved, VTU affiliated. Only 15 seats left for Session 2026, filled by merit through a 30-minute online assessment. Apply now.`
- Keywords: replace `direct be admission 2026` / `direct admission b.e.` style keywords with `cit tumakuru karnataka`, `cit engineering college near bengaluru`, `merit based engineering admission 2026`, `b.e. admission karnataka merit test`, `top engineering colleges karnataka` (and keep the non-"direct" existing ones).

Apply in:
- `public/index.html`: `<title>` (~line 178), meta description (~55), meta keywords (~59), `og:title` (~72), `og:description` (~76), `og:image:alt` (~86), `twitter:title` (~98), `twitter:description` (~102), JSON-LD `schema-organization.description` (~195), JSON-LD `schema-webpage` name/description (~329–330), and the pre-React loader tagline `<p class="loader-tagline">Direct B.E. Admissions 2026</p>` (~699) → `CIT Merit-Based Selection Program 2026`.
- `src/config/seo.js`: `defaultTitle` (~16), `defaultDescription` (~19), `organization.description` (~35), `pages.home.title/description/keywords` (~90–95), `pages.thankYou.description` (~100 — remove "Direct B.E."; say the merit-test next step instead).
- `public/manifest.json`: `name` → `CIT — Merit-Based Selection 2026`, `description` accordingly.
- `public/sitemap.xml`: update the comment (line 3) and refresh `<lastmod>` to today's date.
- Do **not** touch the six hard-coded FAQ JSON-LD entries in `index.html` (~217–262) in this prompt — prompt 02 rewrites the FAQ and syncs them.

## Acceptance criteria

- [ ] `src/data/meritProgram.js` exists with the exact data above; `TOTAL_SEATS_LEFT` computes to 15; totals verified.
- [ ] Hero shows: Karnataka/Bengaluru identity headline, location strip with the explicit not-Kokrajhar clarifier, recognitions strip, proof chips, the 15-seats + merit-test message, second-chance line, test-focused CTAs.
- [ ] No hero text contains: "Direct B.E. Admission", "Limited Seats" (the vague chip), "3 minutes", "Instant", "free".
- [ ] CTA source keys (`apply-now` etc.), `cta_click` event names, and routing to `/apply` are byte-for-byte unchanged in behavior.
- [ ] `public/index.html`, `seo.js`, `manifest.json`, `sitemap.xml` carry the new identity; no `direct admission` keyword remains in metadata.
- [ ] At 360 px wide the hero is fully readable, nothing overflows, CTAs are ≥ 44 px tall.
- [ ] `npm run build` passes. Load the page (`npm start`) and click every hero CTA → lands on `/apply` exactly as before.
- [ ] Nothing else on the page changed behavior (drawer stays unreachable; admin untouched).
