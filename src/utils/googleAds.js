/* ============================================
   Google Ads Tracking Helpers
   Browser-side conversion tracking via gtag.js
   for Google Ads campaigns.
   ============================================ */

const GOOGLE_ADS_ID = process.env.REACT_APP_GOOGLE_ADS_ID || '';
const CONVERSION_LABEL = process.env.REACT_APP_GOOGLE_ADS_CONVERSION_LABEL || '';
const DEFAULT_VALUE = parseFloat(process.env.REACT_APP_GOOGLE_ADS_CONVERSION_VALUE) || 0;

/**
 * Initialize Google Ads gtag.js tracking
 * @param {string} [conversionId] - Google Ads conversion ID (e.g., 'AW-XXXXXXXXXX')
 */
export const initGoogleAds = (conversionId) => {
  const adsId = conversionId || GOOGLE_ADS_ID;
  if (!adsId) return;

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Check if gtag.js script is already loaded
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    // Just configure the ads ID
    window.gtag('config', adsId);
    return;
  }

  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', adsId);
};

/**
 * Track a Google Ads conversion event
 * @param {string} [conversionId] - Google Ads conversion ID
 * @param {string} [conversionLabel] - Conversion label from Google Ads
 * @param {number} [value] - Conversion value
 * @param {string} [currency] - Currency code (default: 'INR')
 */
export const trackConversion = (conversionId, conversionLabel, value, currency) => {
  if (typeof window.gtag !== 'function') return;

  const adsId = conversionId || GOOGLE_ADS_ID;
  const label = conversionLabel || CONVERSION_LABEL;
  const convValue = value !== undefined ? value : DEFAULT_VALUE;

  if (!adsId || !label) {
    console.warn('[GoogleAds] Missing conversion ID or label');
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: `${adsId}/${label}`,
    value: convValue,
    currency: currency || 'INR',
  });
};

/**
 * Track a phone call conversion
 * @param {string} [phoneNumber] - Phone number for call tracking
 */
export const trackPhoneConversion = (phoneNumber) => {
  if (typeof window.gtag !== 'function') return;

  const adsId = GOOGLE_ADS_ID;
  if (!adsId) return;

  window.gtag('event', 'conversion', {
    send_to: `${adsId}/${CONVERSION_LABEL}`,
    value: DEFAULT_VALUE,
    currency: 'INR',
    phone_conversion_number: phoneNumber || '',
  });
};

/**
 * Track a form submission as a Google Ads conversion
 * @param {string} [formId] - Form identifier for attribution
 */
export const trackFormSubmission = (formId) => {
  if (typeof window.gtag !== 'function') return;

  const adsId = GOOGLE_ADS_ID;
  const label = CONVERSION_LABEL;

  if (!adsId || !label) return;

  window.gtag('event', 'conversion', {
    send_to: `${adsId}/${label}`,
    value: DEFAULT_VALUE,
    currency: 'INR',
    event_callback: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[GoogleAds] Form conversion tracked: ${formId}`);
      }
    },
  });
};

/**
 * Extract gclid from current URL parameters
 * @returns {string} The gclid value or empty string
 */
export const getGclid = () => {
  try {
    return new URLSearchParams(window.location.search).get('gclid') || '';
  } catch {
    return '';
  }
};

/**
 * Store gclid in localStorage for offline conversion import.
 * Delegates to gclidManager for persistent storage.
 */
export { captureGclid as storeGclid } from './gclidManager';
