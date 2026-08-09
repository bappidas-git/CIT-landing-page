/* ============================================
   /apply — Step 3: "Family & funding"
   The qualifiers. A parent/guardian contact and
   an honest answer on how the family plans to
   fund the course separate a real admission
   enquiry from a curious click.
   ============================================ */

import React from 'react';
import {
  TextField,
  ChipGroup,
  OptionRows,
  IconUser,
  IconPhone,
  maskMobile,
} from '../fields';
import styles from '../Apply.module.css';

export const FILLED_BY_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian / Relative' },
];

export const FUNDING_PLAN_OPTIONS = [
  { value: 'self_funded', label: 'We can fund it ourselves' },
  {
    value: 'education_loan',
    label: "We'll need an education loan (CIT assists with bank loans)",
  },
  { value: 'scholarship', label: 'Depends on scholarship support' },
  {
    value: 'need_discussion',
    label: 'We need to discuss this with the counsellor',
  },
];

const StepFamilyFinance = ({ draft, errors, setField, onBlurField }) => {
  const parentIsFilling = draft.filled_by === 'parent';

  return (
    <>
      <h1 className={styles.stepHeading}>Family &amp; funding</h1>
      <p className={styles.stepIntro}>
        Our counsellors speak to the family too — this is who we should call.
      </p>

      <ChipGroup
        label="Who is filling this form?"
        value={draft.filled_by}
        onChange={(value) => setField('filled_by', value)}
        options={FILLED_BY_OPTIONS}
        error={errors.filled_by}
      />

      <TextField
        id="apply-parent-name"
        label={parentIsFilling ? 'Your name (parent)' : "Parent/Guardian's name"}
        value={draft.parent_name}
        onChange={(value) => setField('parent_name', value)}
        onBlur={() => onBlurField('parent_name')}
        error={errors.parent_name}
        icon={<IconUser size={18} />}
        placeholder="Full name"
        name="parent_name"
        autoComplete="name"
        enterKeyHint="next"
        maxLength={60}
      />

      <TextField
        id="apply-parent-mobile"
        label={
          parentIsFilling ? 'Your mobile (parent)' : "Parent/Guardian's mobile"
        }
        value={draft.parent_mobile}
        onChange={(value) => setField('parent_mobile', value)}
        onBlur={() => onBlurField('parent_mobile')}
        error={errors.parent_mobile}
        icon={<IconPhone size={18} />}
        prefix="+91"
        placeholder="XXXXX XXXXX"
        type="tel"
        name="parent_mobile"
        inputMode="numeric"
        autoComplete="tel-national"
        enterKeyHint="done"
        maxLength={10}
        mask={maskMobile}
        hint="Must be different from the student's number."
      />

      <OptionRows
        label="How does your family plan to manage the B.E. fees and study cost?"
        value={draft.funding_plan}
        onChange={(value) => setField('funding_plan', value)}
        options={FUNDING_PLAN_OPTIONS}
        error={errors.funding_plan}
      />

      <p className={styles.reassurance}>
        CIT charges no capitation and no consultancy/agent fee. The full fee
        structure is shared transparently on your first counselling call.
      </p>
    </>
  );
};

export default StepFamilyFinance;
