/* ============================================
   AdmissionProcessSection Component
   How the CIT Merit-Based Selection Program 2026
   works, spelled out end to end so a family knows
   exactly what happens after they apply —
   application, Test Login Key, the merit test,
   tele-counselling and final admission.

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
import {
  TEST_NAME,
  SESSION_LABEL,
  TOTAL_SEATS_LEFT,
} from "../../../data/meritProgram";
import styles from "./AdmissionProcessSection.module.css";

const steps = [
  {
    icon: "mdi:file-document-edit-outline",
    title: "Fill the application form",
    description:
      "Tell us who you are, your 12th marks and your family details — and see the complete fee structure before you submit.",
  },
  {
    icon: "mdi:key-variant",
    title: "Receive your unique Test Login Key",
    description:
      "Your Login Key is shown on screen the moment you submit. Keep it safe — it is what lets you into the test.",
  },
  {
    icon: "mdi:timer-outline",
    title: `Take the ${TEST_NAME}`,
    description:
      "30 MCQs — 15 Maths and 15 Physics at Class-12 level. 60 seconds per question, +4 marks for every correct answer.",
  },
  {
    icon: "mdi:phone-in-talk",
    title: "If you qualify — tele-counselling within 24 hours",
    description:
      "CIT's Counselling Officer calls at the time you choose. Keep your marksheets ready and your parents with you — it takes about 15 minutes.",
  },
  {
    icon: "mdi:seat-outline",
    title: "Final admission",
    description: `Your seat is confirmed against one of the ${TOTAL_SEATS_LEFT} remaining seats for ${SESSION_LABEL}.`,
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
    trackCTAClick(
      "process-apply",
      "admission_process",
      "Apply for the Merit Assessment Test",
    );
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
              Merit-Based Selection
            </span>
            <Typography
              id="admission-process-title"
              variant="h2"
              className={styles.title}
            >
              How the{" "}
              <span className={styles.titleAccent}>Selection Works</span>
            </Typography>
            <Typography className={styles.subtitle}>
              Five steps between you and one of the last {TOTAL_SEATS_LEFT}{" "}
              seats.
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
              <span>Apply for the Merit Assessment Test</span>
            </button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AdmissionProcessSection;
