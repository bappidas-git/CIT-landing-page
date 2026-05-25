/* ============================================
   AboutSection Component
   CIT credibility band: accreditations, legacy & NE-2026 invite
   ============================================ */

import React from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import styles from "./AboutSection.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

const campusImage = {
  src: "https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669894/CIT-Campus_nndyrh.png",
  alt: "CIT Tumakuru campus",
};

const credibilityPoints = [
  {
    icon: "mdi:certificate-outline",
    title: "NAAC · AICTE · VTU · ISO",
    description:
      "Accredited, approved & affiliated — degrees recognised nationwide.",
  },
  {
    icon: "mdi:medal-outline",
    title: "25 Years of Legacy",
    description:
      "Established engineering institute with consistent VTU rank holders.",
  },
  {
    icon: "mdi:briefcase-check-outline",
    title: "85%+ Placement Record",
    description:
      "90+ recruiters every year — Infosys, Accenture, TCS, Deloitte, Bosch.",
  },
  {
    icon: "mdi:lightbulb-on-outline",
    title: "Innovation-First Campus",
    description:
      "Bharat 6G, Drone & BCI R&D labs · 4★ IIC rating · 21 patents filed.",
  },
];

const AboutSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { openLeadDrawer } = useModal();

  return (
    <section className={styles.overviewSection} id="about" ref={ref}>
      <div className={styles.bgGradient} />
      <div className={styles.bgPattern} />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={styles.mainWrapper}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <span className={styles.badge}>ABOUT CIT</span>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.75rem" },
                color: "#0C2D48",
                letterSpacing: "-0.01em",
              }}
            >
              25 Years of Engineering Excellence in Karnataka
            </Typography>
            <Typography
              variant="h3"
              className={styles.sectionSubtitle}
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem" },
                color: "#4b5563",
                marginTop: "0.5rem",
              }}
            >
              Now welcoming North East students for the 2026 B.E. intake
            </Typography>
          </motion.div>

          {/* Content Grid (Text + Campus Image) */}
          <div className={styles.contentGrid}>
            <motion.div variants={itemVariants} className={styles.textColumn}>
              <Typography className={styles.contentParagraph}>
                <strong>Channabasaveshwara Institute of Technology (CIT)</strong>{" "}
                is a NAAC-accredited, AICTE-approved and VTU-affiliated
                engineering institute in <strong>Tumakuru, Karnataka</strong> —
                recognised nationally with the IIRF "Best Brand" 2025 award for
                academic performance.
              </Typography>
              <Typography className={styles.contentParagraph}>
                Known for strong placements, VTU rank holders and rural-inclusive
                engineering education, CIT is now welcoming students from North
                East India for{" "}
                <strong>direct B.E. admission in the 2026 intake</strong>.
              </Typography>
              <Button
                variant="contained"
                onClick={() => openLeadDrawer("apply-now")}
                className={styles.ctaButton}
                endIcon={<Icon icon="mdi:arrow-right" />}
                sx={{
                  background:
                    "linear-gradient(135deg, #E0301E 0%, #B71F12 100%)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: { xs: "0.9375rem", md: "1rem" },
                  padding: { xs: "12px 28px", md: "14px 36px" },
                  borderRadius: "50px",
                  textTransform: "none",
                  boxShadow: "0 8px 30px rgba(224, 48, 30, 0.3)",
                  marginTop: "1rem",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #F0584A 0%, #E0301E 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 14px 40px rgba(224, 48, 30, 0.45)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Apply for 2026 Admission
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className={styles.imageColumn}>
              <motion.div
                className={styles.imageWrapper}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={campusImage.src}
                  alt={campusImage.alt}
                  className={styles.gridImage}
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Credibility Points Row */}
          <motion.div
            variants={itemVariants}
            className={styles.differentiatorsRow}
          >
            <div className={styles.differentiatorsGrid}>
              {credibilityPoints.map((item, index) => (
                <motion.div
                  key={index}
                  className={styles.differentiatorCard}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.differentiatorIcon}>
                    <Icon icon={item.icon} />
                  </div>
                  <h4 className={styles.differentiatorTitle}>{item.title}</h4>
                  <p className={styles.differentiatorDesc}>
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default AboutSection;
