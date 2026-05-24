/* ============================================
   FeaturesSection Component - Why Choose Monjoven
   Tabbed benefits showcase with clinic highlights and CTA
   ============================================ */

import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Container, Typography, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import { featuresData } from "../../../data/featuresData";
import styles from "./FeaturesSection.module.css";

// Category icons (replacing Lottie animations)
const categoryIcons = {
  1: "mdi:chip",
  2: "mdi:hand-heart",
  3: "mdi:star-circle",
};

// Accent icons for decorative display (replacing Lottie)
const categoryAccentIcons = {
  1: "mdi:microscope",
  2: "mdi:shield-check",
  3: "mdi:trophy-outline",
};

// Highlights strip items
const courseHighlights = [
  { icon: "mdi:microscope", label: "Micro-FUE" },
  { icon: "mdi:laser-pointer", label: "Laser Therapy" },
  { icon: "mdi:needle", label: "PRP Therapy" },
  { icon: "mdi:phone-in-talk", label: "24/7 Support" },
  { icon: "mdi:doctor", label: "Expert Surgeon" },
  { icon: "mdi:earth", label: "Global Patients" },
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

  const handleConsultation = () => {
    openLeadDrawer("consultation");
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
                color: "#148F77",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: "center",
                marginBottom: "0.5rem",
              }}
            >
              Why Choose Us
            </Typography>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.25rem" },
                color: "#1A5276",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              The Monjoven <span className={styles.accentText}>Approach</span>
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
              Experience the difference of Northeast India's most trusted hair
              transplant and cosmetic surgery clinic
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
                    style={{ width: "100%", height: "100%", color: "#148F77" }}
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
                        color: "#148F77",
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

          {/* Course Highlights Strip */}
          <motion.div
            variants={itemVariants}
            className={styles.highlightsStrip}
          >
            <div className={styles.highlightsTrack}>
              {courseHighlights.map((item, index) => (
                <div key={index} className={styles.highlightChip}>
                  <Icon icon={item.icon} className={styles.highlightIcon} />
                  <span className={styles.highlightLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Procedures Milestone Highlight */}
          <motion.div variants={itemVariants} className={styles.milestoneWrapper}>
            <div className={styles.milestoneBadge}>
              <Icon icon="mdi:medal-outline" className={styles.milestoneIcon} />
              <span className={styles.milestoneText}>
                <strong>2000+</strong> hair transplant procedures performed
              </span>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className={styles.ctaWrapper}>
            <Typography
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: { xs: "1.1rem", md: "1.35rem" },
                color: "#1A5276",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Ready to transform your look?
            </Typography>
            <Button
              variant="contained"
              className={styles.ctaButton}
              onClick={handleConsultation}
              endIcon={<Icon icon="mdi:arrow-right" />}
              sx={{
                background: "linear-gradient(135deg, #148F77 0%, #1ABC9C 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: "0.9rem", md: "1rem" },
                padding: { xs: "12px 28px", md: "14px 36px" },
                borderRadius: "50px",
                textTransform: "none",
                boxShadow: "0 8px 32px rgba(20, 143, 119, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1ABC9C 0%, #148F77 100%)",
                  boxShadow: "0 12px 40px rgba(20, 143, 119, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Schedule Your Consultation
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
