/* ============================================
   useGTMTracking Hook
   Automatically tracks page views, scroll depth,
   time on page, and section visibility via GTM.
   ============================================ */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackScrollDepth,
  trackTimeOnPage,
  trackSectionView,
} from '../utils/gtm';

// Section IDs to observe for visibility tracking
const TRACKED_SECTIONS = [
  'home',
  'about',
  'services',
  'highlights',
  'features',
  'location',
  'testimonials',
  'contact',
  'secondary-cta',
];

const SCROLL_MILESTONES = [25, 50, 75, 100];
const TIME_MILESTONES = [30, 60, 120, 300]; // seconds

/**
 * Custom hook for automatic GTM event tracking.
 * Tracks page views, scroll depth, time on page, and section visibility.
 */
const useGTMTracking = () => {
  const location = useLocation();
  const scrollMilestonesHit = useRef(new Set());
  const timeMilestonesHit = useRef(new Set());
  const sectionsViewed = useRef(new Set());

  const isEnabled = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

  // Track page views on route changes
  useEffect(() => {
    if (!isEnabled) return;
    trackPageView(location.pathname, document.title);
  }, [location.pathname, isEnabled]);

  // Track scroll depth
  useEffect(() => {
    if (!isEnabled) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of SCROLL_MILESTONES) {
        if (scrollPercent >= milestone && !scrollMilestonesHit.current.has(milestone)) {
          scrollMilestonesHit.current.add(milestone);
          trackScrollDepth(milestone);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isEnabled]);

  // Track time on page
  useEffect(() => {
    if (!isEnabled) return;

    const timers = TIME_MILESTONES.map((seconds) =>
      setTimeout(() => {
        if (!timeMilestonesHit.current.has(seconds)) {
          timeMilestonesHit.current.add(seconds);
          trackTimeOnPage(seconds);
        }
      }, seconds * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, [isEnabled]);

  // Track section visibility using IntersectionObserver
  useEffect(() => {
    if (!isEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !sectionsViewed.current.has(entry.target.id)) {
            sectionsViewed.current.add(entry.target.id);
            trackSectionView(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe sections with a delay to allow lazy-loaded sections to mount
    const timeoutId = setTimeout(() => {
      TRACKED_SECTIONS.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [isEnabled]);
};

export default useGTMTracking;
