/* ============================================
   /apply — Step 5: "Fees & your branch choice"
   The last screen before submit, and the only
   surface on the whole site that carries fee
   numbers. Showing the complete cost here — every
   branch, every year — is what turns a curious
   applicant into a committed one, and the
   affordability answer that follows is the
   strongest qualification signal on the form.

   All figures come from src/data/meritProgram.js.
   Nothing is hard-coded here, so a fee revision
   in one file re-renders correctly everywhere.
   ============================================ */

import React, { useEffect, useState } from 'react';
import {
  OptionRows,
  IconChevronRight,
  IconInfo,
} from '../fields';
import {
  MERIT_BRANCHES,
  EXTRA_FEES_ONE_TIME,
  ADMISSION_FEE_ONE_TIME,
  HOSTEL_FEES_PER_YEAR,
  branchTotals,
  formatINR,
} from '../../../data/meritProgram';
import styles from '../Apply.module.css';

/** The 7 real branches, as exact `service_interest`-compatible strings.
    "Not Sure — Need Guidance" is deliberately absent: this step asks the
    applicant to commit to two actual branches. */
export const MERIT_BRANCH_COURSES = MERIT_BRANCHES.map(
  (branch) => branch.course
);

export const FEE_AFFORDABILITY_OPTIONS = [
  {
    value: 'own_income',
    label: 'Yes — I can afford this study cost with my own family income.',
  },
  {
    value: 'education_loan',
    label: "I'll need an education loan to afford this study cost.",
  },
];

const YEAR_LABELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// ============================================
// Education-loan worked example
// Indicative only — the bank sets the final numbers. Derived from
// meritProgram.js so the example can never contradict the table above it.
// ============================================
const LOAN_SHARE = 0.8;
const LOAN_RATE_PA = 0.095;
const LOAN_TENURE_YEARS = 10;

/** Standard reducing-balance EMI, rounded to the nearest ₹100 — the example is
    indicative, and a to-the-rupee figure would imply a precision no bank quote
    has yet. */
const monthlyEmi = (principal) => {
  const months = LOAN_TENURE_YEARS * 12;
  const rate = LOAN_RATE_PA / 12;
  const growth = Math.pow(1 + rate, months);
  return Math.round((principal * rate * growth) / (growth - 1) / 100) * 100;
};

const LOAN_EXAMPLE_BRANCH =
  MERIT_BRANCHES.find((branch) => branch.short === 'ECE') || MERIT_BRANCHES[0];
const LOAN_EXAMPLE_TOTAL = branchTotals(LOAN_EXAMPLE_BRANCH).inclHostel;
const LOAN_EXAMPLE_AMOUNT = Math.round(LOAN_EXAMPLE_TOTAL * LOAN_SHARE);
const LOAN_EXAMPLE_FAMILY_SHARE = LOAN_EXAMPLE_TOTAL - LOAN_EXAMPLE_AMOUNT;
const LOAN_EXAMPLE_EMI = monthlyEmi(LOAN_EXAMPLE_AMOUNT);

// ============================================
// Block 1 — one branch row of the cost accordion
// ============================================
const BranchFeeRow = ({ branch, expanded, onToggle }) => {
  const totals = branchTotals(branch);
  const panelId = `fee-panel-${branch.short.toLowerCase().replace(/\W+/g, '-')}`;

  return (
    <div className={`${styles.feeItem} ${expanded ? styles.feeItemOpen : ''}`}>
      <button
        type="button"
        className={styles.feeSummary}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className={styles.feeSummaryText}>
          <span className={styles.feeSummaryTop}>
            <span className={styles.feeShort}>{branch.short}</span>
            <span className={styles.feeSeats}>{branch.seats} seats left</span>
          </span>
          <span className={styles.feeTotalLine}>
            4-yr total {formatINR(totals.inclHostel)}*
          </span>
        </span>
        <span className={styles.feeChevron}>
          <IconChevronRight size={20} />
        </span>
      </button>

      {expanded && (
        <div className={styles.feePanel} id={panelId}>
          <p className={styles.feePanelCaption}>{branch.course}</p>

          {branch.tuition.map((amount, index) => (
            <div className={styles.feeYearRow} key={YEAR_LABELS[index]}>
              <span className={styles.feeYearLabel}>
                {YEAR_LABELS[index]} tuition
              </span>
              <span className={styles.feeYearValue}>{formatINR(amount)}</span>
            </div>
          ))}

          <div className={styles.feeTotalsBlock}>
            <div className={styles.feeTotalRow}>
              <span>4-year tuition</span>
              <span className={styles.feeYearValue}>
                {formatINR(totals.tuition4)}
              </span>
            </div>
            <div className={styles.feeTotalRow}>
              <span>Total excluding hostel</span>
              <span className={styles.feeYearValue}>
                {formatINR(totals.exclHostel)}
              </span>
            </div>
            <div className={`${styles.feeTotalRow} ${styles.feeTotalRowStrong}`}>
              <span>Total including hostel</span>
              <span className={styles.feeYearValue}>
                {formatINR(totals.inclHostel)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Step
// ============================================
const StepFeesBranches = ({ draft, errors, setField }) => {
  // The branch chosen on Step 1 opens first — that is the number the applicant
  // actually came to this screen for. Independent toggles (not single-open) so
  // a parent can hold two branches side by side to compare.
  const [openBranches, setOpenBranches] = useState(() => {
    const preferred = MERIT_BRANCHES.find(
      (branch) => branch.course === draft.service_interest
    );
    return preferred ? { [preferred.short]: true } : {};
  });
  const [pickHint, setPickHint] = useState('');

  const pref1 = draft.branch_pref_1;
  const pref2 = draft.branch_pref_2;

  // Seed Preference 1 from the Step-1 branch so the common case is one tap
  // away from done. Runs once: a preference the applicant has already set here
  // — including one they cleared — is never overwritten.
  useEffect(() => {
    if (pref1) return;
    if (MERIT_BRANCH_COURSES.includes(draft.service_interest)) {
      setField('branch_pref_1', draft.service_interest);
    }
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAccordion = (short) =>
    setOpenBranches((previous) => ({ ...previous, [short]: !previous[short] }));

  // Both keys are written on every change so the group's error (stored under
  // branch_pref_1) always clears on interaction, whichever slot moved.
  const applyPrefs = (next1, next2) => {
    setPickHint('');
    setField('branch_pref_1', next1);
    setField('branch_pref_2', next2);
  };

  const handleBranchTap = (course) => {
    if (course === pref1) {
      // Removing the first choice promotes the second rather than leaving a
      // gap — "my top pick is gone" should never mean "I have no top pick".
      applyPrefs(pref2 || '', '');
      return;
    }
    if (course === pref2) {
      applyPrefs(pref1, '');
      return;
    }
    if (!pref1) {
      applyPrefs(course, pref2);
      return;
    }
    if (!pref2) {
      applyPrefs(pref1, course);
      return;
    }
    setPickHint('Pick exactly two — tap a selected branch to remove it.');
  };

  const rankOf = (course) => {
    if (course === pref1) return 1;
    if (course === pref2) return 2;
    return 0;
  };

  const showLoanPanel = draft.fee_affordability === 'education_loan';
  const prefError = errors.branch_pref_1;

  return (
    <>
      <h1 className={styles.stepHeading}>Fees &amp; your branch choice</h1>
      <p className={styles.stepIntro}>
        Full transparency before you apply — the complete cost of your B.E. at
        CIT, every branch, every year. No hidden charges, no agent fees.
      </p>

      {/* ---- Block 1: complete cost breakdown ---- */}
      <div className={styles.feeAccordion}>
        {MERIT_BRANCHES.map((branch) => (
          <BranchFeeRow
            key={branch.short}
            branch={branch}
            expanded={!!openBranches[branch.short]}
            onToggle={() => toggleAccordion(branch.short)}
          />
        ))}
      </div>

      <div className={styles.feeUniversal}>
        <p className={styles.feeUniversalTitle}>
          <span className={styles.badgeIcon}>
            <IconInfo size={16} />
          </span>
          Same for every branch
        </p>
        <div className={styles.feeUniversalRow}>
          <span>
            Extra Fees
            <span className={styles.feeUniversalNote}>
              One-time, payable in the 1st year at admission — Skill &amp;
              Cultural activities etc.
            </span>
          </span>
          <span className={styles.feeYearValue}>
            {formatINR(EXTRA_FEES_ONE_TIME)}
          </span>
        </div>
        <div className={styles.feeUniversalRow}>
          <span>
            Admission Fee
            <span className={styles.feeUniversalNote}>
              One-time, payable in the 1st year at admission
            </span>
          </span>
          <span className={styles.feeYearValue}>
            {formatINR(ADMISSION_FEE_ONE_TIME)}
          </span>
        </div>
        <div className={styles.feeUniversalRow}>
          <span>
            Hostel
            <span className={styles.feeUniversalNote}>
              Same for boys &amp; girls — in-campus, stay &amp; food
            </span>
          </span>
          <span className={styles.feeYearValue}>
            {formatINR(HOSTEL_FEES_PER_YEAR)}/year
          </span>
        </div>
      </div>

      <p className={styles.feeFootnote}>
        *Total including hostel (stay &amp; food) for 4 years. Excluding
        hostel: shown inside each branch.
      </p>

      {/* ---- Block 2: the affordability question ---- */}
      <OptionRows
        label="If you get selected after the 30-Minute Online Merit Assessment Test, are you in a position to pay these fees on your own?"
        value={draft.fee_affordability}
        onChange={(value) => setField('fee_affordability', value)}
        options={FEE_AFFORDABILITY_OPTIONS}
        error={errors.fee_affordability}
      />

      {/* ---- Block 3: education-loan panel (conditional) ---- */}
      {showLoanPanel && (
        <div className={styles.loanPanel}>
          <p className={styles.loanTitle}>
            We&apos;ll help you get an education loan — here&apos;s how it
            works.
          </p>
          <p className={styles.loanText}>
            After you qualify, our team will call you (tele-counselling) and
            explain everything about education loans, so your family can
            comfortably get a loan covering{' '}
            <strong>
              about 80% of the total study cost — including all fees and hostel
              (stay &amp; food)
            </strong>
            .
          </p>

          <div className={styles.loanExample}>
            <p className={styles.loanExampleTitle}>
              A worked example (B.E. {LOAN_EXAMPLE_BRANCH.short})
            </p>
            <div className={styles.loanExampleRow}>
              <span>4-year total incl. hostel</span>
              <span className={styles.feeYearValue}>
                {formatINR(LOAN_EXAMPLE_TOTAL)}
              </span>
            </div>
            <div className={styles.loanExampleRow}>
              <span>Education loan (~80%)</span>
              <span className={styles.feeYearValue}>
                ≈ {formatINR(LOAN_EXAMPLE_AMOUNT)}
              </span>
            </div>
            <div className={styles.loanExampleRow}>
              <span>Your family arranges, across 4 years</span>
              <span className={styles.feeYearValue}>
                ≈ {formatINR(LOAN_EXAMPLE_FAMILY_SHARE)}
              </span>
            </div>
          </div>

          <p className={styles.loanText}>
            The loan is <strong>in the student&apos;s own name</strong>.
            Repayment typically starts <strong>after the course ends</strong> —
            you repay from your own salary after placement through Campus
            Interviews at CIT (e.g. ≈ {formatINR(LOAN_EXAMPLE_EMI)}/month for{' '}
            {LOAN_TENURE_YEARS} years at ~9.5% p.a. on{' '}
            {formatINR(LOAN_EXAMPLE_AMOUNT)}).
          </p>

          <p className={styles.loanDisclaimer}>
            All example figures are indicative; final loan amount, margin,
            interest rate and EMI depend on the bank.
          </p>
        </div>
      )}

      {/* ---- Block 4: two ranked branch preferences ---- */}
      <div className={styles.field} data-invalid={prefError ? 'true' : undefined}>
        <span className={styles.label}>
          If you qualify, which TWO branches would you choose? (in order of
          preference)
        </span>
        <div
          className={styles.prefChips}
          role="group"
          aria-label="Your two preferred B.E. branches, in order"
        >
          {MERIT_BRANCHES.map((branch) => {
            const rank = rankOf(branch.course);
            return (
              <button
                key={branch.short}
                type="button"
                aria-pressed={rank > 0}
                className={`${styles.prefChip} ${
                  rank > 0 ? styles.prefChipActive : ''
                }`}
                onClick={() => handleBranchTap(branch.course)}
              >
                {rank > 0 && (
                  <span className={styles.prefBadge}>
                    {rank}
                    <span className={styles.srOnly}>
                      {rank === 1 ? 'First preference' : 'Second preference'}
                    </span>
                  </span>
                )}
                <span className={styles.prefChipName}>{branch.short}</span>
                <span className={styles.prefChipSeats}>
                  {branch.seats} seats
                </span>
              </button>
            );
          })}
        </div>

        {prefError ? (
          <span className={styles.errorText} role="alert">
            {prefError}
          </span>
        ) : (
          <span className={styles.hintText} role="status">
            {pickHint ||
              'Tap your first choice, then your second. Tap again to remove.'}
          </span>
        )}
      </div>
    </>
  );
};

export default StepFeesBranches;
