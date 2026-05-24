/* ============================================
   LeadFormDrawer Component
   Full-width side drawer from left with lead form
   Uses UnifiedLeadForm for consistent functionality
   ============================================ */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import UnifiedLeadForm from '../UnifiedLeadForm/UnifiedLeadForm';
import styles from './LeadFormDrawer.module.css';

const LeadFormDrawer = ({
  isOpen,
  onClose,
  title = 'Book Your Consultation',
  subtitle = 'Fill in your details and our specialist will contact you',
  source = 'general',
  onSubmitSuccess,
}) => {
  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const drawerVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeInOut' },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.4 },
    },
  };

  const drawerContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            className={styles.drawer}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* Close Button */}
            <IconButton
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close drawer"
            >
              <Icon icon="mdi:close" />
            </IconButton>

            {/* Drawer Content */}
            <div className={styles.drawerContent}>
              {/* Header */}
              <motion.div
                className={styles.header}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <div className={styles.headerIcon}>
                  <Icon icon="mdi:stethoscope" />
                </div>
                <Typography variant="h4" id="drawer-title" className={styles.title}>
                  {title}
                </Typography>
                <Typography className={styles.subtitle} sx={{ color: '#FFFFFFB3 !important' }}>
                  {subtitle}
                </Typography>
              </motion.div>

              {/* Unified Lead Form */}
              <UnifiedLeadForm
                variant="drawer"
                source={source}
                showTitle={false}
                showSubtitle={false}
                showCourseFields={true}
                showTrustBadges={true}
                showConsent={true}
                showPhoneButton={true}
                submitButtonText="Book Consultation"
                onClose={onClose}
                onSubmitSuccess={onSubmitSuccess}
                formId={`drawer-form-${source}`}
              />
            </div>

            {/* Decorative Elements */}
            <div className={styles.decorativeCircle1} />
            <div className={styles.decorativeCircle2} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
};

export default LeadFormDrawer;
