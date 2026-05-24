/* ============================================
   HighlightsSection Component - Results & Procedures
   Showcases before/after results and treatment process
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import styles from "./HighlightsSection.module.css";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Highlights data — before/after results and procedures
const highlightsData = [
  {
    id: 1,
    image:
      "https://res.cloudinary.com/dn9gyaiik/image/upload/v1776923115/Hair_Transplant_tllbkr.png",
    title: "Hair Transplant Results",
    description:
      "Outcomes following FUE/DHI hair transplant procedures, with focus on natural hairline design and appropriate density.",
    bullets: [
      "Natural hairline planning",
      "Donor area preservation",
      "Density based on individual case",
      "Long-term planning approach",
    ],
  },
  {
    id: 2,
    image:
      "https://res.cloudinary.com/dn9gyaiik/image/upload/v1776923115/Beard_transplant_farkrd.png",
    title: "Beard Transplant Results",
    description:
      "Beard restoration procedures designed to improve density and coverage in patchy or sparse areas.",
    bullets: [
      "Custom beard design",
      "Natural direction of growth",
      "Gradual density improvement",
      "Case-based planning",
    ],
  },
  {
    id: 3,
    image:
      "https://res.cloudinary.com/dn9gyaiik/image/upload/v1776847985/How_we_Plan_qhfrxk.png",
    title: "How We Plan Each Procedure",
    description:
      "Each case is evaluated individually to determine suitability, donor availability, and appropriate technique (FUE or DHI).",
    bullets: [
      "Clinical assessment before procedure",
      "Technique selection based on case",
      "Focus on natural appearance",
      "Planning for future hair loss",
    ],
  },
  {
    id: 4,
    image:
      "https://res.cloudinary.com/dn9gyaiik/image/upload/v1776847986/FUE_DHI_hbz0vf.png",
    title: "FUE & DHI Techniques",
    description:
      "Hair transplant procedures performed using established techniques such as Follicular Unit Extraction (FUE) and Direct Hair Implantation (DHI), based on individual assessment.",
    bullets: [
      "Technique selection based on case",
      "Focus on natural hairline design",
      "Graft handling with care",
      "Emphasis on donor area preservation",
    ],
  },
  {
    id: 5,
    image:
      "https://res.cloudinary.com/dn9gyaiik/image/upload/v1775884051/post_up_care_h4wblq.png",
    title: "Post-Procedure Care & Follow-Up",
    description:
      "Structured post-procedure care with guidance on recovery, hair growth cycle, and follow-up support.",
    bullets: [
      "Post-procedure instructions",
      "Scheduled follow-up evaluation",
      "Guidance during recovery phase",
      "Ongoing patient support",
    ],
  },
  {
    id: 6,
    image:
      "https://res.cloudinary.com/dn9gyaiik/image/upload/v1775887560/monjoven-clinic-interior_urbcsh.png",
    title: "Clinical Environment",
    description:
      "Procedures performed in a clean and controlled clinical setting, maintaining standard protocols for hygiene and patient safety.",
    bullets: [
      "Sterile procedure environment",
      "Trained clinical support team",
      "Focus on patient safety",
      "Standard operating protocols",
    ],
  },
];

const HighlightsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openLeadDrawer } = useModal();

  const handleConsultationClick = () => {
    openLeadDrawer("get-details");
  };

  return (
    <section className={styles.resultsSection} id="results" ref={ref}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>OUR RESULTS</span>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.25rem" },
                color: "#1A5276",
                marginTop: "0.75rem",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Real Patients, Real{" "}
              <span className={styles.highlightText}>Outcomes</span>
            </Typography>
            <div className={styles.titleUnderline}>
              <span className={styles.underlineBar} />
            </div>
            <Typography className={styles.sectionSubtitle}>
              Examples of results achieved following hair transplant and
              cosmetic procedures. Outcomes may vary based on individual
              factors.
            </Typography>
          </motion.div>

          {/* Highlight Cards Grid */}
          <motion.div variants={itemVariants} className={styles.highlightsGrid}>
            {highlightsData.map((card, index) => (
              <motion.div
                key={card.id}
                className={styles.highlightCard}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ delay: 0.2 + index * 0.12 }}
              >
                <div className={styles.highlightImageWrap}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className={styles.highlightImage}
                    loading="lazy"
                  />
                </div>
                <div className={styles.highlightContent}>
                  <Typography className={styles.highlightTitle}>
                    {card.title}
                  </Typography>
                  <Typography className={styles.highlightDesc}>
                    {card.description}
                  </Typography>
                  {card.bullets && card.bullets.length > 0 && (
                    <ul className={styles.highlightBullets}>
                      {card.bullets.map((bullet) => (
                        <li key={bullet} className={styles.highlightBulletItem}>
                          <Icon
                            icon="mdi:check-circle"
                            className={styles.highlightBulletIcon}
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Disclaimer Note */}
          <motion.div variants={itemVariants} className={styles.disclaimerNote}>
            <Icon
              icon="mdi:information-outline"
              className={styles.disclaimerIcon}
              aria-hidden="true"
            />
            <Typography className={styles.disclaimerText}>
              All images shown are of treated cases at our clinic. Results may
              vary from patient to patient.
            </Typography>
          </motion.div>

          {/* CTA Banner */}
          <motion.div variants={itemVariants} className={styles.ctaBanner}>
            <div className={styles.ctaBannerContent}>
              <div className={styles.ctaIconWrap}>
                <Icon icon="mdi:calendar-check" />
              </div>
              <div className={styles.ctaTextBlock}>
                <Typography
                  className={styles.ctaHeading}
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  Ready for Your Transformation?
                </Typography>
                <Typography className={styles.ctaDesc} sx={{ color: "#fff" }}>
                  Book a consultation with our specialists and take the first
                  step toward your new look. Personalized treatment plans
                  tailored to your goals.
                </Typography>
              </div>
              <motion.button
                className={styles.ctaButton}
                onClick={handleConsultationClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Book Your Consultation</span>
                <Icon icon="mdi:arrow-right" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default HighlightsSection;
