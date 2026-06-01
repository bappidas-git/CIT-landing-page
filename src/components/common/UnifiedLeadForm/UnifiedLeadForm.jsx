/* ============================================
   UnifiedLeadForm Component
   Single reusable lead capture form with:
   - Duplicate prevention
   - Trust badges
   - Consent text
   - Redirect to Thank You page
   - Customizable title, subtitle, and phone CTA
   CIT — Direct B.E. Engineering Admissions 2026
   ============================================ */

import React, { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { submitLeadToWebhook } from "../../../utils/webhookSubmit";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { showSuccess, showError, showInfo } from "../../../utils/swalHelper";
import { trackFormSubmission } from "../../../utils/gtm";
import { trackLead as trackMetaLead } from "../../../utils/metaPixel";
import { sendLeadEvent } from "../../../utils/metaCAPI";
import { generateEventId } from "../../../utils/eventDedup";
import { trackFormSubmission as trackGoogleAdsFormSubmission } from "../../../utils/googleAds";
import { sendEnhancedConversionData } from "../../../utils/enhancedConversions";
import Button from "../Button/Button";
import {
  getMobileErrorMessage,
  getEmailErrorMessage,
  getNameErrorMessage,
} from "../../../utils/validators";
import styles from "./UnifiedLeadForm.module.css";

// Course options for CIT B.E. (Engineering) admissions 2026.
// NOTE: stored under `service_interest` in form state / webhook payload to
// preserve the existing admin + webhook plumbing — the value is the course.
const COURSE_OPTIONS = [
  "B.E. — Artificial Intelligence & Data Science",
  "B.E. — Computer Science & Engineering",
  "B.E. — Information Science & Engineering",
  "B.E. — Electronics & Communication Engineering",
  "B.E. — Electrical & Electronics Engineering",
  "B.E. — Mechanical Engineering",
  "B.E. — Civil Engineering",
  "Not Sure — Need Guidance",
];

// North-East India state options (the campaign's target geography).
const STATE_OPTIONS = [
  "Assam",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Tripura",
  "Sikkim",
  "Other",
];

// Initial form state
const initialFormState = {
  name: "",
  mobile: "",
  email: "",
  service_interest: "",
  state: "",
  message: "",
};

// Initial error state
const initialErrorState = {
  name: "",
  mobile: "",
  email: "",
  service_interest: "",
  state: "",
  message: "",
};

// Privacy Policy Content Component
const PrivacyPolicyContent = () => (
  <div style={{ padding: "0 8px" }}>
    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        Introduction
      </h3>
      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#374151" }}>
        Channabasaveshwara Institute of Technology (CIT), Tumakuru, together
        with Assam Digital, the marketing partner running this 2026 B.E.
        admissions campaign ("we," "our," or "us"), respects your privacy and is
        committed to protecting the information you share with us. This Privacy
        Policy explains how we collect, use, and safeguard your information
        when you submit an admission enquiry through this landing page.
      </p>
    </section>

    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        Information We Collect
      </h3>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        Through the enquiry form on this page we collect:
      </p>
      <ul
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          paddingLeft: "20px",
          margin: 0,
        }}
      >
        <li style={{ marginBottom: "6px" }}>
          <strong>Contact details:</strong> your full name, mobile number, and
          email address.
        </li>
        <li style={{ marginBottom: "6px" }}>
          <strong>Admission preferences:</strong> the B.E. course you are
          interested in and the state you are applying from.
        </li>
        <li style={{ marginBottom: "6px" }}>
          <strong>Optional message:</strong> any question you choose to add
          about admission, hostel, or fees.
        </li>
        <li>
          <strong>Usage & device data:</strong> standard analytics information
          (IP address, browser, pages visited) used to improve the site and
          measure campaign performance.
        </li>
      </ul>
    </section>

    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        How We Use Your Information
      </h3>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        We use the information you submit to:
      </p>
      <ul
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          paddingLeft: "20px",
          margin: 0,
        }}
      >
        <li style={{ marginBottom: "6px" }}>
          Provide personalised guidance on CIT's 2026 B.E. direct-admission
          process.
        </li>
        <li style={{ marginBottom: "6px" }}>
          Contact you by phone, WhatsApp, SMS, or email about your enquiry.
        </li>
        <li style={{ marginBottom: "6px" }}>
          Share course, fee, hostel, and placement details relevant to your
          enquiry.
        </li>
        <li>
          Improve our website, content, and ad campaigns based on aggregated
          usage data.
        </li>
      </ul>
    </section>

    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        Information Sharing
      </h3>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        Your enquiry is shared with:
      </p>
      <ul
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          paddingLeft: "20px",
          margin: 0,
        }}
      >
        <li style={{ marginBottom: "6px" }}>
          <strong>CIT admission office, Tumakuru:</strong> so the admission
          team can follow up with you.
        </li>
        <li style={{ marginBottom: "6px" }}>
          <strong>Assam Digital:</strong> the marketing partner managing this
          campaign and the North-East admission desk.
        </li>
        <li>
          <strong>Service providers:</strong> trusted vendors that help us host
          the website, send communications, and measure campaign performance.
        </li>
      </ul>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          marginTop: "8px",
        }}
      >
        We do not sell your personal information to third parties.
      </p>
    </section>

    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        Data Security
      </h3>
      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#374151" }}>
        We use reasonable technical and organisational measures to protect your
        information against unauthorised access, alteration, or disclosure. No
        method of internet transmission is fully secure, so we cannot guarantee
        absolute security.
      </p>
    </section>

    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        Your Rights
      </h3>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        You can, at any time:
      </p>
      <ul
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          paddingLeft: "20px",
          margin: 0,
        }}
      >
        <li style={{ marginBottom: "6px" }}>
          Request a copy of the data we hold about you.
        </li>
        <li style={{ marginBottom: "6px" }}>
          Ask us to correct inaccurate information.
        </li>
        <li style={{ marginBottom: "6px" }}>
          Ask us to delete your enquiry data (subject to any legal obligations).
        </li>
        <li>
          Opt out of further admission communication from CIT or Assam Digital.
        </li>
      </ul>
    </section>

    <section style={{ marginBottom: "24px" }}>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#0C2D48",
        }}
      >
        Contact Us
      </h3>
      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#374151" }}>
        For any privacy questions or to exercise your rights, please contact
        the CIT admission office:
      </p>
      <p
        style={{
          fontSize: "14px",
          lineHeight: 1.6,
          color: "#374151",
          marginTop: "8px",
        }}
      >
        <strong>Channabasaveshwara Institute of Technology (CIT)</strong>
        <br />
        NH 206, B.H. Road, Gubbi, Tumakuru – 572 216, Karnataka
        <br />
        Phone: +91 8069645014
      </p>
    </section>

    <p style={{ fontSize: "12px", color: "#6B7280", fontStyle: "italic" }}>
      Last Updated: January 2026
    </p>
  </div>
);

// Privacy Policy Modal Component
const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (typeof window === "undefined") return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #E5E7EB",
                backgroundColor: "#F9FAFB",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  margin: 0,
                  color: "#0C2D48",
                }}
              >
                Privacy Policy
              </h2>
              <IconButton
                onClick={onClose}
                aria-label="Close modal"
                size="small"
                sx={{ color: "#6B7280" }}
              >
                <Icon icon="mdi:close" />
              </IconButton>
            </div>
            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                maxHeight: "calc(80vh - 60px)",
              }}
            >
              <PrivacyPolicyContent />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Contextual header text based on source
const getHeaderDefaults = (source) => {
  switch (source) {
    case "hero":
      return {
        title: "Apply for Direct B.E. Admission 2026",
        subtitle: "Get personal guidance from CIT's admission team",
      };
    case "contact":
      return {
        title: "Request a Callback",
        subtitle: "Our admission team will call you within 24 hours",
      };
    default:
      return {
        title: "Enquire About 2026 Admission",
        subtitle: "Fill the form — we'll guide you",
      };
  }
};

const UnifiedLeadForm = ({
  variant = "default", // 'default', 'dark', 'hero', 'drawer'
  source = "default",
  title: titleProp,
  subtitle: subtitleProp,
  submitButtonText = "Apply for 2026 Admission",
  showTitle = true,
  showSubtitle = true,
  showCourseFields = true,
  showTrustBadges = true,
  showConsent = true,
  showPhoneButton = false,
  onClose, // Called when drawer should close (for drawer variant)
  onSubmitSuccess,
  className = "",
  formId = "unified-lead-form",
}) => {
  const headerDefaults = getHeaderDefaults(source);
  const title = titleProp || headerDefaults.title;
  const subtitle = subtitleProp || headerDefaults.subtitle;
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrorState);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Refs for input focus management
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const serviceRef = useRef(null);
  const stateSelectRef = useRef(null);
  const messageRef = useRef(null);

  // Handle input change
  const handleChange = useCallback(
    (field) => (event) => {
      let value = event.target.value;

      // Special handling for mobile number - only allow digits
      if (field === "mobile") {
        value = value.replace(/\D/g, "").slice(0, 10);
      }

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [errors]
  );

  // Handle input blur - validate on blur
  const handleBlur = useCallback(
    (field) => () => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      // Validate the field
      let errorMessage = "";

      switch (field) {
        case "name":
          errorMessage = getNameErrorMessage(formData.name);
          break;
        case "mobile":
          errorMessage = getMobileErrorMessage(formData.mobile);
          break;
        case "email":
          if (formData.email) {
            errorMessage = getEmailErrorMessage(formData.email);
          }
          break;
        case "service_interest":
          if (showCourseFields && !formData.service_interest) {
            errorMessage = "Please select a course";
          }
          break;
        case "state":
          if (showCourseFields && !formData.state) {
            errorMessage = "Please select your state";
          }
          break;
        case "message":
          if (formData.message && formData.message.length > 500) {
            errorMessage = "Message must be 500 characters or less";
          }
          break;
        default:
          break;
      }

      setErrors((prev) => ({
        ...prev,
        [field]: errorMessage,
      }));
    },
    [formData, showCourseFields]
  );

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {
      name: getNameErrorMessage(formData.name),
      mobile: getMobileErrorMessage(formData.mobile),
      email: formData.email ? getEmailErrorMessage(formData.email) : "",
      service_interest:
        showCourseFields && !formData.service_interest
          ? "Please select a course"
          : "",
      state:
        showCourseFields && !formData.state
          ? "Please select your state"
          : "",
      message:
        formData.message && formData.message.length > 500
          ? "Message must be 500 characters or less"
          : "",
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      mobile: true,
      email: true,
      service_interest: true,
      state: true,
      message: true,
    });

    return Object.values(newErrors).every((error) => !error);
  }, [formData, showCourseFields]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Guard against double-click

    // Validate form
    if (!validateForm()) {
      // Focus first field with error
      if (errors.name || !formData.name) {
        nameRef.current?.focus();
      } else if (errors.mobile || !formData.mobile) {
        mobileRef.current?.focus();
      } else if (errors.email || !formData.email) {
        emailRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare lead data
      // `service_interest` holds the selected B.E. course (legacy key kept
      // for admin panel compatibility — see COURSE_OPTIONS above).
      const leadData = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        service_interest: formData.service_interest || '',
        state: formData.state || '',
        message: formData.message || '',
        source: formId || 'general',
      };

      // Submit to the shared server-side lead store (single source of truth).
      const result = await submitLeadToWebhook(leadData);

      // The server dedupes by mobile/email across all devices — surface a
      // friendly "already registered" message instead of a second lead.
      if (result.duplicate) {
        await showInfo(
          'Already Registered!',
          'An enquiry with this mobile number has already been submitted. Our team will contact you soon.'
        );
        return;
      }

      if (result.success) {
        // Push lead form submission + generate_lead conversion events to GTM
        trackFormSubmission(formId || 'general', {
          serviceInterest: formData.service_interest,
        });

        // Meta Pixel + CAPI dual tracking with shared event_id for deduplication
        const metaEventId = generateEventId();

        // 1. Fire browser-side Meta Pixel Lead event (no PII)
        trackMetaLead({
          event_id: metaEventId,
          content_name: formId || 'lead_form',
          content_category: 'lead_generation',
        });

        // 2. Send server-side CAPI Lead event with hashed PII (non-blocking)
        sendLeadEvent({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          event_id: metaEventId,
          source: formId || 'general',
        }).catch((err) => {
          console.error('[MetaCAPI] Lead event failed:', err);
        });

        // 3. Fire Google Ads conversion event
        trackGoogleAdsFormSubmission(formId || 'general');

        // 4. Send enhanced conversion data (hashed PII) for Google Ads
        sendEnhancedConversionData(
          formData.email,
          formData.mobile,
          formData.name
        ).catch((err) => {
          console.error('[EnhancedConversions] Failed:', err);
        });

        // Set lead submitted flag for thank you page access
        sessionStorage.setItem("lead_submitted", "true");
        sessionStorage.setItem("lead_name", formData.name);

        // Show success alert ON TOP of drawer
        await showSuccess(
          'Thank You!',
          "Our admission team will call you shortly to guide you through the 2026 B.E. direct-admission process."
        );

        // THEN reset form
        setFormData(initialFormState);
        setTouched({});
        setErrors(initialErrorState);

        // THEN close drawer (if in a drawer)
        if (onClose) {
          onClose();
        }

        // Callback for parent component
        if (onSubmitSuccess) {
          onSubmitSuccess(formData);
        }

        // THEN navigate to thank you page
        navigate('/thank-you');
      } else {
        await showError('Oops!', result.message);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      await showError(
        'Something went wrong',
        'Please try again or call us directly at +91 8069645014.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.3 },
    }),
  };

  // Determine styles based on variant
  const getVariantClass = () => {
    switch (variant) {
      case "dark":
        return styles.variantDark;
      case "hero":
        return styles.variantHero;
      case "drawer":
        return styles.variantDrawer;
      default:
        return styles.variantDefault;
    }
  };

  return (
    <div
      className={`${styles.formContainer} ${getVariantClass()} ${className}`}
    >
      {/* Form Header */}
      {(showTitle || showSubtitle) && (
        <div className={styles.formHeader}>
          {showTitle && (
            <Typography variant="h5" className={styles.formTitle}>
              {title}
            </Typography>
          )}
          {showSubtitle && subtitle && (
            <Typography
              variant="body2"
              className={styles.formSubtitle}
              sx={
                variant === "dark" || variant === "drawer"
                  ? { color: "#FFFFFFB3 !important" }
                  : undefined
              }
            >
              {subtitle}
            </Typography>
          )}
        </div>
      )}

      {/* Form */}
      <form
        id={formId}
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
        autoComplete="off"
      >
        {/* Name Field */}
        <motion.div
          custom={0}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <TextField
            inputRef={nameRef}
            fullWidth
            placeholder="Your Full Name"
            variant="outlined"
            value={formData.name}
            onChange={handleChange("name")}
            onBlur={handleBlur("name")}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            disabled={isSubmitting}
            className={styles.textField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon
                    icon="mdi:account-outline"
                    className={styles.inputIcon}
                    style={
                      variant === "dark" || variant === "drawer"
                        ? { color: "#FFFFFF80" }
                        : undefined
                    }
                  />
                </InputAdornment>
              ),
            }}
            inputProps={{
              "aria-label": "Your name",
              maxLength: 50,
            }}
          />
        </motion.div>

        {/* Mobile Field */}
        <motion.div
          custom={1}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <TextField
            inputRef={mobileRef}
            fullWidth
            placeholder="XXXXX XXXXX"
            variant="outlined"
            value={formData.mobile}
            onChange={handleChange("mobile")}
            onBlur={handleBlur("mobile")}
            error={touched.mobile && !!errors.mobile}
            helperText={touched.mobile && errors.mobile}
            disabled={isSubmitting}
            className={styles.textField}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  className={styles.mobilePrefix}
                >
                  <Typography
                    variant="body2"
                    className={styles.countryCode}
                    sx={
                      variant === "dark" || variant === "drawer"
                        ? { color: "#FFFFFFCC !important" }
                        : undefined
                    }
                  >
                    +91
                  </Typography>
                  <span
                    className={styles.prefixDivider}
                    style={
                      variant === "dark" || variant === "drawer"
                        ? { color: "#FFFFFF4D" }
                        : undefined
                    }
                  >
                    -
                  </span>
                </InputAdornment>
              ),
            }}
            inputProps={{
              "aria-label": "Mobile number",
              maxLength: 10,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />
        </motion.div>

        {/* Email Field */}
        <motion.div
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <TextField
            inputRef={emailRef}
            fullWidth
            placeholder="your@email.com"
            type="email"
            variant="outlined"
            value={formData.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            disabled={isSubmitting}
            className={styles.textField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon
                    icon="mdi:email-outline"
                    className={styles.inputIcon}
                    style={
                      variant === "dark" || variant === "drawer"
                        ? { color: "#FFFFFF80" }
                        : undefined
                    }
                  />
                </InputAdornment>
              ),
            }}
            inputProps={{
              "aria-label": "Email address",
            }}
          />
        </motion.div>

        {/* Course Interested In Field */}
        {showCourseFields && (
          <motion.div
            custom={3}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <FormControl
              fullWidth
              error={touched.service_interest && !!errors.service_interest}
              className={styles.textField}
            >
              <Select
                ref={serviceRef}
                displayEmpty
                value={formData.service_interest}
                onChange={handleChange("service_interest")}
                onBlur={handleBlur("service_interest")}
                disabled={isSubmitting}
                startAdornment={
                  <InputAdornment position="start">
                    <Icon
                      icon="mdi:school-outline"
                      className={styles.inputIcon}
                      style={
                        variant === "dark" || variant === "drawer"
                          ? { color: "#FFFFFF80" }
                          : undefined
                      }
                    />
                  </InputAdornment>
                }
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: variant === "dark" || variant === "drawer" ? "#FFFFFF80" : undefined, opacity: variant === "dark" || variant === "drawer" ? 1 : 0.5 }}>
                        Course Interested In
                      </span>
                    );
                  }
                  return selected;
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { zIndex: 99999 },
                  },
                  disablePortal: false,
                  style: { zIndex: 99999 },
                }}
                inputProps={{
                  "aria-label": "Course interested in",
                }}
                sx={
                  variant === "dark" || variant === "drawer"
                    ? { color: "#FFFFFF", "& .MuiSelect-icon": { color: "#FFFFFF80" } }
                    : undefined
                }
              >
                {COURSE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {touched.service_interest && errors.service_interest && (
                <FormHelperText>{errors.service_interest}</FormHelperText>
              )}
            </FormControl>
          </motion.div>
        )}

        {/* State Field (NE states) */}
        {showCourseFields && (
          <motion.div
            custom={4}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <FormControl
              fullWidth
              error={touched.state && !!errors.state}
              className={styles.textField}
            >
              <Select
                ref={stateSelectRef}
                displayEmpty
                value={formData.state}
                onChange={handleChange("state")}
                onBlur={handleBlur("state")}
                disabled={isSubmitting}
                startAdornment={
                  <InputAdornment position="start">
                    <Icon
                      icon="mdi:map-marker-outline"
                      className={styles.inputIcon}
                      style={
                        variant === "dark" || variant === "drawer"
                          ? { color: "#FFFFFF80" }
                          : undefined
                      }
                    />
                  </InputAdornment>
                }
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: variant === "dark" || variant === "drawer" ? "#FFFFFF80" : undefined, opacity: variant === "dark" || variant === "drawer" ? 1 : 0.5 }}>
                        Your State
                      </span>
                    );
                  }
                  return selected;
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { zIndex: 99999 },
                  },
                  disablePortal: false,
                  style: { zIndex: 99999 },
                }}
                inputProps={{
                  "aria-label": "Your state",
                }}
                sx={
                  variant === "dark" || variant === "drawer"
                    ? { color: "#FFFFFF", "& .MuiSelect-icon": { color: "#FFFFFF80" } }
                    : undefined
                }
              >
                {STATE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {touched.state && errors.state && (
                <FormHelperText>{errors.state}</FormHelperText>
              )}
            </FormControl>
          </motion.div>
        )}

        {/* Brief Message Field */}
        <motion.div
          custom={5}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <TextField
            inputRef={messageRef}
            fullWidth
            placeholder="Any question about admission, hostel, or fees? (optional)"
            variant="outlined"
            value={formData.message}
            onChange={handleChange("message")}
            onBlur={handleBlur("message")}
            error={touched.message && !!errors.message}
            helperText={touched.message && errors.message}
            disabled={isSubmitting}
            multiline
            minRows={2}
            maxRows={4}
            className={`${styles.textField} ${styles.messageField}`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" className={styles.messageAdornment}>
                  <Icon
                    icon="mdi:message-text-outline"
                    className={styles.inputIcon}
                    style={
                      variant === "dark" || variant === "drawer"
                        ? { color: "#FFFFFF80" }
                        : undefined
                    }
                  />
                </InputAdornment>
              ),
            }}
            inputProps={{
              "aria-label": "Brief message",
              maxLength: 500,
            }}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          custom={showCourseFields ? 6 : 3}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          className={styles.submitWrapper}
        >
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <Box className={styles.loadingState}>
                <CircularProgress size={20} color="inherit" />
                <span>Submitting...</span>
              </Box>
            ) : (
              <>
                <Icon icon="mdi:calendar-check" className={styles.submitIcon} />
                <span>{submitButtonText}</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* Trust Badges */}
        {showTrustBadges && (
          <motion.div
            custom={showCourseFields ? 7 : 4}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            className={styles.trustBadges}
          >
            <div
              className={styles.trustBadge}
              style={
                variant === "dark" || variant === "drawer"
                  ? { color: "#FFFFFF99" }
                  : undefined
              }
            >
              <Icon icon="mdi:gift-outline" className={styles.trustIcon} />
              <span>100% Free Guidance</span>
            </div>
            <div
              className={styles.trustBadge}
              style={
                variant === "dark" || variant === "drawer"
                  ? { color: "#FFFFFF99" }
                  : undefined
              }
            >
              <Icon icon="mdi:seat-outline" className={styles.trustIcon} />
              <span>Limited 2026 Seats</span>
            </div>
            <div
              className={styles.trustBadge}
              style={
                variant === "dark" || variant === "drawer"
                  ? { color: "#FFFFFF99" }
                  : undefined
              }
            >
              <Icon icon="mdi:certificate-outline" className={styles.trustIcon} />
              <span>NAAC Accredited</span>
            </div>
          </motion.div>
        )}

        {/* Consent Text */}
        {showConsent && (
          <motion.div
            custom={showCourseFields ? 8 : 5}
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="caption"
              className={styles.consentText}
              sx={
                variant === "dark" || variant === "drawer"
                  ? { color: "#FFFFFF99 !important" }
                  : undefined
              }
            >
              By submitting, I agree to be contacted by CIT / Assam Digital
              about 2026 B.E. admissions and to the{" "}
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(true)}
                className={styles.privacyLink}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Terms & Conditions and Privacy Policy
              </button>
              .
            </Typography>
          </motion.div>
        )}
      </form>

      {/* Phone Button */}
      {showPhoneButton && (
        <div className={styles.phoneSection}>
          <Typography
            className={styles.orText}
            sx={{ color: "#FFFFFF80 !important" }}
          >
            Or call us directly
          </Typography>
          <a href="tel:+918069645014" className={styles.phoneLink}>
            <Icon icon="mdi:phone" />
            <span>+91 8069645014</span>
          </a>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
};

export default UnifiedLeadForm;
