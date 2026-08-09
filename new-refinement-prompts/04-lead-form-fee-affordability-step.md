# 04 — `/apply` Step 5: Fee Transparency + Affordability + Two-Branch Preference

> **Series:** CIT Landing Page Repositioning (prompt 4 of 10). **Depends on:** prompt 01 (`src/data/meritProgram.js`). If that module is missing, create it first exactly as specified in `01-hero-identity-and-disambiguation.md` (same data is reproduced below).
> **You are:** Claude Code in a fresh session with full repo access.

## What exists today (verified)

`/apply` (`src/pages/Apply/Apply.jsx`) is a full-page **4-step** form: `STEPS = [identity, academics, family_finance, logistics]`; the active step comes from the `?step=` query param; `validateStep(step, draft)` holds per-step rules; completing Step 1 fires `submitPartialApplication(draft)` (lead_tier `partial`); the **last** step's submit calls `submitFullApplication(draft)` (`src/utils/applicationSubmit.js`) which POSTs `{lead: payload}` to `leads.php?action=create`, upserting by the shared `lead_id`, then navigates to `/thank-you`. Draft persists in sessionStorage (`cit_apply_draft`); `isLastStep = step === TOTAL_STEPS`, so appending a step automatically moves the submit. Form primitives (TextField/SelectField/ChipGroup/OptionRows/CheckboxField + inline SVG icons) live in `src/pages/Apply/fields.jsx`; steps in `src/pages/Apply/steps/`. Route constraints: **no framer-motion, no sweetalert2, no iconify on `/apply`** — CSS-only transitions, native controls, 360-px-first, 44 px targets, 16 px input font.

**Step position decision (final):** the new step is **Step 5, the last step** — after Logistics. Codebase analysis confirms this is the right fit: `isLastStep` machinery makes appending safe, the Step-1 partial-lead contract is untouched, and the fee/affordability answer is the strongest commitment signal so it belongs immediately before submit.

## The new step — "Fees & Your Branch Choice" (`fees_branches`)

Create `src/pages/Apply/steps/StepFeesBranches.jsx` following the existing step-file pattern. One screen, four blocks, in this order:

### Block 1 — Complete cost breakdown (display-only)

Import from `src/data/meritProgram.js` (`MERIT_BRANCHES`, `EXTRA_FEES_PER_YEAR`, `ADMISSION_FEE_ONE_TIME`, `HOSTEL_FEES_PER_YEAR`, `branchTotals`, `formatINR`). The authoritative data:

| Branch | 1st Yr | 2nd Yr | 3rd Yr | 4th Yr | Seats |
|---|---|---|---|---|---|
| CSE | ₹3,50,000 | ₹3,00,000 | ₹3,00,000 | ₹3,00,000 | 2 |
| AI & DS | ₹3,00,000 | ₹3,00,000 | ₹3,00,000 | ₹3,00,000 | 2 |
| ISE | ₹2,75,000 | ₹2,50,000 | ₹2,50,000 | ₹2,50,000 | 2 |
| ECE | ₹2,00,000 | ₹2,00,000 | ₹2,00,000 | ₹2,00,000 | 2 |
| EEE | ₹1,00,000 | ₹1,00,000 | ₹1,00,000 | ₹1,00,000 | 2 |
| Civil | ₹90,000 | ₹85,000 | ₹85,000 | ₹85,000 | 3 |
| Mech | ₹90,000 | ₹85,000 | ₹85,000 | ₹85,000 | 2 |

Universal (all branches): Extra Fees **₹12,500/year** (Skill & Cultural activities etc.) · Admission Fee **₹1,07,500 one-time, payable in the 1st year at admission** · Hostel **₹65,000/year** (same for boys & girls, in-campus, stay & food).

4-year totals — compute via `branchTotals()` and verify they render as: (4-yr tuition | total excl. hostel | total incl. hostel) — CSE ₹12,50,000 | ₹14,07,500 | ₹16,67,500 · AI&DS ₹12,00,000 | ₹13,57,500 | ₹16,17,500 · ISE ₹10,25,000 | ₹11,82,500 | ₹14,42,500 · ECE ₹8,00,000 | ₹9,57,500 | ₹12,17,500 · EEE ₹4,00,000 | ₹5,57,500 | ₹8,17,500 · Civil ₹3,45,000 | ₹5,02,500 | ₹7,62,500 · Mech ₹3,45,000 | ₹5,02,500 | ₹7,62,500.

**360 px layout:** an accordion — one row per branch (`CSE · 2 seats left · 4-yr total ₹16,67,500*`), tapping expands the year-wise breakdown + totals; the branch matching `draft.service_interest` starts expanded. A separate always-visible "Same for every branch" card lists the three universal costs. Footnote: `*Total including hostel (stay & food) for 4 years. Excluding hostel: shown inside each branch.` All figures Indian-formatted with ₹. Intro line above the block: `Full transparency before you apply — the complete cost of your B.E. at CIT, every branch, every year. No hidden charges, no agent fees.`

### Block 2 — The affordability question (required)

`OptionRows` (existing primitive), label: **"If you get selected after the 30-Minute Online Merit Assessment Test, are you in a position to pay these fees on your own?"** — exactly two options:

- value `own_income` → label **"Yes — I can afford this study cost with my own family income."**
- value `education_loan` → label **"I'll need an education loan to afford this study cost."**

Store as draft/lead field **`fee_affordability`**.

### Block 3 — Education-loan info panel (conditional)

Rendered inline (CSS expand, no modal/sweetalert) only when `fee_affordability === 'education_loan'`. Content (polish wording, keep all facts + labels):

> **We'll help you get an education loan — here's how it works.**
> After you qualify, our team will call you (tele-counselling) and explain everything about education loans, so your family can comfortably get a loan covering **about 80% of the total study cost — including all fees and hostel (stay & food)**.
>
> **A worked example (B.E. ECE):** 4-year total incl. hostel **₹12,17,500** → education loan (~80%) **≈ ₹9,74,000** → your family arranges **≈ ₹2,43,500** across 4 years. The loan is **in the student's own name**. Repayment typically starts **after the course ends** — you repay from **your own salary after placement through Campus Interviews at CIT** (e.g. ≈ ₹12,600/month for 10 years at ~9.5% p.a. on ₹9,74,000).
>
> *All example figures are indicative; final loan amount, margin, interest rate and EMI depend on the bank.*

Do the EMI arithmetic yourself before publishing (P=9,74,000, 9.5% p.a., 120 months → EMI ≈ ₹12,600) and keep the "indicative" disclaimer visible, not buried.

### Block 4 — Pick your TWO favourite branches (required, exactly 2, ranked)

Chip-style multi-select over the **7 real branches** (never "Not Sure — Need Guidance"), each chip showing name + `2 seats` (`3 seats` for Civil). Interaction: first tap = **Preference 1** (badge "1"), second tap = **Preference 2** (badge "2"); tapping a selected chip unselects it (and promotes pref-2 → pref-1 if pref-1 was removed); a third selection is rejected with a hint (`Pick exactly two`). Pre-select Preference 1 from `draft.service_interest` when it's one of the 7 (the student can change it). Label: **"If you qualify, which TWO branches would you choose? (in order of preference)"**. Store as **`branch_pref_1`** and **`branch_pref_2`** (exact course strings).

## Wiring changes (all verified line references)

1. **`src/pages/Apply/Apply.jsx`**
   - `STEPS` (~line 69): append `{ id: 5, key: 'fees_branches', label: 'Fees & branch choice' }`. `TOTAL_STEPS`/`isLastStep`/progress bar adapt automatically. Consider relabeling step 4 from `'Almost done'` to `'Logistics'`-style copy so "almost done" isn't a lie — small copy fix.
   - `createInitialDraft()` (~83): add `fee_affordability: ''`, `branch_pref_1: ''`, `branch_pref_2: ''`.
   - `validateStep` (~229): add a `step === 5` block — `fee_affordability` required (`Please answer honestly — this helps us guide you right`), both branch prefs required and distinct, each must be one of the 7 branch strings.
   - Render `StepFeesBranches` for step 5 in the step host (~639–648); import it.
   - Page `<title>` (~386): `'Apply — Direct B.E. Admission 2026 | CIT Tumakuru'` → `'Apply — CIT Merit-Based Selection Program 2026 | CIT Tumakuru'`.
2. **Copy fixes inside existing steps (same route, same tone as prompt 02):** `StepAcademics.jsx` ~90–92 `…confirm your VTU B.E. eligibility instantly` → drop "instantly"; `StepFamilyFinance.jsx` ~103–104 reassurance → `CIT charges no capitation and no consultancy/agent fee. The complete fee structure is shown on the final step of this form.` Keep `funding_plan` (Step 3) exactly as-is — it is a separate signal (plan before seeing fees) from `fee_affordability` (capability after seeing fees); both are wanted.
3. **`src/utils/applicationSubmit.js`** — `buildFullPayload` (~316): add the three new fields after the Logistics block, commented `// Fees & branch choice (Step 5)`. **Do not** touch the partial payload, `lead_id` sharing, `source` suffixes (`/step1-partial`, `/full`), or attribution fields. In `trackFullApplication` (~402): the hardcoded funnel event `trackApplicationStep('application_step_complete', { step: 4, step_name: 'logistics', … })` → `{ step: 5, step_name: 'fees_branches', intake_year: … }`.
4. **`public/api/leads.php`** — `lead_field_whitelist()` (~191): append `'fee_affordability', 'branch_pref_1', 'branch_pref_2'` with a comment `// Merit-program fields (prompt series new-refinement-prompts)`. Nothing else in leads.php changes in this prompt. (Server-side length caps/whitelist already handle sanitisation; do not add test/key fields here — later prompts keep those server-authored only.)
5. **Docs (keep future sessions honest):**
   - `update-prompts/README.md` → "Canonical new-field schema" table: append rows for `fee_affordability` (`'own_income' | 'education_loan'`, required on full submit), `branch_pref_1` / `branch_pref_2` (exact branch strings from the 7-branch list, required on full submit).
   - `CLAUDE.md`: update the `/apply` step-order contract to five steps (Identity → Academics → Family & Funding → Logistics → Fees & Branch Choice); amend the "No fee amounts anywhere on the public page" rule to: fee amounts appear **only inside `/apply` Step 5 and its loan panel** — still never on landing-page sections; note the two new GTM funnel events (`application_step_view/complete` for step 5) so the GTM container owner can add triggers.
   - `CHANGELOG.md` `[Unreleased]`: add entries.

## Ground rules

- Program naming fixed: "30-Minute Online Merit Assessment Test" / "CIT Merit-Based Selection Program 2026". ₹ Indian formatting everywhere.
- **DO NOT MODIFY:** `src/utils/webhookSubmit.js`, `src/utils/validators.js` (new validation stays in `Apply.jsx`/`applicationValidators.js`), `src/utils/swalHelper.js`, `UnifiedLeadForm.jsx`, `LeadFormDrawer.jsx`, `ModalContext.jsx`.
- Contracts that must survive: partial submit on Step 1; shared `lead_id` upsert; `source` suffixes; UTM/gclid/fbclid/fbp/fbc attribution fields; honeypot `website`; sessionStorage draft (older drafts without the new keys must rehydrate cleanly — `loadDraft` layers saved over defaults, verify it does); retry queue; admin status keys.
- No new dependencies; no MUI popover selects on the route; only the active step mounted.

## Acceptance criteria

- [ ] `/apply` is now 5 steps; progress bar reads `Step X of 5`; Steps 1–4 behave exactly as before (Step-1 partial still fires; back/close/draft logic intact).
- [ ] Step 5 shows: all-branch cost accordion with correct ₹ figures + universal-costs card + totals (spot-check ECE ₹12,17,500 incl. hostel), the affordability question with the two exact options, the conditional loan panel with the ECE worked example + indicative disclaimer, and the exactly-two ranked branch selector with seats shown.
- [ ] Submit is blocked until affordability answered AND exactly two distinct branches picked; error messages scroll/focus like other steps.
- [ ] Final payload contains `fee_affordability`, `branch_pref_1`, `branch_pref_2`; verify end-to-end by submitting locally against a PHP server (`php -S localhost:8080 -t public`) and inspecting `public/api/data/leads.json` — the three fields persist (whitelist updated), and all legacy fields (utm_*, gclid, fbclid, eligibility, funding_plan…) still persist.
- [ ] GTM: step-5 view/complete events fire; the completion event now reports `step: 5, step_name: 'fees_branches'`; `lead_form_submission`/`generate_lead`/Meta events unchanged.
- [ ] An in-progress draft saved by the 4-step build (simulate: strip the three new keys from sessionStorage) loads without crashing and lands on the right step.
- [ ] Docs updated (`update-prompts/README.md` schema, `CLAUDE.md`, `CHANGELOG.md`).
- [ ] 360 px pass: accordion, chips, loan panel all usable one-handed; no horizontal scroll.
- [ ] `npm run build` passes; no new console errors on the route.
