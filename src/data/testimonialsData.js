/* ============================================
   Testimonials Data — CIT 2026 Admissions
   ============================================ */

// ⚠ LAUNCH BLOCKER: sample structure only. Replace with real, consented
// student testimonials (name, hometown, branch, quote, photo) before going
// live. Publishing fabricated testimonials violates ASCI guidelines and
// destroys trust.
const SAMPLE_TESTIMONIALS = [
  {
    id: 'sample-1',
    name: 'Student Name',
    hometown: 'Home Town',
    state: 'Karnataka',
    branch: 'B.E. Computer Science & Engineering',
    year: '2nd Year',
    quote:
      'Replace this with the student’s own words about applying from their home state, arriving on campus, hostel life and how the admission desk helped.',
    // Optional: an https URL to a consented photograph. Left empty on purpose —
    // an entry without a photo renders an initials avatar, never a placeholder
    // image service.
    photo: '',
  },
  {
    id: 'sample-2',
    name: 'Student Name',
    hometown: 'Home Town',
    state: 'Bihar',
    branch: 'B.E. Electronics & Communication Engineering',
    year: '3rd Year',
    quote:
      'Replace this with a real quote — ideally one that answers a parent’s question about safety, food, travel or fees in the student’s own voice.',
    photo: '',
  },
  {
    id: 'sample-3',
    name: 'Student Name',
    hometown: 'Home Town',
    state: 'Assam',
    branch: 'B.E. Mechanical Engineering',
    year: 'Final Year',
    quote:
      'Replace this with a real quote about labs, teaching or placements — specific and verifiable beats glowing and vague.',
    photo: '',
  },
];

/**
 * The section reads `isLive` and renders nothing while it is false, so the
 * sample content above can never reach a visitor. Flip it to true in the same
 * commit that replaces SAMPLE_TESTIMONIALS with consented, real testimonials —
 * not before.
 */
export const testimonialsData = {
  isLive: false,
  testimonials: SAMPLE_TESTIMONIALS,
};

export default testimonialsData;
