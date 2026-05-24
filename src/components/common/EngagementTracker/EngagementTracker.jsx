/* ============================================
   EngagementTracker Component
   Invisible component that tracks user engagement
   signals and pushes them to the GTM dataLayer:
   - Scroll depth milestones
   - Time on page milestones
   - Page visibility changes (tab switches)
   - Form field interactions (focus events)
   ============================================ */

import { useEffect, useRef } from 'react';
import {
  trackScrollDepth,
  trackTimeOnPage,
  trackPageVisibility,
  trackFormFieldFocus,
} from '../../../utils/gtm';

const SCROLL_MILESTONES = [25, 50, 75, 100];
const TIME_MILESTONES = [30, 60, 120, 300];

const EngagementTracker = () => {
  const scrollMilestonesHit = useRef(new Set());
  const timeMilestonesHit = useRef(new Set());
  const trackedFields = useRef(new Set());

  const isEnabled = process.env.REACT_APP_ENABLE_ANALYTICS === 'true';

  // Scroll depth tracking
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

  // Time on page tracking
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

  // Page visibility change tracking (tab switches)
  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      trackPageVisibility(document.visibilityState);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEnabled]);

  // Form field focus tracking
  useEffect(() => {
    if (!isEnabled) return;

    const handleFocusIn = (e) => {
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA'
      ) {
        const form = target.closest('form');
        const formId = form?.id || 'unknown';
        const fieldName = target.name || target.getAttribute('aria-label') || target.placeholder || 'unknown';
        const key = `${formId}:${fieldName}`;

        if (!trackedFields.current.has(key)) {
          trackedFields.current.add(key);
          trackFormFieldFocus(formId, fieldName);
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [isEnabled]);

  // Render nothing — this is a tracking-only component
  return null;
};

export default EngagementTracker;
