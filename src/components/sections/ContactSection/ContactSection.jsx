/* ============================================
   ContactSection Component
   "Get in Touch" contact section with contact cards
   and embedded lead form
   ============================================ */

import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import UnifiedLeadForm from "../../common/UnifiedLeadForm/UnifiedLeadForm";
import { useModal } from "../../../context/ModalContext";
import styles from "./ContactSection.module.css";

const ContactSection = () => {
  const { openLeadDrawer } = useModal();

  // Animation variants
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

  // Contact info items
  const contactInfo = [
    {
      icon: "mdi:map-marker-outline",
      title: "Clinic Address",
      content: "VIP Road, Borbari, Six Mile, Near Pratiksha Hospital, Guwahati, Assam",
    },
    {
      icon: "mdi:phone-in-talk-outline",
      title: "Call or WhatsApp",
      primary: {
        display: "+91 9181956562",
        ariaLabel: "Primary contact number +91 9181956562",
      },
      actions: [
        {
          icon: "mdi:phone",
          label: "Call",
          href: "tel:+919181956562",
          ariaLabel: "Call us at +91 9181956562",
          variant: "call",
        },
        {
          icon: "mdi:whatsapp",
          label: "Chat",
          href: "https://api.whatsapp.com/send?phone=919181956562&text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant.",
          external: true,
          ariaLabel: "Chat with us on WhatsApp at +91 9181956562",
          variant: "whatsapp",
        },
      ],
    },
    {
      icon: "mdi:email-outline",
      title: "Email Us",
      content: "dr@monjoven.com",
      href: "mailto:dr@monjoven.com",
    },
    {
      icon: "mdi:clock-outline",
      title: "Clinic Hours",
      content: "Mon - Sat: 9:00 AM - 6:00 PM",
    },
  ];

  const handleRequestCallback = () => {
    openLeadDrawer("contact", {
      title: "Request a Callback",
      subtitle:
        "Fill in your details and our team will reach out to you",
    });
  };

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
              Get In Touch
            </Typography>
            <Typography variant="h2" className={styles.sectionTitle}>
              Visit Our Clinic or Book a{" "}
              <span className={styles.highlight}>Consultation</span>
            </Typography>
            <Typography variant="body1" className={styles.sectionSubtitle}>
              Located in Guwahati, Assam — easily accessible from all parts of
              Northeast India
            </Typography>
          </motion.div>

          {/* Quick Action Buttons (mobile-first, visible on all) */}
          <motion.div variants={itemVariants} className={styles.quickActions}>
            <a href="tel:+919181956562" className={styles.quickActionBtn}>
              <Icon icon="mdi:phone" className={styles.quickActionIcon} />
              <span>Call Now</span>
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=919181956562&text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant."
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.quickActionBtn} ${styles.quickActionWhatsapp}`}
            >
              <Icon icon="mdi:whatsapp" className={styles.quickActionIcon} />
              <span>WhatsApp Us</span>
            </a>
            <button
              onClick={handleRequestCallback}
              className={`${styles.quickActionBtn} ${styles.quickActionCallback}`}
            >
              <Icon
                icon="mdi:phone-callback"
                className={styles.quickActionIcon}
              />
              <span>Request Callback</span>
            </button>
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
                          </div>
                        ) : item.href ? (
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
                    Request a Callback
                  </Typography>
                  <Typography variant="body2" className={styles.formSubtitle}>
                    Fill in your details and our team will reach out to you
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
                  submitButtonText="Submit Enquiry"
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
