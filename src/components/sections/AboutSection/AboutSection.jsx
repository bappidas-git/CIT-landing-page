/* ============================================
   AboutSection Component
   About section with stats, content grid & differentiators
   ============================================ */

import React from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import AnimatedCounter from "../../common/AnimatedCounter/AnimatedCounter";
import { useModal } from "../../../context/ModalContext";
import styles from "./AboutSection.module.css";

// Animation variants
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

// Stats data
const keyStats = [
  {
    value: "15",
    suffix: "+",
    label: "Years Experience",
    icon: "mdi:trophy-award",
    color: "#148F77",
  },
  {
    value: "5000",
    suffix: "+",
    label: "Successful Procedures",
    icon: "mdi:check-decagram",
    color: "#1A5276",
  },
  {
    value: "98",
    suffix: "%",
    label: "Patient Satisfaction",
    icon: "mdi:heart-pulse",
    color: "#148F77",
  },
  {
    value: "8",
    suffix: "",
    label: "NE States Served",
    icon: "mdi:map-marker-multiple",
    color: "#1A5276",
  },
];

// Doctor profile data
const doctorProfile = {
  image:
    "https://res.cloudinary.com/dn9gyaiik/image/upload/v1775884050/Dr._Image_Porag_neong_pyergn.png",
  name: "Dr. Porag Neog",
  credentials: "MBBS, MS (General Surgery), FAM",
  specialization: "Plastic, Reconstructive & Hair Transplant Surgeon",
  roles: [
    {
      icon: "mdi:medical-bag",
      label: "Founder",
      detail: "MONJOVEN Hair Transplant & Cosmetic Surgery Clinic",
    },
    {
      icon: "mdi:hospital-building",
      label: "Consultant",
      detail:
        "Burns, Plastic & Maxillofacial Surgery, Hayat Hospital, Guwahati",
    },
  ],
};

// Clinic image
const clinicImage = {
  src: "https://res.cloudinary.com/dn9gyaiik/image/upload/v1775887560/monjoven-clinic-interior_urbcsh.png",
  alt: "Monjoven Clinic Interior",
};

// Key differentiators data
const differentiators = [
  {
    icon: "mdi:medal-outline",
    title: "25+ Years of Surgical Experience",
    description:
      "Over 25+ years of experience in plastic, reconstructive and aesthetic surgery, with more than a decade of experience in hair transplant procedures.",
  },
  {
    icon: "mdi:microscope",
    title: "Advanced FUE & DHI Techniques",
    description:
      "Hair transplant procedures performed using established techniques such as Follicular Unit Extraction (FUE) and Direct Hair Implantation (DHI), depending on individual patient requirements.",
  },
  {
    icon: "mdi:account-group",
    title: "Focus on Natural-Looking Outcomes",
    description:
      "Treatment approach focused on achieving natural hairline design and density, tailored to individual patient characteristics.",
  },
  {
    icon: "mdi:earth",
    title: "Patients from Across India & Abroad",
    description:
      "Patients from Northeast India as well as international locations including the USA, UK, Canada, Middle East, Bhutan and Nepal.",
  },
];

const AboutSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { openLeadDrawer } = useModal();

  return (
    <section className={styles.overviewSection} id="about" ref={ref}>
      {/* Background Elements */}
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
            <span className={styles.badge}>ABOUT MONJOVEN</span>
            <Typography
              variant="h2"
              className={styles.sectionTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem", md: "2.75rem" },
                color: "#1A5276",
                letterSpacing: "-0.01em",
              }}
            >
              Northeast India's First Dedicated Hair Transplant Clinic
            </Typography>
            <Typography
              variant="h3"
              className={styles.sectionSubtitle}
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem" },
                color: "#6b7280",
                marginTop: "0.5rem",
              }}
            >
              Restoring Youthfulness & Confidence Since 2012
            </Typography>
          </motion.div>

          {/* Stats Counter Row */}
          <motion.div variants={itemVariants} className={styles.statsRow}>
            {keyStats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statItem}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon icon={stat.icon} style={{ color: stat.color }} />
                </div>
                <div className={styles.statValue}>
                  <AnimatedCounter
                    value={stat.value}
                    duration={1.5}
                    delay={0.2 + index * 0.1}
                  />
                  {stat.suffix && (
                    <span className={styles.statSuffix}>{stat.suffix}</span>
                  )}
                </div>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Content Grid (2 columns desktop, 1 column mobile) */}
          <div className={styles.contentGrid}>
            {/* Left Column - Text */}
            <motion.div variants={itemVariants} className={styles.textColumn}>
              <Typography className={styles.contentParagraph}>
                Founded in 2012 by Dr. Porag Neog (MBBS, MS), Monjoven is
                Northeast India's first dedicated clinic for hair loss solutions
                and hair transplant. The name "Monjoven" means "My Youth" —
                reflecting our mission to restore youthfulness and confidence in
                every patient who walks through our doors.
              </Typography>
              <Typography className={styles.contentParagraph}>
                With over a decade of pioneering excellence in hair transplants
                and cosmetic surgery, Monjoven delivers international-standard
                results using advanced micro-FUE technology. Our patients travel
                from across India and internationally — from the US, Canada, UK,
                Norway, Saudi Arabia, France, Dubai, Bhutan, and Nepal —
                trusting us with their transformation journey.
              </Typography>
              <Button
                variant="contained"
                onClick={() => openLeadDrawer("apply-now")}
                className={styles.ctaButton}
                endIcon={<Icon icon="mdi:arrow-right" />}
                sx={{
                  background:
                    "linear-gradient(135deg, #148F77 0%, #1ABC9C 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: { xs: "0.9375rem", md: "1rem" },
                  padding: { xs: "12px 28px", md: "14px 36px" },
                  borderRadius: "50px",
                  textTransform: "none",
                  boxShadow: "0 8px 30px rgba(20, 143, 119, 0.3)",
                  marginTop: "1.5rem",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1ABC9C 0%, #148F77 100%)",
                    boxShadow: "0 12px 40px rgba(20, 143, 119, 0.45)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Book Consultation
              </Button>
            </motion.div>

            {/* Right Column - Doctor Profile & Clinic Image */}
            <motion.div variants={itemVariants} className={styles.imageColumn}>
              <motion.div
                className={styles.doctorCard}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.doctorImageWrapper}>
                  <img
                    src={doctorProfile.image}
                    alt={doctorProfile.name}
                    className={styles.doctorImage}
                    loading="lazy"
                  />
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>{doctorProfile.name}</h3>
                  <span className={styles.doctorCredentials}>
                    {doctorProfile.credentials}
                  </span>
                  <span className={styles.doctorSpecialization}>
                    {doctorProfile.specialization}
                  </span>
                  <ul className={styles.doctorRoles}>
                    {doctorProfile.roles.map((role, index) => (
                      <li key={index} className={styles.doctorRoleItem}>
                        <span className={styles.doctorRoleIcon}>
                          <Icon icon={role.icon} />
                        </span>
                        <span className={styles.doctorRoleText}>
                          <strong>{role.label}</strong>
                          <span className={styles.doctorRoleDetail}>
                            {role.detail}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
              <motion.div
                className={styles.imageWrapper}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={clinicImage.src}
                  alt={clinicImage.alt}
                  className={styles.gridImage}
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Key Differentiators Row */}
          <motion.div
            variants={itemVariants}
            className={styles.differentiatorsRow}
          >
            <Typography
              variant="h4"
              className={styles.differentiatorsTitle}
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                color: "#1A5276",
                textAlign: "center",
                marginBottom: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Why Choose Monjoven
            </Typography>
            <div className={styles.differentiatorsGrid}>
              {differentiators.map((item, index) => (
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
