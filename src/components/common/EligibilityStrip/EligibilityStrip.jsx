/* ============================================
   EligibilityStrip Component
   Slim, reusable VTU B.E. eligibility note.

   Rendered in two very different hosts — the
   AdmissionProcessSection on the landing page and
   Step 2 of /apply — so it stays dependency-free
   (no iconify, no framer-motion, inline SVG) to
   respect the /apply performance budget.
   ============================================ */

import React from 'react';
import styles from './EligibilityStrip.module.css';

const EligibilityStrip = ({ className = '' }) => (
  <aside className={[styles.strip, className].filter(Boolean).join(' ')}>
    <span className={styles.iconWrap} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" focusable="false">
        <path
          fill="currentColor"
          d="M12,3L1,9L12,15L21,10.09V17H23V9L12,3M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"
        />
      </svg>
    </span>
    <p className={styles.text}>
      <strong className={styles.label}>VTU B.E. eligibility:</strong> 45%
      aggregate in Physics + Maths + one more science subject in 12th (40% for
      reserved categories). Diploma holders can join 2nd year via lateral entry.
    </p>
  </aside>
);

export default EligibilityStrip;
