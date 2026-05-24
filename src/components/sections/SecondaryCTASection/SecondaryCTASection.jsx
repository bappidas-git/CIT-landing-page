/* ============================================
   SecondaryCTASection Component
   Final conversion push CTA before footer
   Focused on booking a consultation
   ============================================ */

import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import { trackCTAClick } from "../../../utils/gtm";
import Button from "../../common/Button/Button";
import styles from "./SecondaryCTASection.module.css";

const benefits = [
  { text: "Get initial consultation & assessment", icon: "mdi:check-circle" },
  { text: "Personalized treatment plan", icon: "mdi:check-circle" },
  {
    text: "Transparent pricing with no hidden costs",
    icon: "mdi:check-circle",
  },
  {
    text: "Flexible scheduling to suit your convenience",
    icon: "mdi:check-circle",
  },
];

const trustIndicators = [
  { text: "24/7 Support", icon: "mdi:headset" },
  { text: "No Obligation", icon: "mdi:shield-check" },
  { text: "100% Confidential", icon: "mdi:lock" },
];

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=919181956562&text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant.";

const SecondaryCTASection = () => {
  const { openLeadDrawer } = useModal();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section id="secondary-cta" className={styles.section}>
      <div className={styles.bgPattern} />

      <Container maxWidth="lg">
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className={styles.gridLayout}>
            {/* Left Column - Text Content */}
            <div className={styles.textColumn}>
              {/* Overline */}
              <motion.div
                variants={itemVariants}
                className={styles.badgeWrapper}
              >
                <span className={styles.badge}>Take the First Step</span>
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h3"
                  className={styles.title}
                  sx={{ color: "#fff" }}
                >
                  Your Transformation Begins with a Consultation
                </Typography>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  className={styles.subtitle}
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Dr. Porag Neog personally evaluates every case. Book your free
                  consultation today and get a customized treatment plan
                  designed just for you.
                </Typography>
              </motion.div>

              {/* Benefits List */}
              <motion.div variants={itemVariants}>
                <ul className={styles.benefitsList}>
                  {benefits.map((benefit) => (
                    <li key={benefit.text} className={styles.benefitItem}>
                      <Icon
                        icon={benefit.icon}
                        className={styles.benefitIcon}
                      />
                      <span>{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={itemVariants} className={styles.ctaGroup}>
                <Button
                  variant="primary"
                  className={styles.primaryCta}
                  onClick={() => {
                    trackCTAClick(
                      "secondary_cta_book",
                      "secondary_cta",
                      "Book Consultation",
                    );
                    openLeadDrawer("book-meeting");
                  }}
                >
                  <Icon
                    icon="mdi:calendar-check"
                    style={{ marginRight: 8, fontSize: "1.2rem" }}
                  />
                  Book Consultation
                </Button>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                  onClick={() =>
                    trackCTAClick(
                      "secondary_cta_whatsapp",
                      "secondary_cta",
                      "WhatsApp Us",
                    )
                  }
                >
                  <Icon icon="mdi:whatsapp" style={{ fontSize: "1.3rem" }} />
                  WhatsApp Us
                </a>
              </motion.div>

              {/* Phone Number */}
              <motion.div variants={itemVariants}>
                <a href="tel:+919181956562" className={styles.phoneLink}>
                  <Icon icon="mdi:phone" className={styles.phoneIcon} />
                  +91 9181956562
                </a>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div variants={itemVariants} className={styles.trustRow}>
                {trustIndicators.map((item) => (
                  <div key={item.text} className={styles.trustItem}>
                    <Icon icon={item.icon} className={styles.trustIcon} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Image */}
            {/* TODO: Replace placeholder below with actual image of Indian lady with Namaskar posture (600x500px recommended) */}
            <motion.div variants={itemVariants} className={styles.imageColumn}>
              <Box
                component="img"
                src="https://res.cloudinary.com/dn9gyaiik/image/upload/v1775889576/Book_your_consultation_today_vv54ox.png"
                alt="Indian woman greeting with Namaskar - Book your consultation today"
                className={styles.ctaImage}
              />
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default SecondaryCTASection;
