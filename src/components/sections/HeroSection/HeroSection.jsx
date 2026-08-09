/* ============================================
   HeroSection Component
   Identity + merit-selection hero for the
   CIT Merit-Based Selection Program 2026
   ============================================ */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Chip,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { preloadApply } from "../../../pages/Apply/preload";
import { trackCTAClick } from "../../../utils/gtm";
import { trackContactClick } from "../../../utils/contactTracking";
import { setApplySource } from "../../../hooks/useApplyCTA";
import {
  PROGRAM_NAME,
  TEST_NAME,
  SESSION_LABEL,
  TOTAL_SEATS_LEFT,
} from "../../../data/meritProgram";
import styles from "./HeroSection.module.css";

// Set REACT_APP_HERO_VIDEO_URL in .env to enable hero background video
// Hero images with fallbacks
const HERO_IMAGES = {
  desktop: [
    "https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669894/CIT-Campus_nndyrh.png",
  ],
  mobile: [
    "https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669894/CIT-Campus_nndyrh.png",
  ],
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Headline placement & outcome stats — all verified, already on the site.
const proofChips = [
  { icon: "mdi:briefcase-check-outline", text: "85%+ Placements" },
  { icon: "mdi:office-building-outline", text: "90+ Recruiters" },
  { icon: "mdi:trending-up", text: "Highest CTC 15 LPA" },
];

// Institutional recognitions — verified against existing site content and
// the resources/Info-*.jpeg posters. Do not add unverified credentials.
const recognitions = [
  { icon: "mdi:certificate-outline", text: "NAAC Accredited" },
  { icon: "mdi:check-decagram-outline", text: "Approved by AICTE, New Delhi" },
  { icon: "mdi:school-outline", text: "Affiliated to VTU, Belagavi" },
  { icon: "mdi:shield-check-outline", text: "ISO 9001:2015" },
  { icon: "mdi:calendar-star", text: "25 Years of Excellence" },
  { icon: "mdi:star-circle-outline", text: "4★ IIC Rating (MHRD)" },
  { icon: "mdi:trophy-outline", text: 'IIRF "Best Brand" 2025' },
];

// How the merit selection works — condensed; the full section explains each
// stage in detail further down the page.
const selectionSteps = [
  "Apply online",
  "Get your Test Login Key",
  "Take the 30-minute test",
  "Qualify — tele-counselling within 24 hours",
  `Final admission against one of the ${TOTAL_SEATS_LEFT} seats`,
];

const HeroSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();

  // Fallback image state
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Try loading fallback images in order
  useEffect(() => {
    const images = isMobile ? HERO_IMAGES.mobile : HERO_IMAGES.desktop;
    let cancelled = false;

    const tryLoadImage = async () => {
      for (const url of images) {
        if (cancelled) return;
        try {
          const loaded = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            setTimeout(() => resolve(false), 5000);
          });
          if (loaded && !cancelled) {
            setHeroImageUrl(url);
            setImageLoaded(true);
            return;
          }
        } catch {
          continue;
        }
      }
      console.warn("All hero images failed to load, using gradient fallback");
    };

    tryLoadImage();
    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  // Every hero CTA goes to the full application — no drawer, no short form.
  const handleStartApplication = (ctaName) => {
    trackCTAClick(ctaName, "hero", "Apply for the Merit Assessment Test");
    // Keep the hero's own cta_name (live GTM reporting depends on it) but use
    // the shared source stash, or every lead from the highest-volume CTA on
    // the page records itself as 'apply-direct'.
    setApplySource("apply-now");
    navigate("/apply");
  };

  return (
    <section className={styles.heroSection} id="home">
      {/* === Background Layer 1: Gradient fallback (always present) === */}
      <div className={styles.heroBgGradient} />

      {/* === Background Layer 2: Fallback image === */}
      {imageLoaded && (
        <div
          className={styles.heroBgImage}
          style={{ backgroundImage: `url('${heroImageUrl}')` }}
        />
      )}

      {/* === Dark overlay for text readability === */}
      <div className={styles.heroOverlay} />

      {/* Animated Background Pattern */}
      <div className={styles.patternOverlay} />

      {/* Main Content */}
      <Container maxWidth="xl" className={styles.heroContainer}>
        <Grid container spacing={isMobile ? 3 : 6} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} lg={7}>
            <motion.div
              className={styles.heroContent}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Pre-headline Badge */}
              <motion.div variants={badgeVariants}>
                <Chip
                  icon={<span className={styles.pulseDot} />}
                  label={`${SESSION_LABEL} — Final Admission Closure`}
                  className={styles.launchBadge}
                  sx={{
                    backgroundColor: "#0C2D48",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    height: "36px",
                    borderRadius: "20px",
                    "& .MuiChip-icon": {
                      marginLeft: "8px",
                    },
                  }}
                />
              </motion.div>

              {/* Identity Headline */}
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h1"
                  className={styles.heroTitle}
                  sx={{
                    color: "#FFFFFF",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: {
                      xs: "1.9rem",
                      sm: "2.4rem",
                      md: "2.85rem",
                      lg: "3.1rem",
                    },
                    lineHeight: 1.15,
                    marginTop: "1.5rem",
                  }}
                >
                  CIT Engineering College, Near Bengaluru —
                  <span className={styles.orangeText}>
                    {" "}
                    One of the Finest &amp; Top Engineering Colleges in
                    Karnataka
                  </span>
                </Typography>
                <Typography
                  component="p"
                  className={styles.collegeFullName}
                  sx={{
                    color: "rgba(255, 255, 255, 0.92)",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: { xs: "0.9375rem", md: "1.0625rem" },
                    marginTop: "0.875rem",
                  }}
                >
                  Channabasaveshwara Institute of Technology (CIT), Tumakuru
                </Typography>
              </motion.div>

              {/* Location Strip + Disambiguation */}
              <motion.div variants={itemVariants}>
                <div className={styles.locationStrip}>
                  <span className={styles.locationBadge}>
                    <Icon
                      icon="mdi:map-marker"
                      className={styles.locationIcon}
                    />
                    Tumakuru, Karnataka
                  </span>
                  <span className={styles.locationBadge}>
                    <Icon icon="mdi:highway" className={styles.locationIcon} />
                    ~70 km from Bengaluru
                  </span>
                  <span className={styles.locationBadge}>
                    <Icon
                      icon="mdi:road-variant"
                      className={styles.locationIcon}
                    />
                    NH-206
                  </span>
                </div>
                <p className={styles.locationClarifier}>
                  This is CIT Tumakuru, Karnataka — not CIT Kokrajhar, Assam.
                </p>
              </motion.div>

              {/* Scarcity + Merit Message */}
              <motion.div variants={itemVariants}>
                <div className={styles.meritBlock}>
                  <p className={styles.meritHeadline}>
                    <Icon
                      icon="mdi:seat-outline"
                      className={styles.meritIcon}
                    />
                    Only {TOTAL_SEATS_LEFT} seats remain across 7 B.E. branches.
                  </p>
                  <p className={styles.meritBody}>
                    To fill them with talented students on merit, CIT is
                    conducting a <strong>{TEST_NAME}</strong> — the{" "}
                    <strong>{PROGRAM_NAME}</strong>.
                  </p>
                </div>
                <p className={styles.secondChance}>
                  Couldn&apos;t clear JEE / KCET / COMEDK this year? Prove your
                  merit and start your engineering journey now — without losing
                  another academic year.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={buttonVariants}
                className={styles.ctaButtons}
              >
                <Button
                  variant="contained"
                  size="large"
                  className={styles.primaryCta}
                  onClick={() => handleStartApplication("hero-apply")}
                  onPointerDown={preloadApply}
                  sx={{
                    backgroundColor: "#E0301E",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "1rem",
                    padding: "0.875rem 2rem",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontFamily: "'Poppins', sans-serif",
                    boxShadow: "0 4px 20px rgba(224, 48, 30, 0.45)",
                    "&:hover": {
                      backgroundColor: "#B71F12",
                      color: "#FFFFFF",
                      boxShadow: "0 8px 28px rgba(224, 48, 30, 0.6)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Apply for the Merit Assessment Test →
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  className={styles.secondaryCta}
                  component="a"
                  href="tel:+918069645014"
                  onClick={() => {
                    trackCTAClick(
                      "hero_secondary_cta",
                      "hero",
                      "Call +91 8069645014"
                    );
                    trackContactClick("phone", "hero");
                  }}
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.6)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "0.875rem 2rem",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontFamily: "'Poppins', sans-serif",
                    borderWidth: "2px",
                    "&:hover": {
                      borderColor: "#FFFFFF",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderWidth: "2px",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Call +91 8069645014
                </Button>
              </motion.div>

              {/* Placement Proof Chips */}
              <motion.div variants={itemVariants} className={styles.proofChips}>
                {proofChips.map((chip) => (
                  <span key={chip.text} className={styles.proofChip}>
                    <Icon icon={chip.icon} className={styles.proofIcon} />
                    {chip.text}
                  </span>
                ))}
              </motion.div>

              {/* Recognitions Strip */}
              <motion.div
                variants={itemVariants}
                className={styles.trustIndicators}
              >
                {recognitions.map((indicator) => (
                  <div key={indicator.text} className={styles.trustIndicator}>
                    <Icon icon={indicator.icon} className={styles.trustIcon} />
                    <span>{indicator.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </Grid>

          {/* Right Content - Selection Summary Card (Desktop only) */}
          {isDesktop && (
            <Grid item lg={5}>
              <motion.div
                className={styles.formWrapper}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              >
                <div className={styles.formCard}>
                  <div className={styles.formHeader}>
                    <Typography
                      variant="h5"
                      sx={{
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                        textAlign: "center",
                        fontSize: "1.25rem",
                      }}
                    >
                      How Selection Works
                    </Typography>
                  </div>
                  <div className={styles.formBody}>
                    <ul className={styles.checklist}>
                      {selectionSteps.map((item, index) => (
                        <li key={item} className={styles.checklistItem}>
                          <span className={styles.stepNumber}>{index + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className={styles.checklistCta}
                      onClick={() => handleStartApplication("hero-card-apply")}
                      onPointerDown={preloadApply}
                    >
                      Apply for the Merit Assessment Test
                    </button>

                    <p className={styles.checklistNote}>
                      Seats are offered on merit only — qualify the test to earn
                      your admission.
                    </p>
                  </div>
                </div>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Scroll Indicator */}
      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon icon="mdi:chevron-double-down" className={styles.scrollIcon} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
