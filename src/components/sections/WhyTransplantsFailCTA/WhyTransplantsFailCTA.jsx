/* ============================================
   WhyTransplantsFailCTA Component
   Highlights common hair transplant failure reasons,
   Dr. Porag Neog supervision reassurance, and
   a prominent price-led CTA starting at ₹30,000.
   ============================================ */

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useModal } from "../../../context/ModalContext";
import { trackCTAClick } from "../../../utils/gtm";
import styles from "./WhyTransplantsFailCTA.module.css";

// Pain points — reasons most hair transplants fail
const failureReasons = [
  {
    icon: "mdi:account-alert-outline",
    title: "Inexperienced Handling of Grafts",
    description:
      "Improper handling of grafts may affect survival and growth, leading to suboptimal density and less natural-looking outcomes.",
  },
  {
    icon: "mdi:content-cut",
    title: "Overharvesting of Donor Area",
    description:
      "Excessive extraction can reduce donor density and may impact future procedures, sometimes leading to visible thinning.",
  },
  {
    icon: "mdi:vector-polyline-edit",
    title: "Improper Hairline Design",
    description:
      "Hairline design that does not consider age, facial proportions, and future hair loss patterns may lead to unnatural appearance over time.",
  },
];

// Reassurance bullet points from Dr. Porag Neog's clinic
const reassurancePoints = [
  "Each procedure is carried out with involvement of a surgeon experienced in plastic & reconstructive  surgery.",
  "Over 25+ years of experience in plastic and reconstructive surgery",
  "Use of established techniques such as FUE and DHI based on individual assessment",
  "Emphasis on donor area preservation and long-term planning",
  "Hairline design tailored to age, facial proportions and future hair loss pattern",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const WhyTransplantsFailCTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { openLeadDrawer } = useModal();

  const handleBookConsultation = () => {
    trackCTAClick(
      "why_fail_book_consultation",
      "why_fail_cta",
      "Book Consultation",
    );
    openLeadDrawer("consultation");
  };

  return (
    <section
      id="why-transplants-fail"
      className={styles.section}
      ref={ref}
      aria-labelledby="why-fail-title"
    >
      {/* Decorative background */}
      <div className={styles.bgDecor} aria-hidden="true" />
      <div className={styles.bgGlowOne} aria-hidden="true" />
      <div className={styles.bgGlowTwo} aria-hidden="true" />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={styles.wrapper}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.header}>
            <span className={styles.badge}>
              <Icon
                icon="mdi:alert-octagon-outline"
                className={styles.badgeIcon}
              />
              The Hard Truth
            </span>
            <Typography
              id="why-fail-title"
              variant="h2"
              className={styles.title}
            >
              Why Hair Transplant Results Can Be{" "}
              <span className={styles.titleAccent}>Unsatisfactory</span>
            </Typography>
            <Typography className={styles.subtitle} sx={{ marginTop: "20px" }}>
              A hair transplant is a carefully planned medical procedure. Here
              are some common factors that can affect outcomes—and how
              appropriate planning and technique help improve results.
            </Typography>
          </motion.div>

          {/* Failure Reason Cards */}
          <div className={styles.reasonsGrid}>
            {failureReasons.map((reason, index) => (
              <motion.article
                key={reason.title}
                className={styles.reasonCard}
                custom={index}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <div className={styles.reasonIconWrap}>
                  <Icon icon={reason.icon} className={styles.reasonIcon} />
                  <span className={styles.reasonNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className={styles.reasonTitle}>{reason.title}</h3>
                <p className={styles.reasonDescription}>{reason.description}</p>
              </motion.article>
            ))}
          </div>

          {/* Reassurance Banner */}
          <motion.div variants={itemVariants} className={styles.ctaBanner}>
            <div className={styles.bannerGrid}>
              {/* Left — reassurance copy */}
              <div className={styles.bannerLeft}>
                <span className={styles.bannerBadge}>
                  <Icon
                    icon="mdi:shield-check"
                    className={styles.bannerBadgeIcon}
                  />
                  The Monjoven Promise
                </span>
                <Typography variant="h3" className={styles.bannerTitle}>
                  Hair Transplant Planned & Performed Under the Care of{" "}
                  <span className={styles.bannerTitleAccent}>
                    Dr. Porag Neog
                  </span>
                </Typography>

                <ul className={styles.reassuranceList}>
                  {reassurancePoints.map((point) => (
                    <li key={point} className={styles.reassuranceItem}>
                      <Icon
                        icon="mdi:check-decagram"
                        className={styles.reassuranceIcon}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — price + CTA */}
              <div className={styles.bannerRight}>
                <div className={styles.priceCard}>
                  <span className={styles.priceLabel}>
                    Hair Transplant Starting From
                  </span>
                  <div className={styles.priceValueRow}>
                    <span className={styles.priceCurrency}>₹</span>
                    <span className={styles.priceValue}>30,000</span>
                    <span className={styles.priceStar}>*</span>
                  </div>

                  <button
                    type="button"
                    className={styles.ctaButton}
                    onClick={handleBookConsultation}
                    style={{ marginBottom: "25px" }}
                  >
                    <Icon
                      icon="mdi:calendar-check"
                      className={styles.ctaButtonIcon}
                    />
                    <span>Book Consultation</span>
                  </button>

                  <div className={styles.priceNotwWrapper}>
                    <span className={styles.priceNote}>
                      <Icon
                        icon="mdi:check-decagram"
                        className={styles.reassuranceIcon}
                        style={{ marginRight: "10px", fontSize: "16px" }}
                      />
                      Treatment cost varies depending on graft requirement and
                      individual case
                    </span>
                    <span className={styles.priceNote}>
                      <Icon
                        icon="mdi:check-decagram"
                        className={styles.reassuranceIcon}
                        style={{ marginRight: "10px", fontSize: "16px" }}
                      />
                      Detailed estimate provided after consultation
                    </span>
                  </div>

                  <div className={styles.trustRow}>
                    <div className={styles.trustItem}>
                      <Icon icon="mdi:shield-lock" />
                      <span>Confidential Consultation</span>
                    </div>
                    <div className={styles.trustItem}>
                      <Icon icon="mdi:headset" />
                      <span>Dedicated Patient Support</span>
                    </div>
                  </div>

                  <span className={styles.priceDisclaimer}>
                    * Final cost depends on graft requirement and treatment
                    plan.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default WhyTransplantsFailCTA;
