/* ============================================
   ServicesSection Component
   Showcases medical procedure cards
   ============================================ */

import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Container,
  Typography,
  Chip,
  Box,
  Button,
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

  const handleBookConsultation = (serviceName) => {
    openLeadDrawer("get-course-details", {
      subtitle: `Book consultation for ${serviceName}`,
    });
  };

  const renderServiceCard = (service, index) => (
    <motion.div
      key={service.id}
      className={styles.courseCard}
      custom={index}
      variants={isMobile ? undefined : cardVariants}
      initial={isMobile ? undefined : "hidden"}
      animate={isMobile ? undefined : isInView ? "visible" : "hidden"}
      whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(26, 82, 118, 0.15)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge */}
      {service.badge && (
        <div
          className={`${styles.courseBadge} ${
            service.badge === "Premium" ? styles.premiumBadge : ""
          }`}
        >
          <Icon
            icon={
              service.badge === "Most Popular"
                ? "mdi:star"
                : "mdi:diamond-stone"
            }
          />
          <span>{service.badge}</span>
        </div>
      )}

      {/* Icon */}
      <div className={styles.courseIconWrapper}>
        <Icon icon={service.icon} className={styles.courseIcon} />
      </div>

      {/* Service Name */}
      <Typography className={styles.courseName}>{service.name}</Typography>

      {/* Target & Duration */}
      <div className={styles.courseMeta}>
        <div className={styles.metaItem}>
          <Icon icon="mdi:account-check" />
          <span>{service.target}</span>
        </div>
        <div className={styles.metaItem}>
          <Icon icon="mdi:clock-outline" />
          <span>{service.duration}</span>
        </div>
      </div>

      {/* Description */}
      <Typography className={styles.courseDescription}>
        {service.description}
      </Typography>

      {/* Features */}
      <div className={styles.courseFeatures}>
        {service.features.map((feature, idx) => (
          <div key={idx} className={styles.courseFeatureItem}>
            <Icon icon="mdi:check-circle" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Frequency */}
      <div className={styles.courseFrequency}>
        <Icon icon="mdi:calendar-week" />
        <span>{service.frequency}</span>
      </div>

      {/* CTA Button */}
      <motion.button
        className={styles.courseCtaBtn}
        onClick={() => handleBookConsultation(service.name)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Book Consultation</span>
        <Icon icon="mdi:arrow-right" />
      </motion.button>
    </motion.div>
  );

  return (
    <section className={styles.coursesSection} id="services" ref={ref}>
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
              label="Our Services"
              sx={{
                backgroundColor: "rgba(20, 143, 119, 0.12)",
                color: "#148F77",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                height: "28px",
                borderRadius: "20px",
                border: "1px solid rgba(20, 143, 119, 0.3)",
              }}
            />
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
              Advanced Hair &{" "}
              <span className={styles.accentText}>Cosmetic Procedures</span>
            </Typography>
            <Typography
              className={styles.sectionSubtitle}
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                color: "#6B7280",
                textAlign: "center",
                marginTop: "0.5rem",
                maxWidth: "480px",
              }}
            >
              Treatments tailored to your needs, performed by experienced
              specialists using the latest technology
            </Typography>
          </motion.div>

          {/* Service Cards */}
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
                {servicesData.map((service, index) => (
                  <SwiperSlide key={service.id}>
                    {renderServiceCard(service, index)}
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className={styles.coursesGrid}>
                {servicesData.map((service, index) =>
                  renderServiceCard(service, index),
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
                  Not sure which procedure is right for you?
                </span>
                <span className={styles.ctaSubtitle}>
                  Our specialists will help you choose the best treatment
                </span>
              </div>
            </div>
            <motion.button
              className={styles.ctaBtn}
              onClick={() => openLeadDrawer("request-callback")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Book Consultation →</span>
              <Icon icon="mdi:arrow-right" />
            </motion.button>
          </motion.div>

          {/* === Doctor CTA Banner === */}
          <motion.div
            className={styles.foundationBanner}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                borderRadius: "16px",
                padding: { xs: "24px 20px", md: "32px 40px" },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: { xs: 2, md: 3 },
                border: "1px solid #FFE0B2",
                mt: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}
              >
                <Box
                  component="img"
                  src="https://res.cloudinary.com/dn9gyaiik/image/upload/v1775886740/doc-small-photo_rasnle.png"
                  alt="Lead Surgeon"
                  sx={{
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "3px solid #148F77",
                    boxShadow: "0 4px 12px rgba(20, 143, 119, 0.25)",
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "#1B2631",
                      fontSize: { xs: "1rem", md: "1.15rem" },
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    A Message from Our Lead Surgeon
                  </Typography>
                  <Typography
                    sx={{
                      color: "#546E7A",
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                      mt: 0.5,
                    }}
                  >
                    Hair restoration and cosmetic procedures require careful
                    planning and a thorough understanding of individual patient
                    needs. At MONJOVEN, each procedure is approached with
                    clinical evaluation, appropriate technique selection, and a
                    focus on long-term outcomes.
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={() => {
                  const aboutSection = document.getElementById("about");
                  if (aboutSection) {
                    const headerOffset = 80;
                    const elementPosition =
                      aboutSection.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                sx={{
                  background: "linear-gradient(135deg, #148F77, #1ABC9C)",
                  color: "#FFF",
                  fontWeight: 600,
                  borderRadius: "12px",
                  padding: { xs: "10px 24px", md: "12px 32px" },
                  textTransform: "none",
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(20, 143, 119, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1FA89B, #148F77)",
                    boxShadow: "0 6px 20px rgba(20, 143, 119, 0.4)",
                  },
                }}
              >
                Learn More About Us →
              </Button>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default ServicesSection;
