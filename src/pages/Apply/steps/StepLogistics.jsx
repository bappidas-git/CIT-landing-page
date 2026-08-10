/* ============================================
   /apply — Step 4: "Almost done"
   Where the counselling call actually happens,
   how soon, and the optional extras. Only three
   fields on the whole form are optional and all
   three live here: best_time, email, message.
   ============================================ */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  TextField,
  TextAreaField,
  SelectField,
  ChipGroup,
  IconMapMarker,
  IconEmail,
  IconClose,
} from '../fields';
import styles from '../Apply.module.css';

// Same 8 North-East states + "Other" the enquiry form offers, stored under
// the existing `state` key.
export const STATE_OPTIONS = [
  'Assam',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Tripura',
  'Sikkim',
  'Other',
];

export const COUNSELLING_MODE_OPTIONS = [
  { value: 'whatsapp_video', label: 'WhatsApp video call' },
  { value: 'phone', label: 'Phone call' },
  { value: 'campus_visit', label: 'I can visit the campus' },
  { value: 'ne_rep', label: "Meet CIT's NE representative near me" },
];

export const ADMISSION_TIMELINE_OPTIONS = [
  { value: 'two_weeks', label: 'Within 2 weeks' },
  { value: 'one_month', label: 'Within a month' },
  { value: 'after_results', label: 'After my results' },
  { value: 'not_sure', label: 'Not sure yet' },
];

export const BEST_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

// ============================================
// Privacy policy copy
// (re-declared locally — the enquiry form's component is protected and is
// deliberately not imported, which also keeps its dependencies out of this chunk)
// ============================================
const PrivacyPolicyContent = () => (
  <>
    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>Introduction</h3>
      <p className={styles.policyText}>
        Channabasaveshwara Institute of Technology (CIT), Tumakuru, together
        with Assam Digital, the marketing partner running this 2026 B.E.
        admissions campaign (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;),
        respects your privacy and is committed to protecting the information you
        share with us. This Privacy Policy explains how we collect, use, and
        safeguard your information when you submit an admission application
        through this page.
      </p>
    </section>

    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>Information We Collect</h3>
      <p className={styles.policyText}>
        Through the application form on this page we collect:
      </p>
      <ul className={styles.policyList}>
        <li>
          <strong>Contact details:</strong> your full name, mobile number,
          email address, and your parent/guardian&apos;s name and mobile number.
        </li>
        <li>
          <strong>Academic details:</strong> your 10th and 12th school, board,
          year, percentage and subject marks, used to confirm your VTU B.E.
          eligibility.
        </li>
        <li>
          <strong>Admission preferences:</strong> the B.E. branch you are
          interested in, your intake year, home state and district, how you
          plan to fund the course, and how you would like to be counselled.
        </li>
        <li>
          <strong>Optional message:</strong> any question you choose to add for
          the admission team.
        </li>
        <li>
          <strong>Usage &amp; device data:</strong> standard analytics
          information (IP address, browser, pages visited) used to improve the
          site and measure campaign performance.
        </li>
      </ul>
    </section>

    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>How We Use Your Information</h3>
      <p className={styles.policyText}>We use the information you submit to:</p>
      <ul className={styles.policyList}>
        <li>
          Provide personalised guidance on CIT&apos;s 2026 B.E.
          direct-admission process.
        </li>
        <li>Contact you by phone, WhatsApp, SMS, or email about your application.</li>
        <li>
          Share course, fee, hostel, and placement details relevant to your
          application.
        </li>
        <li>
          Improve our website, content, and ad campaigns based on aggregated
          usage data.
        </li>
      </ul>
    </section>

    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>Information Sharing</h3>
      <p className={styles.policyText}>Your application is shared with:</p>
      <ul className={styles.policyList}>
        <li>
          <strong>CIT admission office, Tumakuru:</strong> so the admission team
          can follow up with you.
        </li>
        <li>
          <strong>Assam Digital:</strong> the marketing partner managing this
          campaign and the North-East admission desk.
        </li>
        <li>
          <strong>Service providers:</strong> trusted vendors that help us host
          the website, send communications, and measure campaign performance.
        </li>
      </ul>
      <p className={styles.policyText}>
        We do not sell your personal information to third parties.
      </p>
    </section>

    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>Data Security</h3>
      <p className={styles.policyText}>
        We use reasonable technical and organisational measures to protect your
        information against unauthorised access, alteration, or disclosure. No
        method of internet transmission is fully secure, so we cannot guarantee
        absolute security.
      </p>
    </section>

    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>Your Rights</h3>
      <p className={styles.policyText}>You can, at any time:</p>
      <ul className={styles.policyList}>
        <li>Request a copy of the data we hold about you.</li>
        <li>Ask us to correct inaccurate information.</li>
        <li>
          Ask us to delete your application data (subject to any legal
          obligations).
        </li>
        <li>
          Opt out of further admission communication from CIT or Assam Digital.
        </li>
      </ul>
    </section>

    <section className={styles.policySection}>
      <h3 className={styles.policyHeading}>Contact Us</h3>
      <p className={styles.policyText}>
        For any privacy questions or to exercise your rights, please contact the
        CIT admission office:
      </p>
      <p className={styles.policyText}>
        <strong>Channabasaveshwara Institute of Technology (CIT)</strong>
        <br />
        NH 206, B.H. Road, Gubbi, Tumakuru – 572 216, Karnataka
        <br />
        Phone: +91 84536 23233
      </p>
    </section>

    <p className={styles.policyUpdated}>Last Updated: January 2026</p>
  </>
);

const PrivacyOverlay = ({ onClose }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Terms & Conditions and Privacy Policy"
      onClick={onClose}
    >
      <div
        className={styles.overlayPanel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.overlayHeader}>
          <h2 className={styles.overlayTitle}>
            Terms &amp; Conditions and Privacy Policy
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close privacy policy"
          >
            <IconClose size={22} />
          </button>
        </div>
        <div className={styles.overlayBody}>
          <PrivacyPolicyContent />
        </div>
      </div>
    </div>,
    document.body
  );
};

const StepLogistics = ({ draft, errors, setField, onBlurField }) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <h1 className={styles.stepHeading}>Almost done</h1>
      <p className={styles.stepIntro}>
        Tell us where you are and how you&apos;d like the admission team to
        reach you.
      </p>

      <SelectField
        id="apply-state"
        label="Your home state"
        value={draft.state}
        onChange={(value) => setField('state', value)}
        onBlur={() => onBlurField('state')}
        error={errors.state}
        placeholder="Select your state"
        options={STATE_OPTIONS}
        name="state"
      />

      <TextField
        id="apply-district"
        label="Your district / town"
        value={draft.district}
        onChange={(value) => setField('district', value)}
        onBlur={() => onBlurField('district')}
        error={errors.district}
        icon={<IconMapMarker size={18} />}
        placeholder="e.g. Nagaon"
        name="district"
        autoComplete="address-level2"
        enterKeyHint="next"
        maxLength={60}
      />

      <ChipGroup
        label="How would you like to be counselled?"
        value={draft.counselling_mode}
        onChange={(value) => setField('counselling_mode', value)}
        options={COUNSELLING_MODE_OPTIONS}
        error={errors.counselling_mode}
      />

      <ChipGroup
        label="When do you want to confirm your admission?"
        value={draft.admission_timeline}
        onChange={(value) => setField('admission_timeline', value)}
        options={ADMISSION_TIMELINE_OPTIONS}
        error={errors.admission_timeline}
      />

      <ChipGroup
        label="Best time to call (optional)"
        value={draft.best_time}
        onChange={(value) =>
          setField('best_time', draft.best_time === value ? '' : value)
        }
        options={BEST_TIME_OPTIONS}
      />

      <TextField
        id="apply-email"
        label="Email address"
        optional
        value={draft.email}
        onChange={(value) => setField('email', value)}
        onBlur={() => onBlurField('email')}
        error={errors.email}
        icon={<IconEmail size={18} />}
        placeholder="your@email.com"
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        enterKeyHint="next"
      />

      <TextAreaField
        id="apply-message"
        label="Any question for the admission team?"
        optional
        value={draft.message}
        onChange={(value) => setField('message', value)}
        onBlur={() => onBlurField('message')}
        error={errors.message}
        placeholder="Hostel, scholarships, travel from the North East…"
        name="message"
        maxLength={500}
        enterKeyHint="done"
      />

      <p className={styles.consent}>
        By submitting, I agree to be contacted by CIT / Assam Digital about 2026
        B.E. admissions and to the{' '}
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => setPrivacyOpen(true)}
        >
          Terms &amp; Conditions and Privacy Policy
        </button>
        .
      </p>

      {privacyOpen && <PrivacyOverlay onClose={() => setPrivacyOpen(false)} />}
    </>
  );
};

export default StepLogistics;
