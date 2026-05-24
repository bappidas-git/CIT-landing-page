/* ============================================
   App Component - Landing Page Boilerplate
   Main application component with providers,
   lazy loading, and performance optimizations
   ============================================ */

import React, { Suspense, lazy, useEffect, useState, memo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CircularProgress, useMediaQuery, useTheme, Skeleton, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// App Styles
import './App.css';

// Context Providers
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { ModalProvider, useModal } from './context/ModalContext';

// Components (Eager loaded for critical path - Above the fold)
import Header from './components/common/Header/Header';
import HeroSection from './components/sections/HeroSection/HeroSection';
import Footer from './components/common/Footer/Footer';
import Modal from './components/common/Modal/Modal';
import MobileNavigation from './components/common/MobileNavigation/MobileNavigation';
import MobileDrawer from './components/common/MobileDrawer/MobileDrawer';
import LeadFormDrawer from './components/common/LeadFormDrawer/LeadFormDrawer';
import EngagementTracker from './components/common/EngagementTracker/EngagementTracker';
import SEOHead from './components/common/SEO/SEOHead';
import useGTMTracking from './hooks/useGTMTracking';
import { initGTM } from './utils/gtm';
import { initConsentMode } from './utils/consentMode';
import { initPixel, trackPageView as trackMetaPageView } from './utils/metaPixel';
import { captureGclid } from './utils/gclidManager';
import { initGoogleAds } from './utils/googleAds';
import { setupEnhancedConversions } from './utils/enhancedConversions';

// Admin
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminLogin from './admin/components/AdminLogin';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Pages (Lazy loaded)
const ThankYouPage = lazy(() => import('./pages/ThankYou/ThankYou'));
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));

// Lazy loaded sections for performance (Below the fold)
const AboutSection = lazy(() => import('./components/sections/AboutSection/AboutSection'));
const WhyTransplantsFailCTA = lazy(() => import('./components/sections/WhyTransplantsFailCTA/WhyTransplantsFailCTA'));
const ServicesSection = lazy(() => import('./components/sections/ServicesSection/ServicesSection'));
const HighlightsSection = lazy(() => import('./components/sections/HighlightsSection/HighlightsSection'));
const FeaturesSection = lazy(() => import('./components/sections/FeaturesSection/FeaturesSection'));
const LocationSection = lazy(() => import('./components/sections/LocationSection/LocationSection'));
const CTASection = lazy(() => import('./components/sections/CTASection/CTASection'));
const ContactSection = lazy(() => import('./components/sections/ContactSection/ContactSection'));
const SecondaryCTASection = lazy(() => import('./components/sections/SecondaryCTASection/SecondaryCTASection'));

// ===========================================
// Error Boundary Component
// ===========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Section Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            backgroundColor: '#F8F9FA',
            borderRadius: '8px',
            margin: '20px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Something went wrong loading this section.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                backgroundColor: '#148F77',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
          </div>
        </Box>
      );
    }

    return this.props.children;
  }
}

// ===========================================
// Section Loader Component
// ===========================================
const SectionLoader = memo(({ height = 300, variant = 'default' }) => {
  const variants = {
    default: (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: height,
          width: '100%',
          background: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgress
            size={40}
            thickness={3}
            sx={{
              color: '#148F77',
            }}
          />
        </motion.div>
      </Box>
    ),
    skeleton: (
      <Box sx={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton
          variant="text"
          width="30%"
          height={40}
          sx={{ margin: '0 auto 20px', bgcolor: 'rgba(20, 143, 119, 0.1)' }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={60}
          sx={{ margin: '0 auto 30px', bgcolor: 'rgba(20, 143, 119, 0.1)' }}
        />
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={250}
              height={180}
              sx={{ bgcolor: 'rgba(20, 143, 119, 0.05)' }}
            />
          ))}
        </Box>
      </Box>
    ),
    minimal: (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: height,
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#148F77',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      </Box>
    ),
  };

  return variants[variant] || variants.default;
});

SectionLoader.displayName = 'SectionLoader';

// ===========================================
// Scroll Progress Indicator
// ===========================================
const ScrollProgressIndicator = memo(() => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '3px',
        background: 'linear-gradient(90deg, #148F77 0%, #1ABC9C 100%)',
        zIndex: 9999,
        transition: 'width 0.1s ease-out',
      }}
    />
  );
});

ScrollProgressIndicator.displayName = 'ScrollProgressIndicator';

// ===========================================
// Back to Top Button
// ===========================================
const BackToTopButton = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, backgroundColor: '#0E6655' }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#148F77',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
          }}
          aria-label="Back to top"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
});

BackToTopButton.displayName = 'BackToTopButton';

// ===========================================
// Preload Manager - Preload sections on idle
// ===========================================
const useIdlePreload = () => {
  useEffect(() => {
    // Preload sections during idle time
    if ('requestIdleCallback' in window) {
      const sections = [
        () => import('./components/sections/AboutSection/AboutSection'),
        () => import('./components/sections/WhyTransplantsFailCTA/WhyTransplantsFailCTA'),
        () => import('./components/sections/ServicesSection/ServicesSection'),
        () => import('./components/sections/LocationSection/LocationSection'),
        () => import('./components/sections/FeaturesSection/FeaturesSection'),
        () => import('./components/sections/HighlightsSection/HighlightsSection'),
        () => import('./components/sections/CTASection/CTASection'),
        () => import('./components/sections/ContactSection/ContactSection'),
        () => import('./components/sections/SecondaryCTASection/SecondaryCTASection'),
      ];

      let currentIndex = 0;

      const preloadNext = (deadline) => {
        while (deadline.timeRemaining() > 0 && currentIndex < sections.length) {
          sections[currentIndex]();
          currentIndex++;
        }
        if (currentIndex < sections.length) {
          window.requestIdleCallback(preloadNext, { timeout: 2000 });
        }
      };

      const idleId = window.requestIdleCallback(preloadNext, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
  }, []);
};

// ===========================================
// Lead Form Drawer Wrapper
// ===========================================
const LeadFormDrawerWrapper = () => {
  const { isDrawerOpen, drawerConfig, closeLeadDrawer } = useModal();

  return (
    <LeadFormDrawer
      isOpen={isDrawerOpen}
      onClose={closeLeadDrawer}
      title={drawerConfig.title}
      subtitle={drawerConfig.subtitle}
      source={drawerConfig.source}
    />
  );
};

// ===========================================
// Home Page Content Component
// ===========================================
const HomePageContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { openLeadDrawer } = useModal();
  const location = useLocation();

  // Initialize GTM tracking (page views, scroll depth, time on page, section visibility)
  useGTMTracking();

  // Track Meta Pixel PageView on route changes
  useEffect(() => {
    trackMetaPageView();
  }, [location.pathname]);

  const handleMenuClick = () => setIsMobileDrawerOpen(true);
  const handleMobileDrawerClose = () => setIsMobileDrawerOpen(false);
  const handleMobileDrawerOpen = () => setIsMobileDrawerOpen(true);
  const handleEnquiryClick = () => openLeadDrawer('default');

  // Handle hash-based scroll to section (e.g., /#overview, /#floor-plans)
  // Sections are lazy-loaded, so we poll until the target element appears in the DOM
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const targetId = hash.substring(1);
    const headerOffset = 80;
    let cancelled = false;

    const scrollToTarget = () => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        return true;
      }
      return false;
    };

    // Try immediately, then retry with increasing delays to wait for lazy sections
    if (!scrollToTarget()) {
      const retryDelays = [100, 300, 600, 1000, 2000];
      const timers = retryDelays.map((delay) =>
        setTimeout(() => {
          if (!cancelled) scrollToTarget();
        }, delay)
      );
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }
  }, [location.hash]);

  return (
    <>
      {/* Header/Navigation */}
      <Header forceCloseMenu={isMobileDrawerOpen} />

      {/* Main Content */}
      <main id="main-content" className="main-content">
        {/* Hero Section - Critical, loaded immediately */}
        <HeroSection />

        {/* Lazy loaded sections with error boundaries */}
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={400} variant="skeleton" />}>
            <AboutSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={500} variant="default" />}>
            <WhyTransplantsFailCTA />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={400} variant="skeleton" />}>
            <ServicesSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={500} variant="skeleton" />}>
            <HighlightsSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={600} variant="skeleton" />}>
            <FeaturesSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={400} variant="skeleton" />}>
            <LocationSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={300} variant="default" />}>
            <CTASection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={500} variant="skeleton" />}>
            <ContactSection />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<SectionLoader height={500} variant="default" />}>
            <SecondaryCTASection />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <>
          <MobileNavigation
            onMenuClick={handleMenuClick}
            onEnquiryClick={handleEnquiryClick}
            isDrawerOpen={isMobileDrawerOpen}
          />
          <MobileDrawer
            open={isMobileDrawerOpen}
            onClose={handleMobileDrawerClose}
            onOpen={handleMobileDrawerOpen}
            onBookConsultation={handleEnquiryClick}
          />
        </>
      )}

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Global Modal */}
      <Modal />
    </>
  );
};

// ===========================================
// Main App Component
// ===========================================
const App = () => {
  // Enable idle preloading
  useIdlePreload();

  // Initialize Google Consent Mode, GTM, and Meta Pixel on mount
  useEffect(() => {
    initConsentMode();
    const gtmId = process.env.REACT_APP_GTM_ID;
    if (gtmId) {
      initGTM(gtmId);
    }
    // Initialize Meta Pixel (only if REACT_APP_META_PIXEL_ID is set)
    initPixel();
    // Initialize Google Ads conversion tracking
    initGoogleAds();
    // Setup enhanced conversions if enabled
    setupEnhancedConversions();
    // Capture gclid from URL on page load (persists in localStorage)
    captureGclid();
  }, []);

  // Hide initial loader after mount
  useEffect(() => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.classList.add('hidden');
      setTimeout(() => {
        initialLoader.style.display = 'none';
      }, 400); // matches the CSS transition duration
    }
  }, []);

  // Smooth scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Only scroll to top if there's no hash in the URL
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Register service worker for offline capability (if available)
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {
          // Service worker registration failed
        });
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <CustomThemeProvider>
        <ModalProvider>
          <div className="app" id="app-root">
            {/* SEO Head — manages meta tags and schemas per route */}
            <SEOHead />

            {/* Scroll Progress Indicator */}
            <ScrollProgressIndicator />

            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            {/* Routes */}
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<HomePageContent />} />

              {/* Thank You Page */}
              <Route
                path="/thank-you"
                element={
                  <Suspense fallback={<SectionLoader height={400} variant="default" />}>
                    <ThankYouPage />
                  </Suspense>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/login"
                element={
                  <AdminAuthProvider>
                    <AdminLogin />
                  </AdminAuthProvider>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminAuthProvider>
                    <ProtectedRoute>
                      <Suspense fallback={<SectionLoader height={400} variant="default" />}>
                        <AdminLayout />
                      </Suspense>
                    </ProtectedRoute>
                  </AdminAuthProvider>
                }
              />
            </Routes>

            {/* Lead Form Drawer - Available globally */}
            <LeadFormDrawerWrapper />

            {/* Engagement Tracker - Invisible component for analytics */}
            <EngagementTracker />
          </div>
        </ModalProvider>
      </CustomThemeProvider>
    </BrowserRouter>
  );
};

export default App;
