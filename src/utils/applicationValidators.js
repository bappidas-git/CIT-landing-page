/* ============================================
   Application Validators
   Validation utilities for the multi-step
   application form: unicode-safe names
   (Assamese / Bengali / Manipuri scripts),
   academic marks, and anti-junk heuristics.
   Additive — src/utils/validators.js is
   untouched and still owns the enquiry form.
   ============================================ */

import { INDIAN_MOBILE_REGEX } from './validators';

/**
 * Unicode Name Validation Regex
 * Allows any unicode letters (\p{L}) and combining marks (\p{M}) so names in
 * Assamese, Bengali, Manipuri (Meetei Mayek), etc. pass, plus spaces and
 * common name punctuation. 2–60 characters.
 */
export const UNICODE_NAME_REGEX = /^[\p{L}\p{M}\s.'-]{2,60}$/u;

/**
 * Get validation error message for a name (unicode-safe)
 * @param {string} name - Name
 * @returns {string} - Error message or empty string
 */
export const getUnicodeNameError = (name) => {
  if (!name) return 'Name is required';

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (trimmedName.length > 60) {
    return 'Name cannot exceed 60 characters';
  }

  if (!UNICODE_NAME_REGEX.test(trimmedName)) {
    return 'Name can only contain letters and spaces';
  }

  return '';
};

/**
 * Get validation error message for subject marks (integer 0–100, required)
 * @param {string|number} value - Marks value
 * @returns {string} - Error message or empty string
 */
export const getMarksError = (value) => {
  if (value === '' || value === null || value === undefined) {
    return 'Enter marks out of 100';
  }

  const str = String(value).trim();
  if (!/^\d{1,3}$/.test(str)) {
    return 'Enter marks out of 100';
  }

  const marks = Number(str);
  if (marks < 0 || marks > 100) {
    return 'Enter marks out of 100';
  }

  return '';
};

/**
 * Get validation error message for a percentage (min–100, one decimal allowed)
 * @param {string|number} value - Percentage value
 * @param {number} [min=35] - Minimum allowed percentage
 * @returns {string} - Error message or empty string
 */
export const getPercentError = (value, min = 35) => {
  const message = `Enter a percentage between ${min} and 100`;

  if (value === '' || value === null || value === undefined) {
    return message;
  }

  const str = String(value).trim();
  if (!/^\d{1,3}(\.\d)?$/.test(str)) {
    return message;
  }

  const percent = Number(str);
  if (percent < min || percent > 100) {
    return message;
  }

  return '';
};

/**
 * Get validation error message for the 10th pass year (4 digits, 2015–2026)
 * @param {string|number} value - Year value
 * @returns {string} - Error message or empty string
 */
export const getYearError = (value) => {
  const str = String(value ?? '').trim();

  if (!/^\d{4}$/.test(str)) {
    return 'Enter the year you passed 10th';
  }

  const year = Number(str);
  if (year < 2015 || year > 2026) {
    return 'Enter the year you passed 10th';
  }

  return '';
};

/**
 * Get validation error message for the parent/guardian mobile number.
 * Must be a valid Indian mobile AND different from the student's number.
 * @param {string} parentMobile - Parent's mobile number
 * @param {string} studentMobile - Student's mobile number
 * @returns {string} - Error message or empty string
 */
export const getParentMobileError = (parentMobile, studentMobile) => {
  if (!parentMobile) return "Parent's mobile number is required";

  const cleanedParent = String(parentMobile).replace(/[\s-]/g, '');
  if (!INDIAN_MOBILE_REGEX.test(cleanedParent)) {
    return 'Enter a valid 10-digit mobile number';
  }

  const cleanedStudent = String(studentMobile || '').replace(/[\s-]/g, '');
  if (cleanedStudent && cleanedParent === cleanedStudent) {
    return "Parent's number must be different from the student's number";
  }

  return '';
};

/**
 * Compute direct-admission eligibility from 12th subject marks:
 * (Physics + Mathematics + highest other subject) / 3, rounded to 1 decimal.
 * Eligibility is met at 45% or above.
 *
 * @param {Array<{subject: string, marks: number|string}>} subjects
 * @returns {{percent: number, met: boolean, bestThird: {subject: string, marks: number}}|null}
 *   null unless Physics, Mathematics and at least one other subject have
 *   valid marks (0–100). bestThird is the highest-scoring other subject.
 */
export const computeEligibility = (subjects) => {
  if (!Array.isArray(subjects)) return null;

  let physics = null;
  let mathematics = null;
  const others = [];

  subjects.forEach((entry) => {
    if (!entry || typeof entry.subject !== 'string') return;

    const marks =
      typeof entry.marks === 'string' ? Number(entry.marks.trim()) : entry.marks;
    if (typeof marks !== 'number' || !Number.isFinite(marks)) return;
    if (marks < 0 || marks > 100) return;

    const subject = entry.subject.trim();
    const key = subject.toLowerCase();
    if (key === 'physics') {
      physics = marks;
    } else if (key === 'mathematics' || key === 'maths') {
      mathematics = marks;
    } else if (subject !== '') {
      others.push({ subject, marks });
    }
  });

  if (physics === null || mathematics === null || others.length === 0) {
    return null;
  }

  const bestThird = others.reduce((best, current) =>
    current.marks > best.marks ? current : best
  );

  const percent =
    Math.round(((physics + mathematics + bestThird.marks) / 3) * 10) / 10;

  return {
    percent,
    met: percent >= 45,
    bestThird,
  };
};

/**
 * Detect obviously fake mobile numbers: all-same-digit (e.g. 9999999999) and
 * straight ascending/descending digit sequences, wrapping through 0
 * (e.g. 9876543210, 6789012345).
 * @param {string} mobile - Mobile number
 * @returns {boolean} - True if the number looks fake
 */
export const isSuspiciousMobile = (mobile) => {
  const cleaned = String(mobile || '').replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cleaned)) return false;

  // All same digit
  if (/^(\d)\1{9}$/.test(cleaned)) return true;

  // Straight ascending / descending sequences (mod 10, so 9→0 and 0→9 count)
  let ascending = true;
  let descending = true;
  for (let i = 1; i < 10; i++) {
    const prev = cleaned.charCodeAt(i - 1) - 48;
    const current = cleaned.charCodeAt(i) - 48;
    if (current !== (prev + 1) % 10) ascending = false;
    if (current !== (prev + 9) % 10) descending = false;
  }

  return ascending || descending;
};

const applicationValidators = {
  UNICODE_NAME_REGEX,
  getUnicodeNameError,
  getMarksError,
  getPercentError,
  getYearError,
  getParentMobileError,
  computeEligibility,
  isSuspiciousMobile,
};

export default applicationValidators;
