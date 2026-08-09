/* ============================================
   WhyChooseCIT Component
   Handles the most common student/parent
   objections about a Karnataka B.E. admission and
   answers them with the CIT Merit Promise, ending
   in a strong "apply for the merit test" CTA band.
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import useApplyCTA from "../../../hooks/useApplyCTA";
import { trackCTAClick } from "../../../utils/gtm";
import { trackContactClick } from "../../../utils/contactTracking";
import {
  TEST_NAME,
  SESSION_LABEL,
  TOTAL_SEATS_LEFT,
} from "../../../data/meritProgram";
import styles from "./WhyChooseCIT.module.css";

const CIT_PHONE_DISPLAY = "+91 8069645014";
const CIT_PHONE_DIAL = "+918069645014";

// Student/parent objections, answered by CIT
const objections = [
  {
    icon: "mdi:restart",
    objection: "Couldn't clear JEE / KCET / COMEDK this year?",
    answer:
      "Dropping a year for coaching costs you a valuable academic year, and still guarantees nothing. CIT's merit-based selection lets talented students prove themselves in a 30-minute online test and start their B.E. now.",
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
  `Every seat filled on merit — one ${TEST_NAME}`,
  `7 B.E. branches, ${TOTAL_SEATS_LEFT} seats left for ${SESSION_LABEL}`,
  "The complete fee structure is shown inside the application, before you submit",
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
  const applyCTA = useApplyCTA("apply-now", { location: "why_choose_cit" });

  const handleApplyNow = (event) => {
    trackCTAClick("why_cit_apply_now", "why_choose_cit", "Start My Application");
    applyCTA.onClick(event);
  };

  const handleCallClick = () => {
    trackCTAClick("why_cit_call", "why_choose_cit", CIT_PHONE_DISPLAY);
    // Distinct dataLayer event (`phone_click`) plus the Meta/Google contact
    // legs — no overlap with the cta_click above, so nothing double-fires.
    trackContactClick("phone", "why_choose_cit", CIT_PHONE_DIAL);
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
              Earn Your B.E. Seat at{" "}
              <span className={styles.titleAccent}>CIT Tumakuru</span>
            </Typography>
            <Typography className={styles.subtitle} sx={{ marginTop: "20px" }}>
              We hear the same questions from students and parents every
              admission season. Here&rsquo;s how CIT answers them for the{" "}
              {SESSION_LABEL} merit-based selection.
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
                  The CIT Merit Promise
                </span>
                <Typography variant="h3" className={styles.bannerTitle}>
                  Selective, Transparent,{" "}
                  <span className={styles.bannerTitleAccent}>
                    Proof-Driven
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
                    {SESSION_LABEL} · {TOTAL_SEATS_LEFT} Seats Left
                  </span>
                  <Typography variant="h4" className={styles.ctaHeadline}>
                    Take the Merit Test. Earn Your Seat.
                  </Typography>

                  <button
                    type="button"
                    className={styles.ctaButton}
                    onClick={handleApplyNow}
                    onPointerDown={applyCTA.onPointerDown}
                  >
                    <Icon
                      icon="mdi:rocket-launch-outline"
                      className={styles.ctaButtonIcon}
                    />
                    <span>Start My Application</span>
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
                      <span>Merit-based selection</span>
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
