/* ============================================
   Placements Data — CIT Career Advancement & Development Cell

   Every figure here is transcribed from the Career Advancement &
   Development Cell poster kept in `resources/Info-1.jpeg` (the evidence
   trail). Nothing in this file may be estimated, rounded up or
   extrapolated — if a number is not on that poster, it does not belong
   here.

   Deliberately NOT the source of the headline stats. The three headline
   cards (85%+ placements · 90+ recruiters · highest CTC 15 LPA) stay in
   `statsData.js`, which carries the site's conservative, cross-poster-safe
   claims. The posters disagree with each other on the headline numbers
   (80%+/85%+/86%+, 14.0 vs 15.0 LPA); the year table below is reproduced
   as published, and no company name is ever attached to a CTC figure
   because the posters disagree on which company paid what.
   ============================================ */

/**
 * Last three academic years, newest first — the lead evidence.
 * @type {Array<{year: string, placements: number, percentPlaced: number,
 *   highestCTC: number, companies: number, provisional?: boolean}>}
 */
export const PLACEMENT_YEARS = [
  {
    year: '2024-25',
    placements: 316,
    percentPlaced: 86,
    highestCTC: 14.5,
    companies: 98,
    provisional: true,
  },
  {
    year: '2023-24',
    placements: 252,
    percentPlaced: 84,
    highestCTC: 14.5,
    companies: 80,
  },
  {
    year: '2022-23',
    placements: 303,
    percentPlaced: 88,
    highestCTC: 11.0,
    companies: 80,
  },
];

/**
 * The full six-year run from the same poster, newest first. Unused by
 * default — the section leads with the last three years. Swap
 * PLACEMENT_YEARS for this only if CIT asks for the longer trend.
 * @type {Array<{year: string, placements: number, percentPlaced: number,
 *   highestCTC: number, companies: number, provisional?: boolean}>}
 */
export const PLACEMENT_YEARS_EXTENDED = [
  ...PLACEMENT_YEARS,
  { year: '2021-22', placements: 562, percentPlaced: 96, highestCTC: 10.0, companies: 96 },
  { year: '2020-21', placements: 325, percentPlaced: 80, highestCTC: 7.0, companies: 47 },
  { year: '2019-20', placements: 303, percentPlaced: 75, highestCTC: 4.5, companies: 49 },
];

/**
 * Branch-wise recruitment from the poster's asterisked recent-year block.
 * `branch` matches the `short` names in `src/data/meritProgram.js` so the
 * two can be joined; display order matches MERIT_BRANCHES.
 * @type {Array<{branch: string, companies: number, offers: number, highestCTC: number}>}
 */
export const BRANCH_PLACEMENTS = [
  { branch: 'CSE',     companies: 76, offers: 86, highestCTC: 14.5 },
  { branch: 'AI & DS', companies: 45, offers: 31, highestCTC: 4.5 },
  { branch: 'ISE',     companies: 75, offers: 42, highestCTC: 5.5 },
  { branch: 'ECE',     companies: 40, offers: 60, highestCTC: 5.0 },
  { branch: 'EEE',     companies: 35, offers: 30, highestCTC: 4.5 },
  { branch: 'Civil',   companies: 18, offers: 34, highestCTC: 5.0 },
  { branch: 'Mech',    companies: 19, offers: 33, highestCTC: 4.5 },
];

/** Footnote rendered under every table/strip built from this file. */
export const PLACEMENT_SOURCE_NOTE =
  "*As published by CIT's Career Advancement & Development Cell; 2024-25 figures provisional.";
