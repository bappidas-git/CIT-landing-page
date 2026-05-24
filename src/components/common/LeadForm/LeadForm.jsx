/* ============================================
   LeadForm Component
   Thin wrapper around UnifiedLeadForm so the
   legacy import surface keeps working while all
   real form logic lives in one place.
   CIT — Direct B.E. Engineering Admissions 2026
   ============================================ */

import React from 'react';
import UnifiedLeadForm from '../UnifiedLeadForm/UnifiedLeadForm';

// Map legacy LeadForm variants ('compact', 'card') onto the variants
// UnifiedLeadForm supports. 'dark' passes through; everything else falls
// back to 'default' so the form still renders cleanly.
const mapVariant = (variant) => {
  switch (variant) {
    case 'dark':
      return 'dark';
    case 'hero':
      return 'hero';
    case 'drawer':
      return 'drawer';
    default:
      return 'default';
  }
};

const LeadForm = ({
  variant = 'default',
  title = 'Enquire About 2026 Admission',
  subtitle = '',
  submitButtonText = 'Apply for 2026 Admission',
  showTitle = true,
  showCourseFields = true,
  onSubmitSuccess,
  onSubmitError, // kept for backward compatibility; UnifiedLeadForm surfaces errors via SweetAlert
  className = '',
  formId = 'lead-form',
}) => {
  return (
    <UnifiedLeadForm
      variant={mapVariant(variant)}
      source={formId}
      title={title}
      subtitle={subtitle}
      submitButtonText={submitButtonText}
      showTitle={showTitle}
      showSubtitle={Boolean(subtitle)}
      showCourseFields={showCourseFields}
      showTrustBadges={true}
      showConsent={true}
      showPhoneButton={false}
      onSubmitSuccess={onSubmitSuccess}
      className={className}
      formId={formId}
    />
  );
};

export default LeadForm;
