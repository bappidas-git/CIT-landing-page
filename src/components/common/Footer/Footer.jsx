/* ============================================
   Footer Component
   Multi-column footer with links, contact info,
   social media, and legal modals
   ============================================ */

import React, { useState } from "react";
import { Container, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import styles from "./Footer.module.css";

// Privacy Policy Content Component
const PrivacyPolicyContent = () => (
  <div className={styles.legalContent}>
    <section className={styles.legalSection}>
      <h3>Introduction</h3>
      <p>
        Monjoven Hair Transplant & Cosmetic Surgery ("we," "our," or "us")
        respects your privacy and is committed to protecting your personal and
        medical data. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you visit our website or
        engage with our services.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Information We Collect</h3>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          <strong>Personal Information:</strong> Name, email address, phone
          number, and other contact details you provide when filling out
          consultation forms or contacting us.
        </li>
        <li>
          <strong>Medical Data:</strong> Health history, treatment preferences,
          medical conditions relevant to procedures, and before/after
          photographs taken during consultations and treatments.
        </li>
        <li>
          <strong>Consultation Data:</strong> Information shared during patient
          consultations including treatment goals, medical history, and
          procedure preferences.
        </li>
        <li>
          <strong>Usage Data:</strong> Information about how you interact with
          our website, including pages visited, time spent, and navigation
          patterns.
        </li>
        <li>
          <strong>Device Information:</strong> IP address, browser type,
          operating system, and device identifiers for analytics and security
          purposes.
        </li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>How We Use Your Information</h3>
      <p>We use the collected information for the following purposes:</p>
      <ul>
        <li>To respond to your inquiries and provide treatment information</li>
        <li>To schedule consultations and medical appointments</li>
        <li>To maintain accurate patient records and treatment histories</li>
        <li>
          To send relevant health updates and promotional communications (with
          your consent)
        </li>
        <li>To improve our website and services based on patient feedback</li>
        <li>To comply with legal and medical regulatory obligations</li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>Medical Data Privacy</h3>
      <p>
        We treat all medical and health-related data with the highest level of
        confidentiality. Patient medical records, consultation notes,
        before/after photographs, and treatment histories are stored securely
        and access is restricted to authorized medical personnel only. We do not
        share your medical data with third parties without your explicit
        consent, except as required by law.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Cookies & Analytics</h3>
      <p>
        Our website uses cookies and analytics tracking tools (including Google
        Analytics and Meta Pixel) to understand how visitors interact with our
        site. These tools may collect anonymized usage data to help us improve
        our services and deliver relevant content. You can manage cookie
        preferences through your browser settings.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Data Security</h3>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal and medical information against unauthorized
        access, alteration, disclosure, or destruction. However, no method of
        transmission over the internet is 100% secure, and we cannot guarantee
        absolute security.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access and request a copy of your personal and medical data</li>
        <li>Correct any inaccurate or incomplete information</li>
        <li>
          Request deletion of your personal data (subject to medical record
          retention requirements)
        </li>
        <li>Opt-out of marketing communications at any time</li>
        <li>Withdraw consent where processing is based on consent</li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>Contact Us</h3>
      <p>
        If you have any questions or concerns about this Privacy Policy or our
        data practices, please contact us at:
      </p>
      <p>
        <strong>Monjoven Hair Transplant & Cosmetic Surgery</strong>
        <br />
        Email: dr@monjoven.com
        <br />
        Phone: +91 9181956562
      </p>
    </section>

    <p className={styles.lastUpdated}>Last Updated: March 2026</p>
  </div>
);

// Terms & Conditions Content Component
const TermsConditionsContent = () => (
  <div className={styles.legalContent}>
    <section className={styles.legalSection}>
      <h3>Acceptance of Terms</h3>
      <p>
        By accessing and using this website, you accept and agree to be bound by
        these Terms and Conditions. If you do not agree to these terms, please
        do not use this website. Monjoven Hair Transplant & Cosmetic Surgery
        reserves the right to modify these terms at any time without prior
        notice.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>About This Website</h3>
      <p>
        This website is operated by Monjoven Hair Transplant & Cosmetic Surgery
        for the purpose of providing information about our medical and cosmetic
        services. All content is for general informational purposes only.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Medical Disclaimer</h3>
      <p>
        The information provided on this website is for general informational
        purposes only and is not a substitute for professional medical advice:
      </p>
      <ul>
        <li>
          Results from hair transplant and cosmetic procedures may vary from
          patient to patient. Individual outcomes depend on factors such as
          health condition, skin type, and adherence to post-procedure care.
        </li>
        <li>
          All procedures require a prior consultation with our medical team to
          determine suitability and expected outcomes.
        </li>
        <li>
          Before/after images and testimonials represent individual experiences
          and do not guarantee similar results.
        </li>
        <li>
          Always consult a qualified medical professional before making
          decisions about medical or cosmetic treatments.
        </li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>Appointment Cancellation & Rescheduling</h3>
      <p>
        Patients are requested to provide at least 24 hours&apos; notice for
        cancellations or rescheduling of appointments. Failure to show up for a
        scheduled consultation without prior notice may affect future booking
        priority. Monjoven reserves the right to reschedule appointments due to
        unforeseen medical emergencies or operational requirements.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>User Responsibilities</h3>
      <p>By using this website, you agree to:</p>
      <ul>
        <li>
          Provide accurate and complete information when submitting consultation
          requests
        </li>
        <li>
          Use the website only for lawful purposes and in compliance with
          applicable laws
        </li>
        <li>
          Not engage in any activity that could harm, disable, or impair the
          website
        </li>
        <li>
          Not attempt to gain unauthorized access to any part of the website or
          its systems
        </li>
      </ul>
    </section>

    <section className={styles.legalSection}>
      <h3>Intellectual Property</h3>
      <p>
        All content on this website, including but not limited to text,
        graphics, logos, images, and software, is the property of Monjoven Hair
        Transplant & Cosmetic Surgery and is protected by intellectual property
        laws. You may not reproduce, distribute, or create derivative works
        without prior written consent.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Limitation of Liability</h3>
      <p>
        Monjoven Hair Transplant & Cosmetic Surgery shall not be liable for any
        direct, indirect, incidental, consequential, or punitive damages arising
        from your use of this website or reliance on any information provided
        herein. Medical information on this website is not a substitute for
        professional medical advice, diagnosis, or treatment.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Governing Law</h3>
      <p>
        These Terms and Conditions shall be governed by and construed in
        accordance with the laws of India. Any disputes arising from or related
        to these terms shall be subject to the exclusive jurisdiction of the
        courts in Guwahati, Assam.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Contact Information</h3>
      <p>
        For any questions regarding these Terms and Conditions, please contact
        us at:
      </p>
      <p>
        <strong>Monjoven Hair Transplant & Cosmetic Surgery</strong>
        <br />
        Email: dr@monjoven.com
        <br />
        Phone: +91 9181956562
      </p>
    </section>

    <p className={styles.lastUpdated}>Last Updated: March 2026</p>
  </div>
);

// Disclaimer Content Component
const DisclaimerContent = () => (
  <div className={styles.legalContent}>
    <section className={styles.legalSection}>
      <h3>General Disclaimer</h3>
      <p>
        The information provided on this website is for general informational
        purposes only. While we strive to keep the information up to date and
        correct, we make no representations or warranties of any kind about the
        completeness, accuracy, reliability, suitability, or availability with
        respect to the website or the information, products, services, or
        related graphics contained on the website.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Medical Results Disclaimer</h3>
      <p>
        Results from hair transplant and cosmetic surgery procedures vary from
        patient to patient. Before/after photographs and testimonials on this
        website represent individual experiences and do not guarantee similar
        outcomes. A thorough consultation with our medical team is required
        before any procedure. The information on this website is not a
        substitute for professional medical advice, diagnosis, or treatment.
      </p>
    </section>

    <section className={styles.legalSection}>
      <h3>Contact</h3>
      <p>
        For any questions or concerns, please contact us at dr@monjoven.com or
        call +91 9181956562.
      </p>
    </section>

    <p className={styles.lastUpdated}>Last Updated: March 2026</p>
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

// Quick Links data
const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Why Choose Us", href: "#why-us" },
  { label: "Results", href: "#results" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

// Services links data
const serviceLinks = [
  { label: "Hair Transplant", href: "#services" },
  { label: "Beard Transplant", href: "#services" },
  { label: "Eyebrow Transplant", href: "#services" },
  { label: "Rhinoplasty", href: "#services" },
  { label: "Liposuction", href: "#services" },
  { label: "Gynecomastia", href: "#services" },
  { label: "PRP Therapy", href: "#services" },
  { label: "Laser Therapy", href: "#services" },
];

// Social media links
const socialLinks = [
  {
    icon: "mdi:facebook",
    href: "https://www.facebook.com/MONJOVEN/",
    label: "Facebook",
  },
  {
    icon: "mdi:instagram",
    href: "https://www.instagram.com/monjoven_",
    label: "Instagram",
  },
  {
    icon: "mdi:whatsapp",
    href: "https://api.whatsapp.com/send?phone=919181956562&text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant.",
    label: "WhatsApp",
  },
];

const Footer = () => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);

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
                    src="https://res.cloudinary.com/dn9gyaiik/image/upload/v1775887476/MONJOVEN-LOGO_hqpdnc.png"
                    alt="Monjoven Hair Transplant & Cosmetic Surgery"
                    style={{
                      height: "36px",
                      width: "auto",
                    }}
                  />
                </div>
                <p className={styles.tagline}>
                  Monjoven (meaning &lsquo;My Youth&rsquo;) is Northeast
                  India&apos;s first dedicated hair transplant and cosmetic
                  surgery clinic, founded in 2012 by Dr. Porag Neog. We
                  specialize in advanced hair restoration and cosmetic
                  procedures with international-standard results.
                </p>
                {/* Social Icons */}
                <div className={styles.socialIcons}>
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialIcon}
                      aria-label={social.label}
                    >
                      <Icon icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Column 2: Quick Links */}
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>Quick Links</h4>
                <ul className={styles.footerLinks}>
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className={styles.footerLink}
                        {...(link.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Services */}
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>Services</h4>
                <ul className={styles.footerLinks}>
                  {serviceLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className={styles.footerLink}
                        {...(link.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Contact */}
              <div className={styles.footerColumn}>
                <h4 className={styles.columnTitle}>Contact</h4>
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
                    <span className={styles.contactValue}>+91 9181956562</span>
                    <div className={styles.contactChipRow}>
                      <a
                        href="tel:+919181956562"
                        className={`${styles.contactChip} ${styles.contactChipCall}`}
                        aria-label="Call +91 9181956562"
                      >
                        <Icon icon="mdi:phone" />
                        <span>Call</span>
                      </a>
                      <a
                        href="https://api.whatsapp.com/send?phone=919181956562&text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant."
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.contactChip} ${styles.contactChipWhatsapp}`}
                        aria-label="Chat on WhatsApp with +91 9181956562"
                      >
                        <Icon icon="mdi:whatsapp" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </li>
                  <li className={styles.contactItem}>
                    <div className={styles.contactLabelRow}>
                      <Icon icon="mdi:email" className={styles.contactIcon} />
                      <span className={styles.contactLabel}>Email</span>
                    </div>
                    <a
                      href="mailto:dr@monjoven.com"
                      className={styles.contactValue}
                    >
                      dr@monjoven.com
                    </a>
                  </li>
                  <li className={styles.contactItem}>
                    <div className={styles.contactLabelRow}>
                      <Icon
                        icon="mdi:map-marker"
                        className={styles.contactIcon}
                      />
                      <span className={styles.contactLabel}>Address</span>
                    </div>
                    <span className={styles.contactValue}>
                      VIP Road, Borbari, Six Mile,
                      <br />
                      Near Pratiksha Hospital,
                      <br />
                      Guwahati, Assam
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <Container maxWidth="xl">
            <div className={styles.bottomContent}>
              <p className={styles.copyright}>
                &copy; 2024 Monjoven Hair Transplant & Cosmetic Surgery. All
                rights reserved.
              </p>
              <div className={styles.legalLinks}>
                <button
                  className={styles.legalLink}
                  onClick={() => setTermsModalOpen(true)}
                >
                  Terms & Conditions
                </button>
                <span className={styles.linkDivider}>|</span>
                <button
                  className={styles.legalLink}
                  onClick={() => setPrivacyModalOpen(true)}
                >
                  Privacy Policy
                </button>
                <span className={styles.linkDivider}>|</span>
                <button
                  className={styles.legalLink}
                  onClick={() => setDisclaimerModalOpen(true)}
                >
                  Disclaimer
                </button>
              </div>
            </div>
          </Container>
        </div>

        {/* Developer Credit Bar */}
        <div className={styles.developerBar}>
          <Container maxWidth="xl">
            <p className={styles.developerText}>
              Designed and Developed by{" "}
              <a
                href="https://www.assamdigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.developerLink}
              >
                Assam Digital
              </a>
            </p>
          </Container>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </LegalModal>

      <LegalModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms & Conditions"
      >
        <TermsConditionsContent />
      </LegalModal>

      <LegalModal
        isOpen={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
        title="Disclaimer"
      >
        <DisclaimerContent />
      </LegalModal>
    </>
  );
};

export default Footer;
