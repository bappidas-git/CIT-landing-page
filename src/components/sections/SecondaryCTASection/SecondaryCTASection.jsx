/* ============================================
   SecondaryCTASection Component
   Urgency / limited-seats band before footer
   Final conversion push for CIT 2026 admissions
   ============================================ */

import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import { trackCTAClick } from "../../../utils/gtm";
import Button from "../../common/Button/Button";
import styles from "./SecondaryCTASection.module.css";

const reassurances = [
  {
    text: "NAAC Accredited · AICTE Approved · VTU Affiliated",
    icon: "mdi:shield-check",
  },
  {
    text: "85%+ placements over the last 8 years (90+ recruiters on campus)",
    icon: "mdi:briefcase-check",
  },
  {
    text: "Safe hostel & mess facilities for North-East students",
    icon: "mdi:home-heart",
  },
  {
    text: "End-to-end admission guidance — no Karnataka trip needed",
    icon: "mdi:compass-outline",
  },
];

const trustIndicators = [
  { text: "100% Free Guidance", icon: "mdi:hand-heart" },
  { text: "Limited 2026 Seats", icon: "mdi:timer-sand" },
  { text: "Trusted by NE Families", icon: "mdi:account-group" },
];

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=918069645014&text=Hi%2C%20I%27d%20like%20to%20apply%20for%20Direct%20B.E.%20Admission%202026%20at%20CIT%20Tumakuru.%20Please%20share%20the%20details.";

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
              <motion.div
                variants={itemVariants}
                className={styles.badgeWrapper}
              >
                <span className={styles.badge}>
                  <Icon icon="mdi:alarm-light" className={styles.badgeIcon} />
                  Limited Seats — 2026 Intake
                </span>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h3"
                  className={styles.title}
                  sx={{ color: "#fff" }}
                >
                  Limited Seats for the 2026 Intake —{" "}
                  <span className={styles.titleAccent}>Apply Early</span>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="body1"
                  className={styles.subtitle}
                  sx={{ color: "rgba(255,255,255,0.92)" }}
                >
                  Direct B.E. admissions for 2026 close quickly each year. Lock
                  in your seat at Channabasaveshwara Institute of Technology,
                  Tumakuru with end-to-end guidance from our North-East
                  admission desk.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <ul className={styles.benefitsList}>
                  {reassurances.map((item) => (
                    <li key={item.text} className={styles.benefitItem}>
                      <Icon icon={item.icon} className={styles.benefitIcon} />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className={styles.ctaGroup}>
                <Button
                  variant="primary"
                  size="large"
                  className={styles.primaryCta}
                  onClick={() => {
                    trackCTAClick(
                      "secondary_cta_apply",
                      "secondary_cta",
                      "Apply for 2026 Admission",
                    );
                    openLeadDrawer("apply-now");
                  }}
                >
                  <Icon
                    icon="mdi:school"
                    style={{ marginRight: 8, fontSize: "1.2rem" }}
                  />
                  Apply for 2026 Admission
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

              <motion.div variants={itemVariants}>
                <a
                  href="tel:+918069645014"
                  className={styles.phoneLink}
                  onClick={() =>
                    trackCTAClick(
                      "secondary_cta_call",
                      "secondary_cta",
                      "Call CIT",
                    )
                  }
                >
                  <Icon icon="mdi:phone" className={styles.phoneIcon} />
                  +91 8069645014
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className={styles.trustRow}>
                {trustIndicators.map((item) => (
                  <div key={item.text} className={styles.trustItem}>
                    <Icon icon={item.icon} className={styles.trustIcon} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Visual */}
            <motion.div variants={itemVariants} className={styles.imageColumn}>
              <div className={styles.imageWrapper}>
                <Box
                  component="img"
                  src="https://res.cloudinary.com/dn9gyaiik/image/upload/v1779670911/CTA-Image_ntt9ql.png"
                  alt="Direct B.E. admission at CIT Tumakuru for the 2026 intake"
                  className={styles.ctaImage}
                  loading="lazy"
                />
                <div className={styles.seatBadge}>
                  <Icon icon="mdi:fire" className={styles.seatBadgeIcon} />
                  <div>
                    <span className={styles.seatBadgeLabel}>Filling Fast</span>
                    <span className={styles.seatBadgeValue}>
                      2026 B.E. Seats
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default SecondaryCTASection;
