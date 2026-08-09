/* ============================================
   University (VTU) Results Data — CIT

   Transcribed from the CIT posters kept in `resources/` (the evidence
   trail): medalists from `Info-2.jpeg`, the rank-holder wall from
   `Info-6.jpeg`, the awards timeline from `Info-1/3/5/6.jpeg` (identical
   across all four).

   Rules: names, ranks, programmes and years are reproduced exactly as
   published. Nothing is inferred — where a poster does not state a
   branch, none is stated here either. Text only; no student photographs.
   ============================================ */

/**
 * VTU gold medalist — the headline academic result.
 * @type {Array<{name: string, usn: string, award: string, awardedBy: string}>}
 */
export const GOLD_MEDALISTS = [
  {
    name: 'Himaja S',
    usn: '1CG21CS048',
    award: 'Late Shri A Thimmaiah Gold Medal',
    awardedBy: 'Visvesvaraya Technological University',
  },
];

/**
 * University toppers shown beside the medalist. Kept separate from
 * RANK_HOLDERS (the historic wall) because this is the current batch.
 * @type {Array<{name: string, usn: string, achievement: string, detail: string}>}
 */
export const TOP_RANKERS = [
  {
    name: 'Mohammed Sufiyann',
    usn: '1CG21EE014',
    achievement: 'VTU 7th Rank',
    detail: 'CGPA 9.43',
  },
];

/**
 * The VTU rank-holder wall, newest first.
 * `year` is reproduced verbatim from the poster (hence the '2024 batch'
 * entry); `note` carries the convocation where the poster gives one.
 * @type {Array<{name: string, rank: string, program: string, year: string, note?: string}>}
 */
export const RANK_HOLDERS = [
  { name: 'Dedeepya M',          rank: '8th Rank', program: 'B.E. EEE',        year: '2024 batch' },
  { name: 'Sushmitha P R',       rank: '6th Rank', program: 'B.E. EEE',        year: '2019' },
  { name: 'Vinutha K',           rank: '8th Rank', program: 'B.E. EEE',        year: '2019' },
  { name: 'Chandrashekar Gowda', rank: '4th Rank', program: 'B.E. Mechanical', year: '2018' },
  { name: 'Navya Shree R',       rank: '6th Rank', program: 'B.E. CSE',        year: '2018' },
  { name: 'Pravesh Kumar',       rank: '1st Rank', program: 'Mechanical Engg', year: '2017', note: '16th Convocation' },
  { name: 'Raghuchandra G',      rank: '5th Rank', program: 'B.E. Civil',      year: '2017' },
  { name: 'Shagufta Nazneen',    rank: '3rd Rank', program: 'M.Tech',          year: '2017' },
  { name: 'Chaitra T R',         rank: '1st Rank', program: 'MBA',             year: '2016', note: '15th Convocation' },
  { name: 'Sharath D N',         rank: '6th Rank', program: 'B.E. EEE',        year: '2016' },
  { name: 'Srinivas B S',        rank: '7th Rank', program: 'B.E. Civil',      year: '2016' },
];

/**
 * Institutional awards, oldest first — the strip reads as a timeline.
 * @type {Array<{year: string, title: string, by: string}>}
 */
export const AWARDS_TIMELINE = [
  {
    year: '2016',
    title: 'Excellent Engineering Institution in Rural India',
    by: 'National Education Summit & Awards',
  },
  {
    year: '2018',
    title: 'Most Promising Engineering Institution',
    by: 'Leaders Conclave',
  },
  {
    year: '2019',
    title: 'Outstanding & Positive Accomplishment of the Institution',
    by: 'Academic Insights',
  },
  {
    year: '2022',
    title: 'Best Engineering College for Building Global Technocrats for Rural Talents',
    by: '4th Asia Pacific Education & Technology',
  },
  {
    year: '2024',
    title: 'Outstanding Contribution to Rural Engineering Education',
    by: 'Federation for World Academics, New Delhi',
  },
  {
    year: '2025',
    title: 'Best Brand',
    by: 'IIRF, New Delhi',
  },
];
