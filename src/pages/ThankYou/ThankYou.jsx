/* ============================================
   ThankYou Page
   Post lead submission confirmation page
   ============================================ */

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import confetti from "canvas-confetti";
import styles from "./ThankYou.module.css";
import { updatePageSEO } from "../../utils/seo";
import { seoConfig } from "../../config/seo";

// Trust badges
const trustBadges = [
  {
    icon: "mdi:calendar-check",
    label: "25+ Yrs Plastic Surgery | 15+ Yrs Hair Transplant",
    color: "#148F77",
  },
  {
    icon: "mdi:account-heart",
    label: "5,000+ Happy Patients",
    color: "#4CAF50",
  },
  {
    icon: "mdi:shield-lock",
    label: "100% Confidential",
    color: "#2196F3",
  },
];

// Contact details
const contactInfo = {
  phone: "+91 9181956562",
  whatsapp: "+91 9181956562",
  email: "dr@monjoven.com",
  clinicHours: "Mon - Sat: 9:00 AM - 6:00 PM",
};

// Next steps after form submission
const nextSteps = [
  "Our team will call you to confirm your preferred date and time",
  "You'll receive a pre-consultation questionnaire via WhatsApp/Email",
  "Dr. Neog will personally evaluate your case during the consultation",
  "You'll receive a customized treatment plan and transparent pricing",
];

const ThankYou = () => {
  const navigate = useNavigate();
  const [, setUserName] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if user is authorized to view this page
  useEffect(() => {
    const leadSubmitted = sessionStorage.getItem("lead_submitted");
    const name = sessionStorage.getItem("lead_name");

    if (!leadSubmitted) {
      // Redirect to home if accessed directly
      navigate("/", { replace: true });
      return;
    }

    setIsAuthorized(true);
    setUserName(name || "there");

    // Set noindex meta and update page title for Thank You page
    updatePageSEO({
      title: seoConfig.pages.thankYou.title,
      description: seoConfig.pages.thankYou.description,
      url: seoConfig.siteUrl + '/thank-you',
      robots: 'noindex, nofollow',
    });

    // Push virtual pageview and conversion event to GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtualPageview',
      pagePath: '/thank-you',
      pageTitle: 'Thank You',
    });
    window.dataLayer.push({
      event: 'lead_form_submission_complete',
      pagePath: '/thank-you',
    });

    // Clear the session flag after some time to prevent re-access
    const timeout = setTimeout(() => {
      sessionStorage.removeItem("lead_submitted");
      sessionStorage.removeItem("lead_name");
    }, 300000); // 5 minutes

    return () => clearTimeout(timeout);
  }, [navigate]);

  // Fire confetti effect
  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 10000,
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#148F77", "#1ABC9C", "#FFD700", "#FFA500"],
      });

      // Right side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#148F77", "#1ABC9C", "#FFD700", "#FFA500"],
      });
    }, 250);

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#148F77", "#1ABC9C", "#FFD700", "#4CAF50", "#2196F3"],
    });
  }, []);

  // Trigger confetti on mount
  useEffect(() => {
    if (isAuthorized) {
      const timer = setTimeout(fireConfetti, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthorized, fireConfetti]);

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
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return (
    <div className={styles.thankYouPage}>
      {/* Background Elements */}
      <div className={styles.bgPattern} />
      <div className={styles.bgGlow1} />
      <div className={styles.bgGlow2} />

      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.content}
        >
          {/* Success Icon */}
          <motion.div variants={scaleVariants} className={styles.successIcon}>
            <div className={styles.iconWrapper}>
              <Icon icon="mdi:check-circle" />
            </div>
            <div className={styles.iconRing} />
            <div className={styles.iconRing2} />
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            variants={itemVariants}
            className={styles.thankYouMessage}
          >
            <Typography variant="h2" className={styles.title}>
              Thank You for Choosing Monjoven!
            </Typography>
            <Typography
              className={styles.subtitle}
              sx={{ color: "#FFFFFFB3 !important" }}
            >
              Your consultation request has been received successfully
            </Typography>
          </motion.div>

          {/* Confirmation Message & Next Steps */}
          <motion.div variants={itemVariants} className={styles.responseNotice}>
            <div className={styles.noticeIcon}>
              <Icon icon="mdi:clock-check-outline" />
            </div>
            <div className={styles.noticeContent}>
              <Typography className={styles.noticeTitle}>
                What happens next?
              </Typography>
              <Typography
                className={styles.noticeDesc}
                sx={{ color: "#FFFFFFA6 !important" }}
              >
                Dr. Porag Neog's team will contact you within 24 hours to
                schedule your personalized consultation. Here's what to expect:
              </Typography>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div variants={itemVariants} className={styles.nextStepsSection}>
            <ol className={styles.nextStepsList}>
              {nextSteps.map((step, index) => (
                <motion.li
                  key={index}
                  className={styles.nextStepItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepText}>{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className={styles.highlightsSection}
          >
            <div className={styles.highlightsGrid}>
              {trustBadges.map((item, index) => (
                <motion.div
                  key={item.label}
                  className={styles.highlightCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div
                    className={styles.highlightIcon}
                    style={{
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    <Icon icon={item.icon} />
                  </div>
                  <span className={styles.highlightLabel}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information Card */}
          <motion.div variants={itemVariants} className={styles.contactCard}>
            <div className={styles.contactHeader}>
              <div className={styles.companyBadge}>
                <Icon icon="mdi:headset" />
                <span>Support</span>
              </div>
              <Typography variant="h4" className={styles.companyName}>
                Need Immediate Assistance?
              </Typography>
            </div>

            <Grid container spacing={3} className={styles.contactGrid}>
              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIconWrapper}>
                    <Icon icon="mdi:phone" />
                  </div>
                  <div className={styles.contactDetails}>
                    <span
                      className={styles.contactLabel}
                      style={{ color: "#FFFFFF80" }}
                    >
                      Call Us
                    </span>
                    <a
                      href="tel:+919181956562"
                      className={styles.contactValue}
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              </Grid>

              {/* WhatsApp */}
              <Grid item xs={12} sm={6}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIconWrapper}>
                    <Icon icon="mdi:whatsapp" />
                  </div>
                  <div className={styles.contactDetails}>
                    <span
                      className={styles.contactLabel}
                      style={{ color: "#FFFFFF80" }}
                    >
                      WhatsApp
                    </span>
                    <a
                      href="https://wa.me/919181956562?text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant."
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactValue}
                    >
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIconWrapper}>
                    <Icon icon="mdi:email" />
                  </div>
                  <div className={styles.contactDetails}>
                    <span
                      className={styles.contactLabel}
                      style={{ color: "#FFFFFF80" }}
                    >
                      Email Us
                    </span>
                    <a
                      href="mailto:dr@monjoven.com"
                      className={styles.contactValue}
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </Grid>

              {/* Clinic Hours */}
              <Grid item xs={12} sm={6}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIconWrapper}>
                    <Icon icon="mdi:clock-outline" />
                  </div>
                  <div className={styles.contactDetails}>
                    <span
                      className={styles.contactLabel}
                      style={{ color: "#FFFFFF80" }}
                    >
                      Clinic Hours
                    </span>
                    <span className={styles.contactValue}>
                      {contactInfo.clinicHours}
                    </span>
                  </div>
                </div>
              </Grid>
            </Grid>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className={styles.ctaSection}
          >
            <motion.a
              href="/"
              className={styles.backHomeBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon icon="mdi:arrow-left" />
              <span>Back to Home</span>
            </motion.a>
            <motion.a
              href="https://wa.me/919181956562?text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon icon="mdi:whatsapp" />
              <span>WhatsApp Us Now</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};

export default ThankYou;
