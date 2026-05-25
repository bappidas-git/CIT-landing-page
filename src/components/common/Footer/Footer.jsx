/* ============================================
   Footer Component — CIT 2026 Admissions
   Multi-column footer with quick links, admission
   contact info, accreditation strip and privacy modal
   ============================================ */

import React, { useState } from "react";
import { Container, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import styles from "./Footer.module.css";

const CIT_LOGO_URL =
  "https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669113/logo-cit_ykpxvd.png";

const PRIMARY_PHONE = "+918069645014";
const PRIMARY_PHONE_DISPLAY = "+91 8069645014";
const WHATSAPP_LINK =
  "https://api.whatsapp.com/send?phone=918069645014&text=Hello%20CIT%2C%20I%27d%20like%20guidance%20on%20Direct%20B.E.%20admission%202026.";

// Privacy Policy Content — CIT / Assam Digital admissions campaign
const PrivacyPolicyContent = () => (
  <div className={styles.legalContent}>
    <section className={styles.legalSection}>
      <h3>Introduction</h3>
      <p>
        Channabasaveshwara Institute of Technology (CIT), Tumakuru, together
        with its marketing partner Assam Digital, respects your privacy and is
        committed to protecting the personal data shared by prospective
        students and parents during the Direct B.E. Admissions 2026 campaign.
        This Privacy Policy explains what we collect, how we use it, and your
        rights.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Information We Collect</h3>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          <strong>Personal information:</strong> name, mobile number, email,
          home state and city — collected through admission enquiry forms,
          call-back requests and WhatsApp messages.
        </li>
        <li>
          <strong>Academic interest:</strong> the B.E. branch you are
          interested in, year of qualifying exam, and any questions about
          hostel, fees or the admission process.
        </li>
        <li>
          <strong>Usage data:</strong> anonymised information about how you
          interact with this landing page (pages viewed, source campaign, time
          spent) collected through Google Tag Manager and Meta Pixel.
        </li>
        <li>
          <strong>Device information:</strong> IP address, browser type and
          device identifiers, used for analytics and basic security.
        </li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To contact you about Direct B.E. admission 2026 at CIT.</li>
        <li>
          To answer questions about courses, fees, hostel facilities, scholarships
          and the admission process — by call or WhatsApp.
        </li>
        <li>
          To improve our campaigns, the landing page experience, and the
          guidance we provide to North East India students.
        </li>
        <li>
          To comply with applicable Indian laws and education-regulatory
          obligations.
        </li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>Sharing of Information</h3>
      <p>
        Your details are shared only between CIT&apos;s admissions team and
        Assam Digital&apos;s NE-region counsellors handling this campaign.
        We do not sell your data. We may share aggregated, anonymised
        analytics with platforms such as Google and Meta for ad performance
        measurement.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Cookies &amp; Tracking</h3>
      <p>
        This site uses Google Tag Manager, Google Ads conversion tracking and
        Meta Pixel/Conversions API to measure ad performance. You can disable
        cookies via your browser settings; some site features may not work as
        expected if you do.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Your Rights</h3>
      <ul>
        <li>Request a copy of the personal data we hold about you.</li>
        <li>Ask us to correct inaccurate information.</li>
        <li>Ask us to delete your data (subject to record-keeping requirements).</li>
        <li>Opt out of further marketing communication at any time.</li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>Contact</h3>
      <p>
        For any privacy questions or data requests, contact the CIT admissions
        office:
      </p>
      <p>
        <strong>Channabasaveshwara Institute of Technology</strong>
        <br />
        NH 206, B.H. Road, Gubbi, Tumakuru – 572 216, Karnataka
        <br />
        Phone: {PRIMARY_PHONE_DISPLAY}
      </p>
    </section>

    <p className={styles.lastUpdated}>Last Updated: May 2026</p>
  </div>
);

// Legal Modal Component
const LegalModal = ({ isOpen, onClose, title, children }) => {
  if (typeof window === "undefined") return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } },
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={styles.modalBackdrop}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={styles.legalModal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{title}</h2>
              <IconButton
                className={styles.modalCloseBtn}
                onClick={onClose}
                aria-label="Close modal"
              >
                <Icon icon="mdi:close" />
              </IconButton>
            </div>
            <div className={styles.modalBody}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// Quick Links — match the landing-page section anchors
const quickLinks = [
  { label: "About CIT", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Placements", href: "#placements" },
  { label: "Campus", href: "#campus" },
  { label: "Contact", href: "#contact" },
];

const accreditationItems = [
  "NAAC Accredited",
  "AICTE Approved",
  "VTU Affiliated",
  "ISO 9001:2015",
  "CET Code E101",
  "COMED-K E035",
];

const Footer = () => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        {/* Main Footer Content */}
        <div className={styles.mainFooter}>
          <Container maxWidth="xl">
            <div className={styles.footerGrid}>
              {/* Column 1: Logo & Tagline */}
              <div className={styles.footerBrand}>
                <div className={styles.logoWrapper}>
                  <img
                    src={CIT_LOGO_URL}
                    alt="CIT — Channabasaveshwara Institute of Technology"
                    style={{
                      height: "40px",
                      width: "auto",
                    }}
                  />
                </div>
                <p className={styles.tagline}>
                  Channabasaveshwara Institute of Technology — a NAAC-accredited,
                  AICTE-approved engineering institute in Tumakuru, Karnataka.
                  Guided Direct B.E. admissions for the 2026 intake, with
                  end-to-end support for students from North East India.
                </p>
              </div>

              {/* Column 2: Quick Links */}
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>Quick Links</h4>
                <ul className={styles.footerLinks}>
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Contact */}
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>Admissions Contact</h4>
                <ul className={styles.contactList}>
                  <li className={styles.contactItem}>
                    <div className={styles.contactLabelRow}>
                      <Icon
                        icon="mdi:phone-in-talk-outline"
                        className={styles.contactIcon}
                      />
                      <span className={styles.contactLabel}>
                        Call or WhatsApp
                      </span>
                    </div>
                    <span className={styles.contactValue}>
                      {PRIMARY_PHONE_DISPLAY}
                    </span>
                    <div className={styles.contactChipRow}>
                      <a
                        href={`tel:${PRIMARY_PHONE}`}
                        className={`${styles.contactChip} ${styles.contactChipCall}`}
                        aria-label={`Call ${PRIMARY_PHONE_DISPLAY}`}
                      >
                        <Icon icon="mdi:phone" />
                        <span>Call</span>
                      </a>
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.contactChip} ${styles.contactChipWhatsapp}`}
                        aria-label={`Chat on WhatsApp with ${PRIMARY_PHONE_DISPLAY}`}
                      >
                        <Icon icon="mdi:whatsapp" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </li>

                  <li className={styles.contactItem}>
                    <div className={styles.contactLabelRow}>
                      <Icon
                        icon="mdi:map-marker"
                        className={styles.contactIcon}
                      />
                      <span className={styles.contactLabel}>Campus</span>
                    </div>
                    <span className={styles.contactValue}>
                      NH 206, B.H. Road, Gubbi,
                      <br />
                      Tumakuru – 572 216, Karnataka
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </div>

        {/* Accreditation Strip */}
        <div className={styles.accreditationStrip}>
          <Container maxWidth="xl">
            <ul className={styles.accreditationList}>
              {accreditationItems.map((item) => (
                <li key={item} className={styles.accreditationItem}>
                  <Icon
                    icon="mdi:shield-check-outline"
                    className={styles.accreditationIcon}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Container>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <Container maxWidth="xl">
            <div className={styles.bottomContent}>
              <p className={styles.copyright}>
                &copy; 2026 Channabasaveshwara Institute of Technology. All
                rights reserved.
              </p>
              <div className={styles.legalLinks}>
                <button
                  className={styles.legalLink}
                  onClick={() => setPrivacyModalOpen(true)}
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </Container>
        </div>

        {/* Marketed By Credit */}
        <div className={styles.developerBar}>
          <Container maxWidth="xl">
            <p className={styles.developerText}>
              Marketed by{" "}
              <a
                href="https://www.assamdigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.developerLink}
              >
                Assam Digital
              </a>{" "}
              · Direct B.E. Admissions 2026
            </p>
          </Container>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <LegalModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </LegalModal>
    </>
  );
};

export default Footer;
