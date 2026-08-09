/* ============================================
   ThankYou Page
   Post-application confirmation. The centerpiece
   is the applicant's unique Test Login Key — the
   only credential for the 30-Minute Online Merit
   Assessment Test — followed by the CTA that
   starts it.

   Deliberately sober: this is an exam handoff,
   not a celebration, so there is no confetti.
   ============================================ */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./ThankYou.module.css";
import { updatePageSEO } from "../../utils/seo";
import { seoConfig } from "../../config/seo";
import { trackContactClick } from "../../utils/contactTracking";
import { PROGRAM_NAME, TEST_NAME, TOTAL_SEATS_LEFT } from "../../data/meritProgram";
import {
  THANKYOU_SUBMITTED_STORAGE,
  THANKYOU_NAME_STORAGE,
  THANKYOU_KEY_STORAGE,
} from "../../utils/applicationSubmit";

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
    icon: "mdi:medal-outline",
    label: "Merit-Based Selection — Session 2026",
    color: "#D82618",
  },
];

// Contact details
const contactInfo = {
  phone: "+91 8069645014",
  whatsapp: "+91 8069645014",
  officeHours: "Mon - Sat: 9:00 AM - 5:00 PM",
};

// Pre-filled WhatsApp message — merit-program wording, URL-encoded.
const WHATSAPP_LINK =
  "https://wa.me/918069645014?text=Hi%20CIT%20Admissions%2C%0AI%20have%20submitted%20my%20application%20for%20the%20CIT%20Merit-Based%20Selection%20Program%202026%20and%20need%20help%20with%20my%20Test%20Login%20Key.";

// What the applicant is walking into. Same rules as the FAQ and the test
// platform — keep the three in sync if the format ever changes.
const testFacts = [
  { icon: "mdi:format-list-numbered", text: "30 MCQs — 15 Maths + 15 Physics" },
  { icon: "mdi:timer-outline", text: "60 seconds per question" },
  { icon: "mdi:plus-circle-outline", text: "+4 per correct answer, 0 for wrong or unanswered" },
  { icon: "mdi:arrow-u-left-top-bold", text: "No going back to a previous question" },
  { icon: "mdi:numeric-1-circle-outline", text: "One attempt with your key" },
  { icon: "mdi:wifi", text: "Stable internet recommended" },
];

const ThankYou = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [copyState, setCopyState] = useState("idle"); // idle | copied | manual
  const [isAuthorized, setIsAuthorized] = useState(false);
  const keyInputRef = useRef(null);

  // Check if user is authorized to view this page
  useEffect(() => {
    const leadSubmitted = sessionStorage.getItem(THANKYOU_SUBMITTED_STORAGE);
    const name = sessionStorage.getItem(THANKYOU_NAME_STORAGE);
    const key = sessionStorage.getItem(THANKYOU_KEY_STORAGE);

    if (!leadSubmitted) {
      // Redirect to home if accessed directly
      navigate("/", { replace: true });
      return;
    }

    setIsAuthorized(true);
    setUserName(name || "");
    setLoginKey((key || "").trim());

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

    // Clear the session flag after some time to prevent re-access.
    // The login key is deliberately NOT cleared — the /test login screen
    // pre-fills from it, and an applicant may sit the test later.
    const timeout = setTimeout(() => {
      sessionStorage.removeItem(THANKYOU_SUBMITTED_STORAGE);
      sessionStorage.removeItem(THANKYOU_NAME_STORAGE);
    }, 300000); // 5 minutes

    return () => clearTimeout(timeout);
  }, [navigate]);

  // Copy the key. navigator.clipboard needs HTTPS and is missing on older
  // Android WebViews, so the fallback selects the readonly input instead —
  // from there a long-press → Copy always works.
  const handleCopy = useCallback(async () => {
    if (!loginKey) return;

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(loginKey);
      setCopyState("copied");
      return;
    } catch (error) {
      // fall through to the select-based path below
    }

    const input = keyInputRef.current;
    if (!input) {
      setCopyState("manual");
      return;
    }
    input.focus();
    input.select();
    input.setSelectionRange(0, loginKey.length);
    let copied = false;
    try {
      // Deprecated, but it is the only copy these browsers have.
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    setCopyState(copied ? "copied" : "manual");
  }, [loginKey]);

  // Reset the button label so it stays usable for a second copy.
  useEffect(() => {
    if (copyState === "idle") return undefined;
    const timer = setTimeout(() => setCopyState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [copyState]);

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

  const firstName = userName.trim().split(" ")[0];
  const headline = firstName
    ? `Application received, ${firstName}. Your next step: the test.`
    : "Application received. Your next step: the test.";

  const copyLabel =
    copyState === "copied"
      ? "Copied ✓"
      : copyState === "manual"
      ? "Press & hold to copy"
      : "Copy";

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

          {/* Headline */}
          <motion.div
            variants={itemVariants}
            className={styles.thankYouMessage}
          >
            <Typography variant="h2" className={styles.title}>
              {headline}
            </Typography>
            <Typography
              className={styles.subtitle}
              sx={{ color: "#FFFFFFB3 !important" }}
            >
              Your application for the {PROGRAM_NAME} is in. Selection is on
              merit — the {TEST_NAME} decides who gets one of the{" "}
              {TOTAL_SEATS_LEFT} remaining seats.
            </Typography>
          </motion.div>

          {/* Login Key Card — the centerpiece */}
          <motion.div variants={itemVariants} className={styles.keyCard}>
            <span className={styles.keyLabel}>Your unique Test Login Key</span>

            {loginKey ? (
              <>
                <div className={styles.keyRow}>
                  <input
                    ref={keyInputRef}
                    className={styles.keyValue}
                    value={loginKey}
                    readOnly
                    spellCheck="false"
                    aria-label="Your test login key"
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={handleCopy}
                    data-state={copyState}
                  >
                    <Icon
                      icon={
                        copyState === "copied"
                          ? "mdi:check-bold"
                          : "mdi:content-copy"
                      }
                    />
                    <span>{copyLabel}</span>
                  </button>
                </div>
                <p className={styles.keyNote}>
                  Keep this key safe — you need it to enter the test. Our team
                  can also re-share it with you on call.
                </p>
              </>
            ) : (
              /* No key on this device: an older submission, blocked storage or
                 a lost response. Never show an empty box — tell them how the
                 key reaches them instead. */
              <p className={styles.keyPending}>
                Your Test Login Key will be shared by our admission team on
                WhatsApp/call shortly.
              </p>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className={styles.ctaSection}>
            <Link to="/test" className={styles.startTestBtn}>
              <span>Start Your {TEST_NAME} →</span>
            </Link>
            <Link to="/" className={styles.laterBtn}>
              <span>I'll take it later</span>
            </Link>
          </motion.div>

          <motion.p variants={itemVariants} className={styles.validityNote}>
            Your key stays valid until the test is completed once.
          </motion.p>

          {/* What to expect */}
          <motion.div variants={itemVariants} className={styles.expectSection}>
            <Typography className={styles.sectionLabel}>
              What to expect in the test
            </Typography>
            <ul className={styles.expectGrid}>
              {testFacts.map((fact) => (
                <li key={fact.text} className={styles.expectItem}>
                  <Icon icon={fact.icon} />
                  <span>{fact.text}</span>
                </li>
              ))}
            </ul>
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

          {/* Contact Card — compact */}
          <motion.div variants={itemVariants} className={styles.contactCard}>
            <div className={styles.contactHeader}>
              <div className={styles.companyBadge}>
                <Icon icon="mdi:phone-in-talk" />
                <span>CIT Admission Desk</span>
              </div>
              <Typography variant="h4" className={styles.companyName}>
                Stuck with your key or the test? Call us.
              </Typography>
            </div>

            <Grid container spacing={2} className={styles.contactGrid}>
              {/* Phone */}
              <Grid item xs={12} sm={4}>
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
                      onClick={() => trackContactClick("phone", "thank_you")}
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              </Grid>

              {/* WhatsApp */}
              <Grid item xs={12} sm={4}>
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
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactValue}
                      onClick={() => trackContactClick("whatsapp", "thank_you")}
                    >
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>
              </Grid>

              {/* Office Hours */}
              <Grid item xs={12} sm={4}>
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
        </motion.div>
      </Container>
    </div>
  );
};

export default ThankYou;
