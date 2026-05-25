/* ============================================
   WhyChooseCIT Component
   Handles the most common North-East student/parent
   objections about a Karnataka B.E. admission and
   answers them with CIT's direct-admission promise,
   ending in a strong "Apply for 2026" CTA band.
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import { trackCTAClick } from "../../../utils/gtm";
import styles from "./WhyChooseCIT.module.css";

const CIT_PHONE_DISPLAY = "+91 8069645014";
const CIT_PHONE_DIAL = "+918069645014";

// NE student/parent objections, answered by CIT
const objections = [
  {
    icon: "mdi:help-network-outline",
    objection: "Confused by Karnataka CET / COMED-K counselling?",
    answer:
      "CIT offers a guided direct B.E. admission pathway for the 2026 intake — no confusing counselling trips, simple paperwork, and support at every step from our NE admissions desk.",
  },
  {
    icon: "mdi:home-heart",
    objection: "Worried about your child being far from home?",
    answer:
      "Safe on-campus hostel and mess, a supportive and inclusive culture, and dedicated help settling in — a real home away from home for students from across the North East.",
  },
  {
    icon: "mdi:school-outline",
    objection: "Will the degree and placements really be worth it?",
    answer:
      "A NAAC-accredited, AICTE-approved, VTU-affiliated B.E. degree with 85%+ placements and 90+ recruiters every year, including Accenture, Infosys, Deloitte and TCS.",
  },
];

// Reassurance bullets shown on the CTA band
const reassurancePoints = [
  "End-to-end direct B.E. admission guidance for the 2026 intake",
  "Limited 2026 seats across 7 B.E. branches — apply early",
  "NAAC accredited, AICTE approved, affiliated to VTU Belagavi",
  "85%+ placements with 90+ recruiters visiting the campus",
  "Safe hostel & mess facilities for North East students",
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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const WhyChooseCIT = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openLeadDrawer } = useModal();

  const handleApplyNow = () => {
    trackCTAClick("why_cit_apply_now", "why_choose_cit", "Apply for 2026 Admission");
    openLeadDrawer("apply-now");
  };

  const handleCallClick = () => {
    trackCTAClick("why_cit_call", "why_choose_cit", CIT_PHONE_DISPLAY);
  };

  return (
    <section
      id="why-choose-cit"
      className={styles.section}
      ref={ref}
      aria-labelledby="why-cit-title"
    >
      {/* Decorative background */}
      <div className={styles.bgDecor} aria-hidden="true" />
      <div className={styles.bgGlowOne} aria-hidden="true" />
      <div className={styles.bgGlowTwo} aria-hidden="true" />

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
              <Icon
                icon="mdi:star-four-points-circle"
                className={styles.badgeIcon}
              />
              Why Choose CIT
            </span>
            <Typography
              id="why-cit-title"
              variant="h2"
              className={styles.title}
            >
              Your Direct Path to a B.E. at{" "}
              <span className={styles.titleAccent}>CIT Tumakuru</span>
            </Typography>
            <Typography className={styles.subtitle} sx={{ marginTop: "20px" }}>
              We hear the same questions from students and parents across the
              North East every admission season. Here&rsquo;s how CIT answers them
              for the 2026 B.E. direct-admission intake.
            </Typography>
          </motion.div>

          {/* Objection Cards */}
          <div className={styles.reasonsGrid}>
            {objections.map((item, index) => (
              <motion.article
                key={item.objection}
                className={styles.reasonCard}
                custom={index}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className={styles.reasonIconWrap}>
                  <Icon icon={item.icon} className={styles.reasonIcon} />
                  <span className={styles.reasonNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className={styles.reasonTitle}>{item.objection}</h3>
                <p className={styles.reasonDescription}>{item.answer}</p>
              </motion.article>
            ))}
          </div>

          {/* Reassurance + CTA Banner */}
          <motion.div variants={itemVariants} className={styles.ctaBanner}>
            <div className={styles.bannerGrid}>
              {/* Left — reassurance copy */}
              <div className={styles.bannerLeft}>
                <span className={styles.bannerBadge}>
                  <Icon
                    icon="mdi:shield-check"
                    className={styles.bannerBadgeIcon}
                  />
                  The CIT Direct-Admission Promise
                </span>
                <Typography variant="h3" className={styles.bannerTitle}>
                  Guided B.E. Admission for the{" "}
                  <span className={styles.bannerTitleAccent}>
                    2026 Intake
                  </span>
                </Typography>

                <ul className={styles.reassuranceList}>
                  {reassurancePoints.map((point) => (
                    <li key={point} className={styles.reassuranceItem}>
                      <Icon
                        icon="mdi:check-decagram"
                        className={styles.reassuranceIcon}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — CTA card */}
              <div className={styles.bannerRight}>
                <div className={styles.ctaCard}>
                  <span className={styles.ctaLabel}>
                    Limited Seats · 2026 Intake
                  </span>
                  <Typography variant="h4" className={styles.ctaHeadline}>
                    Talk to the CIT NE Admissions Desk
                  </Typography>

                  <button
                    type="button"
                    className={styles.ctaButton}
                    onClick={handleApplyNow}
                  >
                    <Icon
                      icon="mdi:rocket-launch-outline"
                      className={styles.ctaButtonIcon}
                    />
                    <span>Apply for 2026 Admission</span>
                  </button>

                  <a
                    href={`tel:${CIT_PHONE_DIAL}`}
                    className={styles.callLink}
                    onClick={handleCallClick}
                  >
                    <Icon icon="mdi:phone-in-talk" className={styles.callIcon} />
                    <span>
                      Or call <strong>{CIT_PHONE_DISPLAY}</strong>
                    </span>
                  </a>

                  <div className={styles.trustRow}>
                    <div className={styles.trustItem}>
                      <Icon icon="mdi:certificate" />
                      <span>NAAC Accredited</span>
                    </div>
                    <div className={styles.trustItem}>
                      <Icon icon="mdi:account-tie" />
                      <span>Free Admission Guidance</span>
                    </div>
                  </div>

                  <span className={styles.ctaDisclaimer}>
                    Affiliated to VTU Belagavi · Approved by AICTE, New Delhi
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default WhyChooseCIT;
