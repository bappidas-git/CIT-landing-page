/* ============================================
   CTASection Component
   Mid-page CTA band for CIT B.E. 2026
   admission lead capture
   ============================================ */

import React from "react";
import { Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Button from "../../common/Button/Button";
import useApplyCTA from "../../../hooks/useApplyCTA";
import { trackCTAClick } from "../../../utils/gtm";
import styles from "./CTASection.module.css";

const reassurances = [
  {
    text: "We guide you through every step — eligibility, documents, travel and hostel",
    icon: "mdi:compass-outline",
  },
  {
    text: "No consultancy or agent fees — you deal with the college directly",
    icon: "mdi:headset",
  },
  { text: "Hostel support for North-East students", icon: "mdi:home-heart" },
];

const CTASection = () => {
  const applyCTA = useApplyCTA("apply-now", { location: "mid_page_cta" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const handleApplyNow = (event) => {
    trackCTAClick("primary_cta_apply", "mid_page_cta", "Start My Application");
    applyCTA.onClick(event);
  };

  const handleCallClick = () => {
    trackCTAClick("primary_cta_call", "mid_page_cta", "Call CIT");
  };

  return (
    <section id="apply" className={styles.section}>
      {/* Background */}
      <div className={styles.bgOverlay} />
      <div className={styles.bgPattern} />

      <Container maxWidth="lg">
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Typography variant="overline" className={styles.overline}>
              Direct B.E. Admission · 2026 Intake
            </Typography>
            <Typography variant="h3" className={styles.title}>
              Ready to Secure Your{" "}
              <span className={styles.highlight}>B.E. Seat for 2026?</span>
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              Complete the online application and the CIT North-East admission
              desk takes it from there. We guide you through every step —
              eligibility, documents, travel and hostel. 2026 seats are allotted
              in order of completed applications.
            </Typography>
          </motion.div>

          <motion.ul variants={itemVariants} className={styles.reassuranceList}>
            {reassurances.map((item) => (
              <li key={item.text} className={styles.reassuranceItem}>
                <Icon icon={item.icon} className={styles.reassuranceIcon} />
                <span>{item.text}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={itemVariants} className={styles.ctaButtons}>
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
            >
              <Button
                variant="primary"
                size="large"
                endIcon="mdi:arrow-right"
                onClick={handleApplyNow}
                onPointerDown={applyCTA.onPointerDown}
                className={styles.primaryBtn}
              >
                Start My Application
              </Button>
            </motion.div>

            <Button
              variant="outline"
              size="large"
              startIcon="mdi:phone-outline"
              href="tel:+918069645014"
              onClick={handleCallClick}
              className={styles.secondaryBtn}
            >
              Call +91 8069645014
            </Button>
          </motion.div>

          <motion.p variants={itemVariants} className={styles.microCopy}>
            <Icon icon="mdi:shield-check" className={styles.microIcon} />
            NAAC Accredited · AICTE Approved · Affiliated to VTU, Belagavi
          </motion.p>
        </motion.div>
      </Container>

      <div className={styles.cornerDecoration1} />
      <div className={styles.cornerDecoration2} />
    </section>
  );
};

export default CTASection;
