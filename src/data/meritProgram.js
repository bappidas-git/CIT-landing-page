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
// Both admission-time charges are ONE-TIME: they are paid once, at admission in
// the 1st year, and never again. Only hostel repeats every year.
export const EXTRA_FEES_ONE_TIME = 12500;      // one-time at admission — Skill & Cultural activities etc.
export const ADMISSION_FEE_ONE_TIME = 107500;  // one-time, payable in the 1st year at admission
export const HOSTEL_FEES_PER_YEAR = 65000;     // boys & girls, in-campus hostel (stay & food)

/** ₹11,80,000-style Indian formatting. */
export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

/** 4-year totals for a branch. The two one-time charges are counted once;
    only hostel is multiplied across the 4 years. */
export const branchTotals = (branch) => {
  const tuition4 = branch.tuition.reduce((a, b) => a + b, 0);
  const exclHostel = tuition4 + EXTRA_FEES_ONE_TIME + ADMISSION_FEE_ONE_TIME;
  return { tuition4, exclHostel, inclHostel: exclHostel + HOSTEL_FEES_PER_YEAR * 4 };
};
