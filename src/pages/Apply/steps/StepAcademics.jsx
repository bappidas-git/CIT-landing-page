/* ============================================
   /apply — Step 2: "Academic details"
   The eligibility check. Physics and Mathematics
   are locked rows (VTU requires both); the
   applicant adds their own remaining subjects and
   watches the aggregate compute live.

   Appearing students give an expected band
   instead of marks; diploma holders skip 12th
   entirely (lateral entry — marks are collected
   on the call).
   ============================================ */

import React from 'react';
import EligibilityBadge from '../EligibilityBadge';
import EligibilityStrip from '../../../components/common/EligibilityStrip';
import {
  TextField,
  SelectField,
  ChipGroup,
  IconSchool,
  IconInfo,
  IconClose,
  IconPlus,
  maskDigits,
  maskDecimal,
} from '../fields';
import { getMarksError } from '../../../utils/applicationValidators';
import styles from '../Apply.module.css';

/** Rows VTU always requires — present from the start, never removable. */
export const LOCKED_SUBJECTS = ['Physics', 'Mathematics'];

/** Additional subjects the applicant can add (max 6). */
export const OPTIONAL_SUBJECTS = [
  'Chemistry',
  'Biology',
  'Computer Science',
  'Statistics',
  'Electronics',
  'Other',
];

export const MAX_OPTIONAL_SUBJECTS = 6;

export const TWELFTH_STATUS_OPTIONS = [
  { value: 'passed', label: 'Passed 12th' },
  { value: 'appearing_2026', label: 'Appearing in 2026' },
  { value: 'diploma', label: 'Diploma (lateral entry)' },
];

export const BOARD_OPTIONS = [
  { value: 'AHSEC', label: 'AHSEC (Assam)' },
  { value: 'NBSE', label: 'NBSE (Nagaland)' },
  { value: 'MBOSE', label: 'MBOSE (Meghalaya)' },
  { value: 'TBSE', label: 'TBSE (Tripura)' },
  { value: 'COHSEM', label: 'COHSEM (Manipur)' },
  { value: 'CBSE', label: 'CBSE' },
  { value: 'ICSE', label: 'ICSE / ISC' },
  { value: 'Other', label: 'Other board' },
];

export const EXPECTED_BAND_OPTIONS = [
  { value: 'above_75', label: 'Above 75%' },
  { value: '60_75', label: '60–75%' },
  { value: '45_60', label: '45–60%' },
  { value: 'below_45', label: 'Below 45%' },
];

const StepAcademics = ({
  draft,
  errors,
  setField,
  onBlurField,
  onAddSubject,
  onRemoveSubject,
  onSubjectMarksChange,
}) => {
  const status = draft.twelfth_status;
  const subjects = draft.twelfth_subjects || [];
  const optionalCount = subjects.length - LOCKED_SUBJECTS.length;
  const addedSubjects = subjects.map((row) => row.subject);
  // Rows only turn red once the step has actually been validated.
  const showRowErrors = !!errors.twelfth_subjects;

  return (
    <>
      <h1 className={styles.stepHeading}>Academic details</h1>
      <p className={styles.stepIntro}>
        CIT&apos;s admission team uses this to confirm your VTU B.E. eligibility
        instantly.
      </p>

      <EligibilityStrip className={styles.eligibilityStrip} />

      <ChipGroup
        label="Your 12th / PUC status"
        value={status}
        onChange={(value) => setField('twelfth_status', value)}
        options={TWELFTH_STATUS_OPTIONS}
        error={errors.twelfth_status}
      />

      {status === 'diploma' && (
        <p className={styles.infoPanel}>
          <span className={styles.badgeIcon}>
            <IconInfo size={18} />
          </span>
          <span>
            Diploma holders join B.E. 2nd year via lateral entry — we&apos;ll
            collect your diploma marks on the call.
          </span>
        </p>
      )}

      {status && status !== 'diploma' && (
        <>
          <SelectField
            id="apply-board"
            label="12th board"
            value={draft.twelfth_board}
            onChange={(value) => setField('twelfth_board', value)}
            onBlur={() => onBlurField('twelfth_board')}
            error={errors.twelfth_board}
            placeholder="Select your board"
            options={BOARD_OPTIONS}
            name="twelfth_board"
          />

          <TextField
            id="apply-twelfth-school"
            label="School/College name (12th)"
            value={draft.twelfth_school}
            onChange={(value) => setField('twelfth_school', value)}
            onBlur={() => onBlurField('twelfth_school')}
            error={errors.twelfth_school}
            icon={<IconSchool size={18} />}
            placeholder="Where you studied 12th"
            name="twelfth_school"
            autoComplete="organization"
            enterKeyHint="next"
            maxLength={120}
          />
        </>
      )}

      {status === 'appearing_2026' && (
        <ChipGroup
          label="Expected 12th result"
          value={draft.expected_band}
          onChange={(value) => setField('expected_band', value)}
          options={EXPECTED_BAND_OPTIONS}
          error={errors.expected_band}
          hint="An honest estimate is enough — we re-check after your results."
        />
      )}

      {status === 'passed' && (
        <div
          className={styles.field}
          data-invalid={errors.twelfth_subjects ? 'true' : undefined}
        >
          <span className={styles.label}>Subjects &amp; marks (12th)</span>

          {subjects.map((row, index) => {
            const locked = index < LOCKED_SUBJECTS.length;
            const rowError = showRowErrors && !!getMarksError(row.marks);
            const isLast = index === subjects.length - 1;
            return (
              <div className={styles.subjectRow} key={`${row.subject}-${index}`}>
                <span className={styles.subjectName}>
                  {row.subject}
                  {locked && (
                    <span className={styles.subjectLocked}>· required</span>
                  )}
                </span>
                <span
                  className={styles.marksWrap}
                  data-error={rowError ? 'true' : undefined}
                >
                  <input
                    className={styles.marksInput}
                    value={row.marks}
                    onChange={(event) =>
                      onSubjectMarksChange(index, maskDigits(event.target.value, 3))
                    }
                    onPaste={(event) => {
                      event.preventDefault();
                      onSubjectMarksChange(
                        index,
                        maskDigits(event.clipboardData.getData('text'), 3)
                      );
                    }}
                    onBlur={() => onBlurField('twelfth_subjects')}
                    inputMode="numeric"
                    enterKeyHint={isLast ? 'done' : 'next'}
                    aria-label={`${row.subject} marks out of 100`}
                    placeholder="Marks"
                    maxLength={3}
                  />
                  <span className={styles.marksSuffix}>/100</span>
                </span>
                {!locked && (
                  <button
                    type="button"
                    className={styles.removeSubject}
                    onClick={() => onRemoveSubject(index)}
                    aria-label={`Remove ${row.subject}`}
                  >
                    <IconClose size={18} />
                  </button>
                )}
              </div>
            );
          })}

          <span className={styles.addSubjectLabel}>
            Add your other subjects
          </span>
          <div className={styles.chips}>
            {OPTIONAL_SUBJECTS.map((subject) => {
              const alreadyAdded = addedSubjects.includes(subject);
              const full = optionalCount >= MAX_OPTIONAL_SUBJECTS;
              return (
                <button
                  key={subject}
                  type="button"
                  className={styles.addChip}
                  disabled={alreadyAdded || full}
                  onClick={() => onAddSubject(subject)}
                >
                  <IconPlus size={14} />
                  {subject}
                </button>
              );
            })}
          </div>

          {errors.twelfth_subjects && (
            <span className={styles.errorText} role="alert">
              {errors.twelfth_subjects}
            </span>
          )}
        </div>
      )}

      {status === 'passed' && (
        <EligibilityBadge subjects={draft.twelfth_subjects} />
      )}

      <TextField
        id="apply-tenth-school"
        label="School name (10th)"
        value={draft.tenth_school}
        onChange={(value) => setField('tenth_school', value)}
        onBlur={() => onBlurField('tenth_school')}
        error={errors.tenth_school}
        icon={<IconSchool size={18} />}
        placeholder="Where you studied 10th"
        name="tenth_school"
        autoComplete="organization"
        enterKeyHint="next"
        maxLength={120}
      />

      <TextField
        id="apply-tenth-year"
        label="Year of passing 10th"
        value={draft.tenth_year}
        onChange={(value) => setField('tenth_year', value)}
        onBlur={() => onBlurField('tenth_year')}
        error={errors.tenth_year}
        placeholder="e.g. 2024"
        name="tenth_year"
        inputMode="numeric"
        enterKeyHint="next"
        maxLength={4}
        mask={(value) => maskDigits(value, 4)}
      />

      <TextField
        id="apply-tenth-percent"
        label="10th percentage"
        value={draft.tenth_percent}
        onChange={(value) => setField('tenth_percent', value)}
        onBlur={() => onBlurField('tenth_percent')}
        error={errors.tenth_percent}
        placeholder="e.g. 68.5"
        name="tenth_percent"
        inputMode="numeric"
        enterKeyHint="done"
        maxLength={5}
        mask={maskDecimal}
      />
    </>
  );
};

export default StepAcademics;
