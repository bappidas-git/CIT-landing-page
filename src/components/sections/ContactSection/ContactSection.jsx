/* ============================================
   ContactSection Component
   "Contact / Admissions" — CIT admission contact details
   alongside the unified lead form.
   ============================================ */

import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import UnifiedLeadForm from "../../common/UnifiedLeadForm/UnifiedLeadForm";
import { locationData } from "../../../data/locationData";
import styles from "./ContactSection.module.css";

const ContactSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const mapsQuery = encodeURIComponent(
    `${locationData.name}, ${locationData.address}`,
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const whatsappUrl = `https://wa.me/${locationData.whatsapp}?text=${encodeURIComponent(
    "Hi CIT, I'd like guidance on the 2026 B.E. direct admission from North East.",
  )}`;

  const contactInfo = [
    {
      icon: "mdi:map-marker-outline",
      title: "Campus Address",
      content: locationData.address,
      href: mapsUrl,
      external: true,
    },
    {
      icon: "mdi:phone-in-talk-outline",
      title: "Call or WhatsApp",
      primary: {
        display: locationData.phoneDisplay,
        ariaLabel: `Primary admission helpline ${locationData.phoneDisplay}`,
      },
      actions: [
        {
          icon: "mdi:phone",
          label: "Call",
          href: `tel:${locationData.phone}`,
          ariaLabel: `Call CIT admissions at ${locationData.phoneDisplay}`,
          variant: "call",
        },
        {
          icon: "mdi:whatsapp",
          label: "Chat",
          href: whatsappUrl,
          external: true,
          ariaLabel: `Chat with CIT admissions on WhatsApp at ${locationData.phoneDisplay}`,
          variant: "whatsapp",
        },
      ],
    },
    {
      icon: "mdi:clock-fast",
      title: "Response Time",
      content: "Our admission team responds within 24 hours — every enquiry, every weekday.",
    },
    {
      icon: "mdi:school-outline",
      title: "PG & Research",
      content: "PG (M.Tech / MBA / MCA) and research programs are also available — ask us.",
    },
  ];

  return (
    <section id="contact" className={styles.section}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className={styles.sectionHeader}>
            <Typography variant="overline" className={styles.sectionOverline}>
              Contact / Admissions
            </Typography>
            <Typography variant="h2" className={styles.sectionTitle}>
              Talk to CIT's{" "}
              <span className={styles.highlight}>Admission Team</span>
            </Typography>
            <Typography variant="body1" className={styles.sectionSubtitle}>
              Reach us directly, or send your details — we'll guide you through
              the 2026 B.E. direct-admission process.
            </Typography>
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div variants={itemVariants} className={styles.quickActions}>
            <a
              href={`tel:${locationData.phone}`}
              className={styles.quickActionBtn}
            >
              <Icon icon="mdi:phone" className={styles.quickActionIcon} />
              <span>Call {locationData.phoneDisplay}</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.quickActionBtn} ${styles.quickActionWhatsapp}`}
            >
              <Icon icon="mdi:whatsapp" className={styles.quickActionIcon} />
              <span>WhatsApp Admissions</span>
            </a>
          </motion.div>

          <Grid container spacing={6} alignItems="flex-start">
            {/* Left Side - Contact Cards */}
            <Grid item xs={12} lg={6}>
              <motion.div
                variants={itemVariants}
                className={styles.contentWrapper}
              >
                <div className={styles.contactGrid}>
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className={styles.contactCard}
                    >
                      <div className={styles.contactIcon}>
                        <Icon icon={item.icon} />
                      </div>
                      <div className={styles.contactText}>
                        <Typography
                          variant="subtitle2"
                          className={styles.contactTitle}
                        >
                          {item.title}
                        </Typography>
                        {item.actions ? (
                          <div className={styles.contactDualAction}>
                            <span
                              className={styles.contactPrimaryNumber}
                              aria-label={item.primary.ariaLabel}
                            >
                              {item.primary.display}
                            </span>
                            <div className={styles.contactActionRow}>
                              {item.actions.map((action, subIndex) => (
                                <a
                                  key={subIndex}
                                  href={action.href}
                                  aria-label={action.ariaLabel}
                                  className={`${styles.contactActionPill} ${styles[`contactAction_${action.variant}`]}`}
                                  {...(action.external
                                    ? {
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                      }
                                    : {})}
                                >
                                  <Icon
                                    icon={action.icon}
                                    className={styles.contactActionIcon}
                                    aria-hidden="true"
                                  />
                                  <span>{action.label}</span>
                                </a>
                              ))}
                            </div>
                            {item.secondaryLinks && (
                              <div className={styles.contactSecondaryLinks}>
                                <span className={styles.contactSecondaryLabel}>
                                  Also:
                                </span>
                                {item.secondaryLinks.map((link, linkIndex) => (
                                  <React.Fragment key={linkIndex}>
                                    {linkIndex > 0 && (
                                      <span className={styles.contactSecondaryDot}>
                                        ·
                                      </span>
                                    )}
                                    <a
                                      href={link.href}
                                      className={styles.contactSecondaryLink}
                                    >
                                      {link.display}
                                    </a>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : item.href ? (
                          <>
                            <a
                              href={item.href}
                              className={styles.contactLink}
                              {...(item.external
                                ? {
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                  }
                                : {})}
                            >
                              {item.content}
                            </a>
                            {item.subText && item.subHref && (
                              <a
                                href={item.subHref}
                                className={styles.contactSubLink}
                              >
                                {item.subText}
                              </a>
                            )}
                          </>
                        ) : (
                          <Typography
                            variant="body2"
                            className={styles.contactContent}
                          >
                            {item.content}
                          </Typography>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Grid>

            {/* Right Side - Form */}
            <Grid item xs={12} lg={6}>
              <motion.div
                variants={formVariants}
                className={styles.formWrapper}
              >
                {/* Form Header */}
                <div className={styles.formHeader}>
                  <Typography variant="h5" className={styles.formTitle}>
                    Get Admission Details
                  </Typography>
                  <Typography variant="body2" className={styles.formSubtitle}>
                    Share your details — our CIT admission counsellor will call
                    you within 24 hours.
                  </Typography>
                </div>

                {/* Unified Lead Form */}
                <UnifiedLeadForm
                  variant="default"
                  source="contact"
                  showTitle={false}
                  showSubtitle={false}
                  showTrustBadges={true}
                  showConsent={true}
                  showPhoneButton={false}
                  submitButtonText="Get Admission Details"
                  formId="contact-form"
                  className={styles.formContent}
                />
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </section>
  );
};

export default ContactSection;
