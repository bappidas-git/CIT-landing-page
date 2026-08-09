/* ============================================
   /apply — Live Eligibility Badge
   Recomputes on every keystroke once Physics,
   Mathematics and at least one other subject
   carry valid marks:
     (Physics + Maths + best other) / 3

   Deliberately never blocking. A low aggregate
   shows guidance, not a rejection — the form
   stays submittable at every score, and the
   admission team decides on the call.
   ============================================ */

import React from 'react';
import { computeEligibility } from '../../utils/applicationValidators';
import { IconCheckCircle, IconAlert } from './fields';
import styles from './Apply.module.css';

/** Reserved-category relaxation floor (VTU general requirement is 45%). */
const RELAXATION_FLOOR = 40;

const EligibilityBadge = ({ subjects }) => {
  const eligibility = computeEligibility(subjects);

  // Not enough valid marks yet — the badge simply is not there.
  if (!eligibility) return null;

  const { percent, met } = eligibility;
  const relaxation = !met && percent >= RELAXATION_FLOOR;

  let message;
  if (met) {
    message =
      '✔ You meet VTU B.E. eligibility (Physics + Maths + best other subject).';
  } else if (relaxation) {
    message =
      '✔ You may qualify under the reserved-category relaxation (40%). Our team will confirm.';
  } else {
    message =
      "Our admission team will review your options — submit and we'll guide you.";
  }

  return (
    <div
      className={`${styles.badge} ${met ? styles.badgeMet : styles.badgeReview}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.badgeIcon}>
        {met ? <IconCheckCircle size={18} /> : <IconAlert size={18} />}
      </span>
      <span>
        Your eligibility aggregate:{' '}
        <strong className={styles.badgeValue}>{percent.toFixed(1)}%</strong> —{' '}
        {message}
      </span>
    </div>
  );
};

export default EligibilityBadge;
