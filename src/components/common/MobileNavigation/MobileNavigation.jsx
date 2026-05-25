/* ============================================
   MobileNavigation Component
   Bottom sticky navigation bar for mobile devices
   ============================================ */

import React, { useState, useEffect } from "react";
import { IconButton, Typography, Badge } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { trackPhoneClick, trackWhatsAppClick, trackNavigation } from "../../../utils/gtm";
import styles from "./MobileNavigation.module.css";

// Primary CIT admissions contact (Assam Digital campaign)
const PRIMARY_PHONE = "+918069645014";
const PRIMARY_PHONE_DIGITS = "918069645014";
const WHATSAPP_HREF = `https://api.whatsapp.com/send?phone=${PRIMARY_PHONE_DIGITS}&text=Hello%20CIT%2C%20I%27d%20like%20guidance%20on%20Direct%20B.E.%20admission%202026.`;

// Navigation items configuration — CIT admissions actions
const navItems = [
  {
    id: "call",
    label: "Call",
    icon: "mdi:phone",
    color: "#0C2D48",
    action: "call",
    href: `tel:${PRIMARY_PHONE}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "mdi:whatsapp",
    color: "#25D366",
    action: "whatsapp",
    href: WHATSAPP_HREF,
  },
  {
    id: "enquiry",
    label: "Apply",
    icon: "mdi:school-outline",
    color: "#E0301E",
    action: "enquiry",
    badge: true,
    primary: true,
  },
  {
    id: "menu",
    label: "Menu",
    icon: "mdi:menu",
    color: "#0C2D48",
    action: "menu",
  },
];

const MobileNavigation = ({
  onEnquiryClick,
  onMenuClick,
  isDrawerOpen = false,
  showBadge = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeItem, setActiveItem] = useState(null);

  // Hide navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Handle navigation item click
  const handleItemClick = (item) => {
    setActiveItem(item.id);

    // Reset active state after animation
    setTimeout(() => setActiveItem(null), 300);

    switch (item.action) {
      case "whatsapp":
        trackWhatsAppClick('mobile_nav');
        window.open(item.href, "_blank");
        break;
      case "call":
        trackPhoneClick(PRIMARY_PHONE, 'mobile_nav');
        window.open(item.href, "_blank");
        break;
      case "enquiry":
        if (onEnquiryClick) onEnquiryClick();
        break;
      case "menu":
        trackNavigation('mobile_drawer', 'open');
        if (onMenuClick) onMenuClick();
        break;
      default:
        break;
    }
  };

  // Animation variants for the navigation bar
  const navVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    hidden: {
      y: 100,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Animation variants for individual items
  const itemVariants = {
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  // Ripple animation for buttons
  const rippleVariants = {
    initial: {
      scale: 0,
      opacity: 0.5,
    },
    animate: {
      scale: 2.5,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className={styles.mobileNav}
          variants={navVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Safe area background for notched devices */}
          <div className={styles.safeAreaBackground} />

          <div className={styles.navContainer}>
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                className={`${styles.navItem} ${
                  activeItem === item.id ? styles.active : ""
                } ${item.primary ? styles.primaryItem : ""}`}
                variants={itemVariants}
                whileTap="tap"
                whileHover="hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
              >
                <IconButton
                  className={styles.navButton}
                  onClick={() => handleItemClick(item)}
                  aria-label={item.label}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Ripple effect */}
                  <AnimatePresence>
                    {activeItem === item.id && (
                      <motion.span
                        className={styles.ripple}
                        variants={rippleVariants}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0 }}
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon with badge for enquiry */}
                  {item.badge && showBadge ? (
                    <Badge
                      badgeContent=""
                      variant="dot"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: "#F44336",
                          width: 8,
                          height: 8,
                          minWidth: 8,
                        },
                      }}
                    >
                      <Icon
                        icon={item.icon}
                        className={styles.navIcon}
                        style={{ color: item.color }}
                      />
                    </Badge>
                  ) : (
                    <Icon
                      icon={
                        item.id === "menu" && isDrawerOpen
                          ? "mdi:close"
                          : item.icon
                      }
                      className={styles.navIcon}
                      style={{ color: item.color }}
                    />
                  )}
                </IconButton>

                <Typography
                  variant="caption"
                  className={styles.navLabel}
                  sx={{ color: item.color }}
                >
                  {item.label}
                </Typography>
              </motion.div>
            ))}
          </div>

          {/* Decorative top border gradient */}
          <div className={styles.topBorder} />
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigation;
