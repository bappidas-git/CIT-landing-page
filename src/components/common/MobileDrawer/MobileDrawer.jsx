/* ============================================
   MobileDrawer Component
   Slide-up menu drawer for mobile navigation
   ============================================ */

import React, { useEffect, useCallback } from "react";
import {
  SwipeableDrawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { trackPhoneClick, trackWhatsAppClick } from "../../../utils/gtm";
import styles from "./MobileDrawer.module.css";

// Navigation menu items
const menuItems = [
  { id: "home", label: "Home", icon: "ic:outline-home", href: "#home" },
  { id: "about", label: "About Us", icon: "mdi:information-outline", href: "#about" },
  { id: "services", label: "Services", icon: "mdi:medical-bag", href: "#services" },
  { id: "why-us", label: "Why Choose Us", icon: "mdi:star-outline", href: "#why-us" },
  { id: "results", label: "Results", icon: "mdi:image-multiple-outline", href: "#results" },
  { id: "testimonials", label: "Testimonials", icon: "mdi:format-quote-open", href: "#testimonials" },
  { id: "contact", label: "Contact", icon: "mdi:phone-outline", href: "#contact" },
];

const MobileDrawer = ({ open, onClose, onOpen, onBookConsultation, activeSection = "home" }) => {
  // iOS detection for SwipeableDrawer optimization
  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Handle escape key to close drawer
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open, handleKeyDown]);

  // Handle menu item click
  const handleMenuClick = (item) => {
    // Store the target href before closing
    const targetHref = item.href;

    // Close drawer first
    onClose();

    // Reset body overflow immediately to enable scrolling
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";

    // Scroll after a brief delay to allow drawer close animation to start
    setTimeout(() => {
      const element = document.querySelector(targetHref);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  // Animation variants for staggered menu items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Drawer content
  const drawerContent = (
    <Box
      className={styles.drawerContent}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Drawer Handle */}
      <div className={styles.drawerHandle}>
        <div className={styles.handleBar} />
      </div>

      {/* Header */}
      <Box className={styles.drawerHeader}>
        <Box className={styles.logoSection}>
          <img
            src="https://www.monjoven.com/assets/img/logo.png"
            alt="Monjoven"
            style={{ height: "32px", width: "auto" }}
          />
        </Box>
        <IconButton
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close menu"
        >
          <Icon icon="ic:baseline-close" />
        </IconButton>
      </Box>

      <Divider className={styles.divider} />

      {/* Navigation Menu */}
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <List className={styles.menuList}>
              {menuItems.map((item, index) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <ListItem disablePadding className={styles.menuItem}>
                    <ListItemButton
                      onClick={() => handleMenuClick(item)}
                      className={`${styles.menuButton} ${
                        activeSection === item.id ? styles.activeItem : ""
                      }`}
                      sx={{
                        borderRadius: "12px",
                        mx: 1,
                        mb: 0.5,
                        py: 1.5,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(20, 143, 119, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon
                        className={styles.menuIcon}
                        sx={{
                          minWidth: 44,
                          color:
                            activeSection === item.id ? "#148F77" : "#6B7280",
                        }}
                      >
                        <Icon icon={item.icon} style={{ fontSize: 22 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        className={styles.menuText}
                        sx={{
                          "& .MuiTypography-root": {
                            fontWeight: activeSection === item.id ? 600 : 500,
                            color:
                              activeSection === item.id ? "#148F77" : "#374151",
                            fontSize: "0.95rem",
                          },
                        }}
                      />
                      {activeSection === item.id && (
                        <motion.div
                          className={styles.activeIndicator}
                          layoutId="activeIndicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Contact Info */}
      <Box className={styles.drawerFooter}>
        <Divider className={styles.divider} />
        <Box className={styles.contactInfo}>
          <Typography variant="caption" className={styles.contactLabel}>
            Get in Touch
          </Typography>

          {/* Contact Details */}
          <Box className={styles.contactDetails}>
            <Box className={styles.unifiedContact}>
              <Box className={styles.unifiedContactHeader}>
                <Icon
                  icon="mdi:phone-in-talk-outline"
                  style={{ color: '#148F77', fontSize: 18 }}
                />
                <span className={styles.unifiedContactNumber}>
                  +91 9181956562
                </span>
              </Box>
              <Box className={styles.unifiedContactActions}>
                <a
                  href="tel:+919181956562"
                  className={`${styles.unifiedActionBtn} ${styles.unifiedActionCall}`}
                  onClick={() =>
                    trackPhoneClick('+919181956562', 'mobile_drawer')
                  }
                  aria-label="Call +91 9181956562"
                >
                  <Icon icon="mdi:phone" style={{ fontSize: 16 }} />
                  <span>Call</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=919181956562&text=Hi%20Doctor%2C%0AI%20want%20to%20check%20if%20i%20am%20suitable%20for%20transplant."
                  className={`${styles.unifiedActionBtn} ${styles.unifiedActionWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('mobile_drawer')}
                  aria-label="Chat on WhatsApp with +91 9181956562"
                >
                  <Icon icon="mdi:whatsapp" style={{ fontSize: 16 }} />
                  <span>WhatsApp</span>
                </a>
              </Box>
            </Box>
            <a
              href="mailto:dr@monjoven.com"
              className={styles.contactDetailItem}
            >
              <Icon icon="mdi:email-outline" style={{ color: '#148F77', fontSize: 18 }} />
              <span>dr@monjoven.com</span>
            </a>
          </Box>

          {/* Book Consultation CTA */}
          <motion.button
            className={styles.bookConsultationCta}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onClose();
              if (onBookConsultation) {
                setTimeout(() => onBookConsultation(), 300);
              }
            }}
          >
            <Icon icon="mdi:calendar-plus" style={{ fontSize: 20 }} />
            <span>Book Consultation</span>
          </motion.button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      swipeAreaWidth={30}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        className: styles.drawerPaper,
        sx: {
          borderRadius: "24px 24px 0 0",
          maxHeight: "85vh",
          overflow: "visible",
        },
      }}
      BackdropProps={{
        className: styles.backdrop,
      }}
    >
      {drawerContent}
    </SwipeableDrawer>
  );
};

export default MobileDrawer;
