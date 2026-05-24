/* ============================================
   HighlightsSection — Infrastructure & Innovation
   Compact icon cards showcasing CIT labs & R&D
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import styles from "./HighlightsSection.module.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

const highlightsData = [
  {
    id: 1,
    icon: "mdi:monitor-dashboard",
    title: "ICT-Enabled Smart Classrooms",
    line: "State-of-the-art computing facilities for modern, interactive learning.",
  },
  {
    id: 2,
    icon: "mdi:rocket-launch-outline",
    title: "Centre for Creativity & Incubation",
    line: "Start-up incubation supported by an on-campus data centre & private cloud.",
  },
  {
    id: 3,
    icon: "mdi:radio-tower",
    title: "IOS-MCN R&D — Bharat 6G Labs",
    line: "Next-generation wireless research in collaboration with Bharat 6G Labs.",
  },
  {
    id: 4,
    icon: "mdi:quadcopter",
    title: "Aero-Vision Drone Lab",
    line: "AICTE-sponsored Centre of Excellence for drone design & applications.",
  },
  {
    id: 5,
    icon: "mdi:brain",
    title: "BCI, IoT & Embedded R&D",
    line: "Brain-Computer Interface, IoT and Embedded Systems research labs.",
  },
  {
    id: 6,
    icon: "mdi:star-circle",
    title: "4-Star IIC Rating (MHRD)",
    line: "Awarded by the Institution's Innovation Council for AY 2024-25.",
  },
  {
    id: 7,
    icon: "mdi:certificate-outline",
    title: "21 Patents · ₹2 Cr Research Grants",
    line: "Active patent filings and sponsored research driving real innovation.",
  },
  {
    id: 8,
    icon: "mdi:briefcase-search-outline",
    title: "Industry Internships & Projects",
    line: "Project-based learning and internships in cutting-edge technology.",
  },
];

const HighlightsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className={styles.resultsSection} id="campus" ref={ref}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>INFRASTRUCTURE & INNOVATION</span>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.25rem" },
                color: "#0C2D48",
                marginTop: "0.75rem",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Learn on a{" "}
              <span className={styles.highlightText}>Future-Ready Campus</span>
            </Typography>
            <div className={styles.titleUnderline}>
              <span className={styles.underlineBar} />
            </div>
            <Typography className={styles.sectionSubtitle}>
              Modern classrooms, advanced research labs and an innovation-first
              ecosystem — built so engineers graduate work-ready.
            </Typography>
          </motion.div>

          {/* Highlight Cards Grid */}
          <motion.div variants={itemVariants} className={styles.highlightsGrid}>
            {highlightsData.map((card, index) => (
              <motion.div
                key={card.id}
                className={styles.highlightCard}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                initial={{ opacity: 0, y: 24 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                }
                transition={{ delay: 0.15 + index * 0.07 }}
              >
                <div className={styles.iconWrap}>
                  <Icon
                    icon={card.icon}
                    className={styles.cardIcon}
                    aria-hidden="true"
                  />
                </div>
                <div className={styles.highlightContent}>
                  <Typography className={styles.highlightTitle}>
                    {card.title}
                  </Typography>
                  <Typography className={styles.highlightDesc}>
                    {card.line}
                  </Typography>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default HighlightsSection;
