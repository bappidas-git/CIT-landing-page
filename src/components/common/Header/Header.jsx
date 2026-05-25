/* ============================================
   Header Component
   Fixed header with scroll behavior and navigation
   ============================================ */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Icon } from "@iconify/react";
import {
  trackPhoneClick,
  trackNavigation,
  trackCTAClick,
} from "../../../utils/gtm";
import { useModal } from "../../../context/ModalContext";
import styles from "./Header.module.css";

const logoUrl =
  "https://res.cloudinary.com/dn9gyaiik/image/upload/v1779669113/logo-cit_ykpxvd.png";

const PRIMARY_PHONE = "+918069645014";
const PRIMARY_PHONE_DISPLAY = "+91 8069645014";

// Navigation items — admission-focused anchors. Section IDs are set
// alongside each section component (about / courses / placements / campus / contact).
const navItems = [
  { label: "About", href: "#about" },
  { label: "Courses", href: "#courses" },
  { label: "Placements", href: "#placements" },
  { label: "Campus", href: "#campus" },
  { label: "Contact", href: "#contact" },
];

const Header = ({ forceCloseMenu = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openLeadDrawer } = useModal();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Close mobile menu when bottom drawer opens
  useEffect(() => {
    if (forceCloseMenu && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [forceCloseMenu, isMobileMenuOpen]);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setIsScrolled(scrollPosition > 50);

    // Determine active section. When scrolled back above the first section
    // (e.g. the hero), no section is in range and we reset to none so the
    // previously clicked nav item doesn't stay highlighted.
    const sections = navItems.map((item) => item.href.substring(1));
    let currentSection = "";
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSection = sections[i];
          break;
        }
      }
    }
    setActiveSection(currentSection);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Smooth scroll to section (for desktop navigation)
  const scrollToSection = (e, href) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setIsMobileMenuOpen(false);
  };

  // Handle mobile menu item click (close menu first, then scroll with delay)
  const handleMobileMenuClick = (e, href) => {
    e.preventDefault();
    e.stopPropagation();

    // Store the target href before closing
    const targetHref = href;

    // Close menu first
    setIsMobileMenuOpen(false);

    // Scroll after a brief delay to allow menu close animation to start
    setTimeout(() => {
      const targetId = targetHref.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  const handleApplyClick = (source) => {
    trackCTAClick(`header_apply_now_${source}`, "header", "Apply Now");
    openLeadDrawer("apply-now");
    setIsMobileMenuOpen(false);
  };

  // Animation variants
  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: 0.2 },
    },
  };

  return (
    <motion.header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <Container maxWidth="xl" className={styles.headerContainer}>
        {/* Logo Section */}
        <motion.div
          className={styles.logoSection}
          variants={logoVariants}
          initial="initial"
          animate="animate"
        >
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, "#home")}
            className={styles.logoLink}
            aria-label="CIT home — scroll to top"
          >
            <div className={styles.logoWrapper}>
              <img
                src={logoUrl}
                alt="CIT — Channabasaveshwara Institute of Technology"
                className={styles.mainLogo}
                style={{
                  height: "40px",
                  width: "auto",
                }}
              />
              {!isMobile && (
                <span
                  className={styles.accreditationStrip}
                  aria-label="Accreditations: NAAC, AICTE, VTU"
                >
                  NAAC • AICTE • VTU
                </span>
              )}
            </div>
          </a>
        </motion.div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className={styles.desktopNav} aria-label="Primary">
            <ul className={styles.navList}>
              {navItems.map((item, index) => (
                <motion.li
                  key={item.label}
                  variants={navItemVariants}
                  initial="initial"
                  animate="animate"
                  custom={index}
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      trackNavigation("desktop_nav", "click", item.label);
                      scrollToSection(e, item.href);
                    }}
                    className={`${styles.navLink} ${activeSection === item.href.substring(1) ? styles.active : ""}`}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>
        )}

        {/* Right Section - Phone + Apply Now CTA */}
        <div className={styles.rightSection}>
          {!isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.3 }}
              >
                <a
                  href={`tel:${PRIMARY_PHONE}`}
                  className={styles.callButton}
                  onClick={() =>
                    trackPhoneClick(PRIMARY_PHONE, "header_desktop")
                  }
                  aria-label={`Call CIT admissions on ${PRIMARY_PHONE_DISPLAY}`}
                >
                  <Icon icon="mdi:phone" className={styles.callButtonIcon} />
                  {PRIMARY_PHONE_DISPLAY}
                </a>
              </motion.div>
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, duration: 0.3 }}
                onClick={() => handleApplyClick("desktop")}
                className={styles.applyButton}
                aria-label="Apply for 2026 B.E. admission"
              >
                <Icon icon="mdi:school-outline" className={styles.applyButtonIcon} />
                Apply Now
              </motion.button>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              className={styles.menuButton}
              onClick={() => {
                const newState = !isMobileMenuOpen;
                trackNavigation("mobile_menu", newState ? "open" : "close");
                setIsMobileMenuOpen(newState);
              }}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon
                icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"}
                className={styles.menuIcon}
              />
            </IconButton>
          )}
        </div>
      </Container>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className={styles.mobileNavContent} aria-label="Mobile primary">
              <ul className={styles.mobileNavList}>
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleMobileMenuClick(e, item.href)}
                      className={`${styles.mobileNavLink} ${activeSection === item.href.substring(1) ? styles.active : ""}`}
                    >
                      <Icon
                        icon={getNavIcon(item.label)}
                        className={styles.mobileNavIcon}
                      />
                      {item.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
              <div className={styles.mobileNavCTA}>
                <button
                  type="button"
                  onClick={() => handleApplyClick("mobile_menu")}
                  className={styles.mobileApplyButton}
                  aria-label="Apply for 2026 B.E. admission"
                >
                  <Icon
                    icon="mdi:school-outline"
                    className={styles.callButtonIcon}
                  />
                  Apply Now
                </button>
                <a
                  href={`tel:${PRIMARY_PHONE}`}
                  className={styles.mobileCallButton}
                  onClick={() => {
                    trackPhoneClick(PRIMARY_PHONE, "header_mobile_menu");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon icon="mdi:phone" className={styles.callButtonIcon} />
                  {PRIMARY_PHONE_DISPLAY}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// Helper function to get navigation icons
const getNavIcon = (label) => {
  const icons = {
    About: "mdi:information-outline",
    Courses: "mdi:book-open-variant",
    Placements: "mdi:briefcase-check-outline",
    Campus: "mdi:school-outline",
    Contact: "mdi:phone-outline",
  };
  return icons[label] || "mdi:circle-outline";
};

export default Header;
