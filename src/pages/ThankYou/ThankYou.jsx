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
    icon: "mdi:shield-check",
    label: "NAAC Accredited",
    color: "#0C2D48",
  },
  {
    icon: "mdi:school",
    label: "AICTE Approved · VTU Affiliated",
    color: "#1E8E5A",
  },
  {
    icon: "mdi:headset",
    label: "100% Free Admission Guidance",
    color: "#D82618",
  },
];

// Contact details
const contactInfo = {
  phone: "+91 8069645014",
  whatsapp: "+91 8069645014",
  officeHours: "Mon - Sat: 9:00 AM - 5:00 PM",
};

// Next steps after form submission
const nextSteps = [
  "Keep your phone reachable — our CIT admission team will call you shortly on the number you shared.",
  "Have your Class 10 & 12 marksheets handy so we can map you to the right B.E. branch quickly.",
  "Feel free to ask about courses, hostel, fees, scholarships and travel from the North East.",
];

const ThankYou = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
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
    setUserName(name || "");

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
        colors: ["#0C2D48", "#1A5276", "#E0301E", "#D82618"],
      });

      // Right side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#0C2D48", "#1A5276", "#E0301E", "#D82618"],
      });
    }, 250);

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#0C2D48", "#1A5276", "#E0301E", "#D82618", "#1E8E5A"],
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

  const greeting = userName
    ? `Hi ${userName.split(" ")[0]}, our CIT admission team will call you shortly to guide you through the direct B.E. admission process for 2026.`
    : "Our CIT admission team will call you shortly to guide you through the direct B.E. admission process for 2026.";

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
              Thank You! Your 2026 Admission Enquiry is Received.
            </Typography>
            <Typography
              className={styles.subtitle}
              sx={{ color: "#FFFFFFB3 !important" }}
            >
              {greeting}
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
                A quick checklist so we can make your 2026 B.E. admission
                conversation smooth and useful:
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
                <Icon icon="mdi:phone-in-talk" />
                <span>CIT Admission Desk</span>
              </div>
              <Typography variant="h4" className={styles.companyName}>
                Or call us now if it's urgent
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
                      href="tel:+918069645014"
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
                      href="https://wa.me/918069645014?text=Hi%20CIT%20Admissions%2C%0AI%20just%20submitted%20the%20form%20and%20would%20like%20to%20know%20more%20about%20Direct%20B.E.%20Admission%202026."
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactValue}
                    >
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>
              </Grid>

              {/* Office Hours */}
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
                      Office Hours
                    </span>
                    <span className={styles.contactValue}>
                      {contactInfo.officeHours}
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
              href="https://wa.me/918069645014?text=Hi%20CIT%20Admissions%2C%0AI%20just%20submitted%20the%20form%20and%20would%20like%20to%20know%20more%20about%20Direct%20B.E.%20Admission%202026."
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
