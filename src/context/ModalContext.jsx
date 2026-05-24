/* ============================================
   Modal Context
   Handles modal state management across the app
   ============================================ */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { trackCTAClick } from '../utils/gtm';

// Create context
const ModalContext = createContext(null);

// Modal types enum
export const MODAL_TYPES = {
  LEAD_FORM: 'LEAD_FORM',
  SITE_VISIT: 'SITE_VISIT',
  CALLBACK: 'CALLBACK',
  BROCHURE: 'BROCHURE',
  FLOOR_PLAN: 'FLOOR_PLAN',
  GALLERY: 'GALLERY',
  VIDEO: 'VIDEO',
  SUCCESS: 'SUCCESS',
  CUSTOM: 'CUSTOM',
};

// Drawer title mapping based on source/context
// CIT — Direct B.E. Engineering Admissions 2026 drawer title configuration
export const DRAWER_TITLES = {
  'apply-now': {
    title: 'Apply for 2026 Admission',
    subtitle: 'Share your details — our team will guide you',
  },
  'get-details': {
    title: 'Get Admission Details',
    subtitle: 'Courses, fees, hostel & placements',
  },
  'request-callback': {
    title: 'Request a Callback',
    subtitle: 'Our admission team will call you',
  },
  'book-meeting': {
    title: 'Talk to an Admission Counsellor',
    subtitle: 'Book a free counselling call',
  },
  'download-brochure': {
    title: 'Download CIT Brochure',
    subtitle: 'Get the full 2026 prospectus',
  },
  'fees-scholarship': {
    title: 'Fees & Scholarship Info',
    subtitle: 'Get the latest 2026 fee structure and scholarship details',
  },
  'default': {
    title: 'Enquire About Admission',
    subtitle: "Fill the form — we'll assist you",
  },
};

// Provider component
export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    showCloseButton: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    fullScreen: false,
    maxWidth: 'sm',
  });

  // Lead Form Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerConfig, setDrawerConfig] = useState({
    title: DRAWER_TITLES.default.title,
    subtitle: DRAWER_TITLES.default.subtitle,
    source: 'general',
  });

  // Open modal with type and optional data
  const openModal = useCallback((type, data = null, config = {}) => {
    setModalType(type);
    setModalData(data);
    setModalConfig((prev) => ({ ...prev, ...config }));
    setIsOpen(true);
    // Prevent body scroll when modal is open
    // Save current scroll position before locking body
    const scrollY = window.scrollY;
    document.body.dataset.modalScrollY = scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('modal-open');
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalType(null);
    setModalData(null);
    setModalConfig({
      showCloseButton: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      fullScreen: false,
      maxWidth: 'sm',
    });
    // Restore body scroll
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    // Restore scroll position after unlocking body
    const scrollY = document.body.dataset.modalScrollY;
    document.body.style.top = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY, 10));
      delete document.body.dataset.modalScrollY;
    }
  }, []);

  // Update modal data
  const updateModalData = useCallback((data) => {
    setModalData((prev) => ({ ...prev, ...data }));
  }, []);

  // Shorthand methods for common modals
  const openLeadForm = useCallback((data) => {
    openModal(MODAL_TYPES.LEAD_FORM, data);
  }, [openModal]);

  const openSiteVisit = useCallback((data) => {
    openModal(MODAL_TYPES.SITE_VISIT, data);
  }, [openModal]);

  const openCallback = useCallback((data) => {
    openModal(MODAL_TYPES.CALLBACK, data);
  }, [openModal]);

  const openBrochure = useCallback((data) => {
    openModal(MODAL_TYPES.BROCHURE, data);
  }, [openModal]);

  const openFloorPlan = useCallback((data) => {
    openModal(MODAL_TYPES.FLOOR_PLAN, data, { maxWidth: 'md' });
  }, [openModal]);

  const openGallery = useCallback((data) => {
    openModal(MODAL_TYPES.GALLERY, data, { fullScreen: true, maxWidth: 'lg' });
  }, [openModal]);

  const openVideo = useCallback((data) => {
    openModal(MODAL_TYPES.VIDEO, data, { maxWidth: 'md' });
  }, [openModal]);

  const showSuccess = useCallback((message, title = 'Success') => {
    openModal(MODAL_TYPES.SUCCESS, { message, title });
  }, [openModal]);

  // Open lead form drawer with specific title based on context
  const openLeadDrawer = useCallback((titleKey = 'default', extraData = {}) => {
    const titleConfig = DRAWER_TITLES[titleKey] || DRAWER_TITLES.default;
    setDrawerConfig({
      title: extraData.title || titleConfig.title,
      subtitle: extraData.subtitle || titleConfig.subtitle,
      source: titleKey,
      ...extraData,
    });
    setIsDrawerOpen(true);
    // Track which CTA triggered the drawer
    trackCTAClick(`drawer_${titleKey}`, 'drawer', titleConfig.title);
    // Save current scroll position before locking body
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('drawer-open');
  }, []);

  // Close lead form drawer
  const closeLeadDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    document.body.classList.remove('drawer-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    // Restore scroll position after unlocking body
    const scrollY = document.body.dataset.scrollY;
    document.body.style.top = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY, 10));
      delete document.body.dataset.scrollY;
    }
  }, []);

  const value = {
    // State
    isOpen,
    modalType,
    modalData,
    modalConfig,
    // Drawer State
    isDrawerOpen,
    drawerConfig,
    // Actions
    openModal,
    closeModal,
    updateModalData,
    // Drawer Actions
    openLeadDrawer,
    closeLeadDrawer,
    // Shorthand methods
    openLeadForm,
    openSiteVisit,
    openCallback,
    openBrochure,
    openFloorPlan,
    openGallery,
    openVideo,
    showSuccess,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
