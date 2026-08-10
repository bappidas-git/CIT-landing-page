/* ============================================
   SecondaryCTASection Component
   Closing band before the footer — the last
   chance to enter the CIT Merit-Based Selection
   Program 2026, argued on substance
   (accreditation, placements, hostel) and on the
   real cost of dropping a year.
   ============================================ */

import React from "react";
import { Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import useApplyCTA from "../../../hooks/useApplyCTA";
import { trackCTAClick } from "../../../utils/gtm";
import Button from "../../common/Button/Button";
import {
  PROGRAM_NAME,
  SESSION_LABEL,
  TOTAL_SEATS_LEFT,
} from "../../../data/meritProgram";
import styles from "./SecondaryCTASection.module.css";

const reassurances = [
  {
    text: "NAAC Accredited · AICTE Approved · VTU Affiliated",
    icon: "mdi:shield-check",
  },
  {
    text: "85%+ placements over the last 8 years (90+ recruiters on campus)",
    icon: "mdi:briefcase-check",
  },
  {
    text: "Safe hostel & mess facilities for North-East students",
    icon: "mdi:home-heart",
  },
  {
    text: "One 30-minute online test decides — no agents, no recommendations",
    icon: "mdi:medal-outline",
  },
];

const trustIndicators = [
  { text: "Merit-based selection", icon: "mdi:medal-outline" },
  { text: "Straight to the college", icon: "mdi:school-outline" },
  { text: "Trusted by NE Families", icon: "mdi:account-group" },
];

const SecondaryCTASection = () => {
  const applyCTA = useApplyCTA("apply-now", { location: "secondary_cta" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section id="secondary-cta" className={styles.section}>
      <div className={styles.bgPattern} />

      <Container maxWidth="lg">
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className={styles.gridLayout}>
            {/* Left Column - Text Content */}
            <div className={styles.textColumn}>
              <motion.div
                variants={itemVariants}
                className={styles.badgeWrapper}
              >
                <span className={styles.badge}>
                  <Icon icon="mdi:alarm-light" className={styles.badgeIcon} />
                  {PROGRAM_NAME}
                </span>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h3"
                  className={styles.title}
                  sx={{ color: "#fff" }}
                >
                  Don&rsquo;t Lose{" "}
                  <span className={styles.titleAccent}>
                    an Academic Year
                  </span>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  className={styles.subtitle}
                  sx={{ color: "rgba(255,255,255,0.92)" }}
                >
                  A drop year for coaching costs ₹ lakhs and a full year — with
                  no guaranteed seat. Qualify in CIT&rsquo;s merit test and start
                  your B.E. now. Only {TOTAL_SEATS_LEFT} seats remain for{" "}
                  {SESSION_LABEL}, and every one of them is earned.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <ul className={styles.benefitsList}>
                  {reassurances.map((item) => (
                    <li key={item.text} className={styles.benefitItem}>
                      <Icon icon={item.icon} className={styles.benefitIcon} />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className={styles.ctaGroup}>
                <Button
                  variant="primary"
                  size="large"
                  className={styles.primaryCta}
                  onClick={(event) => {
                    trackCTAClick(
                      "secondary_cta_apply",
                      "secondary_cta",
                      "Start My Application",
                    );
                    applyCTA.onClick(event);
                  }}
                  onPointerDown={applyCTA.onPointerDown}
                >
                  <Icon
                    icon="mdi:school"
                    style={{ marginRight: 8, fontSize: "1.2rem" }}
                  />
                  Start My Application
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className={styles.trustRow}>
                {trustIndicators.map((item) => (
                  <div key={item.text} className={styles.trustItem}>
                    <Icon icon={item.icon} className={styles.trustIcon} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default SecondaryCTASection;
