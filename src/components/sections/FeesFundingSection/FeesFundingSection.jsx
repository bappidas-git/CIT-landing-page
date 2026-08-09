/* ============================================
   FeesFundingSection Component
   Answers the first question every North-East
   family asks — "what will this actually cost,
   and how do we pay for it?" — with a promise of
   written transparency instead of numbers.

   No fee amounts here by design: the complete fee
   structure is shared on the counselling call, so
   only families who apply get it.
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
    title: "No hidden charges",
    description:
      "No capitation fee. No consultancy or agent charges. You pay the college directly, and the complete fee structure — tuition, hostel and mess — is shared in writing on your first counselling call.",
  },
  {
    icon: "mdi:bank-outline",
    title: "Education loan assistance",
    description:
      "CIT's admission desk helps your family with education-loan paperwork from nationalised and private banks, so funding is arranged before you travel.",
  },
  {
    icon: "mdi:school-outline",
    title: "Scholarships & concessions",
    description:
      "Students from the North-East can check their eligibility for state scholarship schemes and institute concessions during counselling.",
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
              Direct admission at CIT means you deal with the college — not
              agents.
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
              Want the full fee structure? Submit your application — our
              counsellor shares it on the very first call.
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
