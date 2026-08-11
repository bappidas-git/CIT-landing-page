/* ============================================
   FeesFundingSection Component
   Answers the first question every
   family asks — "what will this actually cost,
   and how do we pay for it?" — with a promise of
   written transparency instead of numbers.

   No fee amounts here by design: the complete
   year-wise structure is shown inside the
   application form itself (Step 5), before the
   applicant submits — so only families who apply
   see the numbers.
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { preloadApply } from "../../../pages/Apply/preload";
import { trackCTAClick } from "../../../utils/gtm";
import { setApplySource } from "../../../hooks/useApplyCTA";
import styles from "./FeesFundingSection.module.css";

const fundingCards = [
  {
    icon: "mdi:shield-check",
    title: "You see the fees before you submit",
    description:
      "The complete year-wise fee structure for all 7 branches — tuition, admission fee, extra fees and hostel — is shown inside the application form itself, before you submit. No capitation fee, no consultancy or agent charges. You pay the college directly.",
  },
  {
    icon: "mdi:bank-outline",
    title: "Education loan guidance",
    description:
      "For qualified students, an education loan in the student's own name can cover about 80% of the total study cost including hostel, repaid after placement. CIT's team walks your family through it on the tele-counselling call.",
  },
  {
    icon: "mdi:school-outline",
    title: "Scholarships & concessions",
    description:
      "State scholarship schemes and institute concessions you may be eligible for are discussed on your qualification call, once your branch and category are confirmed.",
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

const FeesFundingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();

  const handleApplyClick = () => {
    trackCTAClick("fees-apply", "fees_funding", "Start My Application");
    setApplySource("apply-now");
    navigate("/apply");
  };

  return (
    <section
      id="fees"
      className={styles.section}
      ref={ref}
      aria-labelledby="fees-funding-title"
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
              <Icon icon="mdi:cash-check" className={styles.badgeIcon} />
              Fees &amp; Funding
            </span>
            <Typography
              id="fees-funding-title"
              variant="h2"
              className={styles.title}
            >
              Transparent Fees.{" "}
              <span className={styles.titleAccent}>Real Funding Support.</span>
            </Typography>
            <Typography className={styles.subtitle}>
              You deal with the college, not agents — and you see every number
              before you submit.
            </Typography>
          </motion.div>

          {/* Funding Cards */}
          <div className={styles.cardsGrid}>
            {fundingCards.map((card, index) => (
              <motion.article
                key={card.title}
                className={styles.card}
                custom={index}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className={styles.cardIconWrap}>
                  <Icon icon={card.icon} className={styles.cardIcon} />
                </div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>{card.description}</p>
              </motion.article>
            ))}
          </div>

          {/* Closing Band */}
          <motion.div variants={itemVariants} className={styles.closingBand}>
            <p className={styles.closingText}>
              Want the full fee structure? Start your application — every
              branch&rsquo;s year-wise fees are laid out inside it, before you
              submit.
            </p>
            <button
              type="button"
              className={styles.closingButton}
              onClick={handleApplyClick}
              onPointerDown={preloadApply}
            >
              <Icon
                icon="mdi:file-document-edit-outline"
                className={styles.closingButtonIcon}
              />
              <span>Start My Application</span>
            </button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default FeesFundingSection;
