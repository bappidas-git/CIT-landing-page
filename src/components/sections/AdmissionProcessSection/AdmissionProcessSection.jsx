/* ============================================
   AdmissionProcessSection Component
   The admission journey, spelled out end to end
   so a family knows exactly what happens after
   they apply — application, eligibility call,
   seat confirmation, travel and hostel.

   Reads as a vertical timeline on mobile and a
   horizontal one from tablet up.
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import EligibilityStrip from "../../common/EligibilityStrip";
import { preloadApply } from "../../../pages/Apply/preload";
import { trackCTAClick } from "../../../utils/gtm";
import { setApplySource } from "../../../hooks/useApplyCTA";
import styles from "./AdmissionProcessSection.module.css";

const steps = [
  {
    icon: "mdi:file-document-edit-outline",
    title: "Apply online (3 minutes)",
    description:
      "Fill the application with your 10th & 12th details. You get an instant VTU eligibility check.",
  },
  {
    icon: "mdi:phone-in-talk",
    title: "Eligibility & counselling call",
    description:
      "CIT's NE admission desk calls within 24 hours, confirms eligibility, and shares the complete fee structure and document checklist (10th & 12th marksheets, transfer certificate, ID).",
  },
  {
    icon: "mdi:seat-outline",
    title: "Seat confirmation",
    description:
      "Complete the admission formalities and receive your provisional admission letter for the 2026 intake.",
  },
  {
    icon: "mdi:bag-suitcase-outline",
    title: "Travel & hostel onboarding",
    description:
      "The NE desk helps plan your journey via Bengaluru and allots your hostel room before you arrive.",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const AdmissionProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();

  const handleApplyClick = () => {
    trackCTAClick("process-apply", "admission_process", "Start Step 1 Now");
    setApplySource("apply-now");
    navigate("/apply");
  };

  return (
    <section
      id="admission-process"
      className={styles.section}
      ref={ref}
      aria-labelledby="admission-process-title"
    >
      <div className={styles.bgDecor} aria-hidden="true" />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={styles.wrapper}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.header}>
            <span className={styles.badge}>
              <Icon icon="mdi:map-marker-path" className={styles.badgeIcon} />
              How It Works
            </span>
            <Typography
              id="admission-process-title"
              variant="h2"
              className={styles.title}
            >
              Your Admission in{" "}
              <span className={styles.titleAccent}>4 Clear Steps</span>
            </Typography>
            <Typography className={styles.subtitle}>
              From online application to your first day on campus — guided at
              every step.
            </Typography>
          </motion.div>

          {/* Timeline */}
          <ol className={styles.timeline}>
            {steps.map((step, index) => (
              <motion.li
                key={step.title}
                className={styles.step}
                custom={index}
                variants={stepVariants}
              >
                <div className={styles.stepMarker}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepConnector} aria-hidden="true" />
                </div>
                <div className={styles.stepBody}>
                  <Icon icon={step.icon} className={styles.stepIcon} />
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          {/* Eligibility note */}
          <motion.div variants={itemVariants} className={styles.eligibilityWrap}>
            <EligibilityStrip />
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className={styles.ctaWrap}>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={handleApplyClick}
              onPointerDown={preloadApply}
            >
              <Icon
                icon="mdi:rocket-launch-outline"
                className={styles.ctaButtonIcon}
              />
              <span>Start Step 1 Now</span>
            </button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AdmissionProcessSection;
