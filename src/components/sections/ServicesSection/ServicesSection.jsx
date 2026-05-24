/* ============================================
   ServicesSection Component
   CIT 2026 — Courses Offered (B.E. branches)
   ============================================ */

import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Container,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { servicesData } from "../../../data/servicesData";
import { useModal } from "../../../context/ModalContext";
import {
  injectSchema,
  removeSchema,
  generateServiceSchema,
} from "../../../utils/seo";
import styles from "./ServicesSection.module.css";

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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const badgeIconFor = (badge) => {
  if (badge === "Most Popular") return "mdi:star";
  if (badge === "High Demand") return "mdi:trending-up";
  return "mdi:diamond-stone";
};

const ServicesSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openLeadDrawer } = useModal();

  // Inject Service schema for structured data
  useEffect(() => {
    injectSchema("schema-services", generateServiceSchema(servicesData));
    return () => removeSchema("schema-services");
  }, []);

  const handleApply = (course) => {
    openLeadDrawer("apply-now", {
      subtitle: `Apply for ${course.shortName} — ${course.name}`,
      course: course.name,
      course_interest: course.name,
    });
  };

  const renderCourseCard = (course, index) => (
    <motion.div
      key={course.id}
      className={styles.courseCard}
      custom={index}
      variants={isMobile ? undefined : cardVariants}
      initial={isMobile ? undefined : "hidden"}
      animate={isMobile ? undefined : isInView ? "visible" : "hidden"}
      whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(12, 45, 72, 0.18)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge */}
      {course.badge && (
        <div
          className={`${styles.courseBadge} ${
            course.badge === "Most Popular" ? styles.popularBadge : ""
          }`}
        >
          <Icon icon={badgeIconFor(course.badge)} />
          <span>{course.badge}</span>
        </div>
      )}

      {/* Icon */}
      <div className={styles.courseIconWrapper}>
        <Icon icon={course.icon} className={styles.courseIcon} />
      </div>

      {/* Short Name Chip */}
      <div className={styles.shortNameChip}>{course.shortName}</div>

      {/* Course Name */}
      <Typography className={styles.courseName}>{course.name}</Typography>

      {/* Ideal for */}
      <div className={styles.idealFor}>
        <Icon icon="mdi:bullseye-arrow" />
        <span>
          <strong>Ideal for:</strong> {course.target}
        </span>
      </div>

      {/* Features */}
      <ul className={styles.courseFeatures}>
        {course.features.slice(0, 4).map((feature, idx) => (
          <li key={idx} className={styles.courseFeatureItem}>
            <Icon icon="mdi:check-circle" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <motion.button
        className={styles.courseCtaBtn}
        onClick={() => handleApply(course)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Apply or enquire for ${course.name}`}
      >
        <span>Apply / Enquire</span>
        <Icon icon="mdi:arrow-right" />
      </motion.button>
    </motion.div>
  );

  return (
    <section className={styles.coursesSection} id="courses" ref={ref}>
      {/* Background */}
      <div className={styles.bgOverlay} />
      <div className={styles.bgPattern} />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Chip
              label="Courses Offered"
              sx={{
                backgroundColor: "rgba(216, 38, 24, 0.10)",
                color: "#D82618",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                height: "28px",
                borderRadius: "20px",
                border: "1px solid rgba(216, 38, 24, 0.25)",
              }}
            />
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
              Choose Your{" "}
              <span className={styles.accentText}>B.E. Engineering Branch</span>{" "}
              — 2026 Intake
            </Typography>
            <Typography
              className={styles.sectionSubtitle}
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                color: "#475569",
                textAlign: "center",
                marginTop: "0.5rem",
                maxWidth: "560px",
              }}
            >
              Seven VTU-affiliated B.E. programmes with hands-on labs, strong
              placement record, and end-to-end admission guidance for
              North-East students.
            </Typography>
          </motion.div>

          {/* Course Cards */}
          <motion.div variants={itemVariants}>
            {isMobile ? (
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1.15}
                centeredSlides
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: true }}
                className={styles.swiperContainer}
              >
                {servicesData.map((course, index) => (
                  <SwiperSlide key={course.id}>
                    {renderCourseCard(course, index)}
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className={styles.coursesGrid}>
                {servicesData.map((course, index) =>
                  renderCourseCard(course, index),
                )}
              </div>
            )}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className={styles.bottomCta}>
            <div className={styles.ctaContent}>
              <Icon icon="mdi:headset" className={styles.ctaIcon} />
              <div className={styles.ctaText}>
                <span className={styles.ctaTitle}>
                  Not sure which branch is right for you?
                </span>
                <span className={styles.ctaSubtitle}>
                  Talk to our admission team — we'll help you pick the right
                  B.E. programme.
                </span>
              </div>
            </div>
            <motion.button
              className={styles.ctaBtn}
              onClick={() => openLeadDrawer("get-details")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Talk to Us</span>
              <Icon icon="mdi:arrow-right" />
            </motion.button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default ServicesSection;
