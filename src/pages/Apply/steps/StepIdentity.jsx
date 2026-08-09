/* ============================================
   /apply — Step 1: "Let's get started"
   The ~20-second block that makes the lead
   recoverable: completing it fires the partial
   submit, so an abandoner still reaches a
   telecaller.
   ============================================ */

import React from 'react';
import {
  TextField,
  SelectField,
  ChipGroup,
  CheckboxField,
  IconUser,
  IconPhone,
  maskMobile,
} from '../fields';
import styles from '../Apply.module.css';

// Exact option strings from the enquiry form's COURSE_OPTIONS (em-dash
// format), re-declared here so `service_interest` stays admin-compatible.
export const COURSE_OPTIONS = [
  'B.E. — Artificial Intelligence & Data Science',
  'B.E. — Computer Science & Engineering',
  'B.E. — Information Science & Engineering',
  'B.E. — Electronics & Communication Engineering',
  'B.E. — Electrical & Electronics Engineering',
  'B.E. — Mechanical Engineering',
  'B.E. — Civil Engineering',
  'Not Sure — Need Guidance',
];

export const INTAKE_YEAR_OPTIONS = [
  { value: '2026', label: '2026 (this year)' },
  { value: '2027', label: '2027' },
  { value: 'researching', label: 'Just researching' },
];

const StepIdentity = ({ draft, errors, setField, onBlurField }) => (
  <>
    <h1 className={styles.stepHeading}>Let&apos;s get started</h1>
    <p className={styles.stepIntro}>Takes about 20 seconds.</p>

    <TextField
      id="apply-name"
      label="Student's full name"
      value={draft.name}
      onChange={(value) => setField('name', value)}
      onBlur={() => onBlurField('name')}
      error={errors.name}
      icon={<IconUser size={18} />}
      placeholder="Full name as on your marksheet"
      name="name"
      autoComplete="name"
      enterKeyHint="next"
      maxLength={60}
    />

    <TextField
      id="apply-mobile"
      label="Student's mobile number"
      value={draft.mobile}
      onChange={(value) => setField('mobile', value)}
      onBlur={() => onBlurField('mobile')}
      error={errors.mobile}
      icon={<IconPhone size={18} />}
      prefix="+91"
      placeholder="XXXXX XXXXX"
      type="tel"
      name="mobile"
      inputMode="numeric"
      autoComplete="tel-national"
      enterKeyHint="next"
      maxLength={10}
      mask={maskMobile}
    />

    <CheckboxField
      id="apply-whatsapp"
      label="This number is on WhatsApp"
      checked={draft.whatsapp_confirmed}
      onChange={(checked) => setField('whatsapp_confirmed', checked)}
    />

    <SelectField
      id="apply-course"
      label="Preferred B.E. branch"
      value={draft.service_interest}
      onChange={(value) => setField('service_interest', value)}
      onBlur={() => onBlurField('service_interest')}
      error={errors.service_interest}
      placeholder="Select your branch"
      options={COURSE_OPTIONS}
      name="service_interest"
    />

    <ChipGroup
      label="Planning admission for"
      value={draft.intake_year}
      onChange={(value) => setField('intake_year', value)}
      options={INTAKE_YEAR_OPTIONS}
      error={errors.intake_year}
    />
  </>
);

export default StepIdentity;
