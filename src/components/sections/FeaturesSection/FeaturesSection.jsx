/* ============================================
   FeaturesSection Component - Campus Life & Recognition
   Tabbed campus/NE-support benefits + awards timeline
   ============================================ */

import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Container, Typography, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import { featuresData } from "../../../data/featuresData";
import styles from "./FeaturesSection.module.css";

// Category icons keyed to featuresData ids
const categoryIcons = {
  1: "mdi:school-outline",
  2: "mdi:briefcase-check-outline",
  3: "mdi:home-heart",
};

// Decorative accent icons per category
const categoryAccentIcons = {
  1: "mdi:lightbulb-on-outline",
  2: "mdi:handshake-outline",
  3: "mdi:account-group-outline",
};

// Awards & recognition timeline (CIT — §6 of master reference)
const awardsTimeline = [
  {
    year: "2016",
    title: "Excellent Engineering Institution",
    detail: "National Education Summit — Rural India",
  },
  {
    year: "2018",
    title: "Most Promising Engineering Institution",
    detail: "Leaders Conclave",
  },
  {
    year: "2019",
    title: "Outstanding & Positive Accomplishment",
    detail: "Academic Insights",
  },
  {
    year: "2021",
    title: "Best College — Global Technocrats",
    detail: "For nurturing rural talents",
  },
  {
    year: "2024",
    title: "Outstanding Contribution",
    detail: "Federation for World Academics, New Delhi",
  },
  {
    year: "2025",
    title: "Best Brand",
    detail: "IIRF, New Delhi — academic performance",
    highlight: true,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeTab, setActiveTab] = useState(featuresData[0]?.id ?? 1);
  const { openLeadDrawer } = useModal();

  const handleApply = () => {
    openLeadDrawer("apply-now");
  };

  const activeCategory =
    featuresData.find((c) => c.id === activeTab) || featuresData[0];

  return (
    <section className={styles.benefitsSection} id="why-us" ref={ref}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Typography
              className={styles.overline}
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", md: "0.85rem" },
                color: "#D82618",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "center",
                marginBottom: "0.5rem",
              }}
            >
              Campus Life & Recognition
            </Typography>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.25rem" },
                color: "#0C2D48",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              A Safe, Supportive Home for{" "}
              <span className={styles.accentText}>North East Students</span>
            </Typography>
            <Typography
              className={styles.sectionSubtitle}
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontSize: { xs: "0.875rem", md: "1.05rem" },
                color: "#546E7A",
                textAlign: "center",
                marginTop: "0.75rem",
              }}
            >
              Hostel, mess, guided admission and an inclusive campus — backed
              by a quarter-century of national recognition.
            </Typography>
          </motion.div>

          {/* Category Tabs - Desktop */}
          <motion.div variants={itemVariants} className={styles.categoryTabs}>
            {featuresData.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${
                  activeTab === category.id ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab(category.id)}
              >
                <Icon
                  icon={categoryIcons[category.id]}
                  className={styles.tabIcon}
                />
                <span className={styles.tabLabel}>{category.category}</span>
                {activeTab === category.id && (
                  <motion.div
                    className={styles.tabIndicator}
                    layoutId="tabIndicator"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </motion.div>

          {/* Benefits Grid - Desktop (tabbed) */}
          <div className={styles.desktopGrid}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className={styles.benefitsGrid}
              >
                {/* Decorative accent icon */}
                <div className={styles.lottieAccent}>
                  <Icon
                    icon={categoryAccentIcons[activeTab]}
                    className={styles.lottiePlayer}
                    style={{ width: "100%", height: "100%", color: "#0C2D48" }}
                  />
                </div>

                {activeCategory.items.map((item, index) => (
                  <motion.div
                    key={item.title}
                    className={styles.benefitCard}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className={styles.benefitIconWrapper}>
                      <Icon icon={item.icon} className={styles.benefitIcon} />
                    </div>
                    <div className={styles.benefitContent}>
                      <h4 className={styles.benefitTitle}>{item.title}</h4>
                      <p className={styles.benefitDescription}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Benefits Grid - Mobile (all categories stacked) */}
          <div className={styles.mobileStack}>
            {featuresData.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className={styles.mobileCategory}
              >
                <div className={styles.mobileCategoryHeader}>
                  <div className={styles.mobileCategoryLottie}>
                    <Icon
                      icon={categoryAccentIcons[category.id]}
                      style={{
                        width: "100%",
                        height: "100%",
                        color: "#0C2D48",
                      }}
                    />
                  </div>
                  <h3 className={styles.mobileCategoryTitle}>
                    {category.category}
                  </h3>
                </div>
                <div className={styles.mobileBenefitsGrid}>
                  {category.items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      className={styles.benefitCard}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <div className={styles.benefitIconWrapper}>
                        <Icon icon={item.icon} className={styles.benefitIcon} />
                      </div>
                      <div className={styles.benefitContent}>
                        <h4 className={styles.benefitTitle}>{item.title}</h4>
                        <p className={styles.benefitDescription}>
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Awards & Recognition Timeline */}
          <motion.div
            variants={itemVariants}
            className={styles.timelineWrapper}
          >
            <div className={styles.timelineHeader}>
              <Icon
                icon="mdi:trophy-award"
                className={styles.timelineHeaderIcon}
              />
              <h3 className={styles.timelineTitle}>
                Awards & Recognition Timeline
              </h3>
            </div>
            <div className={styles.timelineTrack}>
              {awardsTimeline.map((award) => (
                <div
                  key={award.year}
                  className={`${styles.timelineItem} ${
                    award.highlight ? styles.timelineItemHighlight : ""
                  }`}
                >
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineYear}>{award.year}</div>
                  <div className={styles.timelineBody}>
                    <div className={styles.timelineItemTitle}>
                      {award.title}
                    </div>
                    <div className={styles.timelineItemDetail}>
                      {award.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className={styles.ctaWrapper}>
            <Typography
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: { xs: "1.1rem", md: "1.35rem" },
                color: "#0C2D48",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Ready to start your B.E. journey at CIT?
            </Typography>
            <Button
              variant="contained"
              className={styles.ctaButton}
              onClick={handleApply}
              endIcon={<Icon icon="mdi:arrow-right" />}
              sx={{
                background: "linear-gradient(135deg, #E0301E 0%, #B71F12 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: { xs: "0.9rem", md: "1rem" },
                padding: { xs: "12px 28px", md: "14px 36px" },
                borderRadius: "50px",
                textTransform: "none",
                boxShadow: "0 8px 32px rgba(224, 48, 30, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #F0584A 0%, #E0301E 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 14px 40px rgba(224, 48, 30, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Apply for 2026 Admission
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
