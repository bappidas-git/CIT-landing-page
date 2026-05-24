/* ============================================
   Modal Component - Landing Page Boilerplate
   Animated modal/dialog with multiple variants
   ============================================ */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showAlert } from '../../../utils/swalHelper';
import styles from './Modal.module.css';
import { useModal } from '../../../context/ModalContext';

// Initialize SweetAlert with React
const MySwal = withReactContent(Swal);

const Modal = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  maxWidth = 'sm', // sm, md, lg, xl, full
  fullScreen = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  footer = null,
  variant = 'default', // default, success, error, warning, info
  ...props
}) => {
  // Use modal context if no direct props
  const modalContext = useModal();
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : modalContext.isOpen;
  const onClose = propsOnClose || modalContext.closeModal;
  const config = modalContext.modalConfig;

  // Use config from context if available
  const finalShowCloseButton = propsIsOpen !== undefined ? showCloseButton : config.showCloseButton;
  const finalCloseOnBackdrop = propsIsOpen !== undefined ? closeOnBackdrop : config.closeOnBackdrop;
  const finalCloseOnEscape = propsIsOpen !== undefined ? closeOnEscape : config.closeOnEscape;
  const finalMaxWidth = propsIsOpen !== undefined ? maxWidth : config.maxWidth;
  const finalFullScreen = propsIsOpen !== undefined ? fullScreen : config.fullScreen;

  // Handle escape key
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && finalCloseOnEscape && isOpen) {
      onClose();
    }
  }, [finalCloseOnEscape, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen, handleEscapeKey]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && finalCloseOnBackdrop) {
      onClose();
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, delay: 0.1 }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  // Build class names
  const modalClassNames = [
    styles.modal,
    styles[`maxWidth${finalMaxWidth.charAt(0).toUpperCase() + finalMaxWidth.slice(1)}`],
    finalFullScreen ? styles.fullScreen : '',
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  // Get variant icon
  const getVariantIcon = () => {
    const icons = {
      success: 'mdi:check-circle',
      error: 'mdi:close-circle',
      warning: 'mdi:alert-circle',
      info: 'mdi:information'
    };
    return icons[variant];
  };

  const modalContent = (
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
            className={modalClassNames}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            {...props}
          >
            {/* Header */}
            {(title || finalShowCloseButton) && (
              <div className={`${styles.header} ${headerClassName}`}>
                {variant !== 'default' && (
                  <div className={`${styles.variantIcon} ${styles[`icon${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}>
                    <Icon icon={getVariantIcon()} />
                  </div>
                )}
                {title && (
                  <h3 id="modal-title" className={styles.title}>
                    {title}
                  </h3>
                )}
                {finalShowCloseButton && (
                  <IconButton
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <Icon icon="mdi:close" />
                  </IconButton>
                )}
              </div>
            )}

            {/* Content */}
            <div className={`${styles.content} ${contentClassName}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`${styles.footer} ${footerClassName}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render in portal
  return createPortal(modalContent, document.body);
};

// SweetAlert helper functions (with z-index fix via showAlert)
export const showSuccessModal = (title, message, buttonText = 'OK') => {
  return showAlert({
    title: title,
    html: message,
    icon: 'success',
    confirmButtonText: buttonText,
    confirmButtonColor: '#1A5276',
    showClass: {
      popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
  });
};

export const showErrorModal = (title, message, buttonText = 'OK') => {
  return showAlert({
    title: title,
    html: message,
    icon: 'error',
    confirmButtonText: buttonText,
    confirmButtonColor: '#F44336',
  });
};

export const showConfirmModal = (title, message, confirmText = 'Yes', cancelText = 'Cancel') => {
  return showAlert({
    title: title,
    html: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#1A5276',
    cancelButtonColor: '#6B7280',
  });
};

export const showInfoModal = (title, message, buttonText = 'Got it') => {
  return showAlert({
    title: title,
    html: message,
    icon: 'info',
    confirmButtonText: buttonText,
    confirmButtonColor: '#1A5276',
  });
};

export const showFormModal = (title, formComponent) => {
  return showAlert({
    title: title,
    html: formComponent,
    showConfirmButton: false,
    showCloseButton: true,
  });
};

export const showLoadingModal = (message = 'Please wait...') => {
  showAlert({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      MySwal.showLoading();
      const container = document.querySelector('.swal2-container');
      if (container) container.style.zIndex = '100000';
    },
  });
};

export const closeLoadingModal = () => {
  MySwal.close();
};

export default Modal;
