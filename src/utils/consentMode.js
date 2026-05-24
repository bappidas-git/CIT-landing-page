/* ============================================
   Google Consent Mode v2
   Basic setup for consent management.
   Defaults to denied for analytics and ads.
   Update consent state when user grants permission
   via a cookie consent banner (to be integrated).
   ============================================ */

/**
 * Initialize Google Consent Mode v2 with default denied state.
 * Call this BEFORE loading GTM to ensure consent is set before any tags fire.
 */
export const initConsentMode = () => {
  if (process.env.REACT_APP_ENABLE_CONSENT_MODE !== 'true') return;

  window.dataLayer = window.dataLayer || [];

  // gtag helper that pushes to dataLayer
  function gtag() {
    window.dataLayer.push(arguments);
  }

  // Set default consent to denied
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });
};

/**
 * Update consent state when the user grants permission.
 * Call this from your cookie consent banner's "Accept" handler.
 * @param {Object} consentState - Consent preferences
 * @param {boolean} consentState.analytics - Allow analytics tracking
 * @param {boolean} consentState.ads - Allow ad tracking & personalization
 * @param {boolean} consentState.personalization - Allow personalization
 */
export const updateConsent = ({ analytics = false, ads = false, personalization = false } = {}) => {
  if (process.env.REACT_APP_ENABLE_CONSENT_MODE !== 'true') return;

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  gtag('consent', 'update', {
    ad_storage: ads ? 'granted' : 'denied',
    ad_user_data: ads ? 'granted' : 'denied',
    ad_personalization: personalization ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied',
    personalization_storage: personalization ? 'granted' : 'denied',
  });
};

/**
 * Grant all consent categories.
 * Convenience function for "Accept All" button.
 */
export const grantAllConsent = () => {
  updateConsent({ analytics: true, ads: true, personalization: true });
};

/**
 * Deny all optional consent categories.
 * Convenience function for "Reject All" button.
 */
export const denyAllConsent = () => {
  updateConsent({ analytics: false, ads: false, personalization: false });
};
