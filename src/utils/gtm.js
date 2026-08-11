/* ============================================
   GTM (Google Tag Manager) Helper Functions
   Provides utilities for pushing events to
   the GTM dataLayer for analytics tracking.
   ============================================ */

/**
 * Check if analytics tracking is enabled via env variable
 */
const isAnalyticsEnabled = () => {
  return process.env.REACT_APP_ENABLE_ANALYTICS === 'true';
};

/**
 * Initialize GTM programmatically (supplements the snippet in index.html)
 * @param {string} gtmId - GTM container ID (e.g., 'GTM-XXXXXXX')
 */
export const initGTM = (gtmId) => {
  if (!gtmId || !isAnalyticsEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  // Only inject if not already present
  if (document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.insertBefore(script, document.head.firstChild);
};

/**
 * Push a custom event with data to the dataLayer
 * @param {string} event - Event name
 * @param {Object} data - Additional event data
 */
export const pushDataLayer = (event, data = {}) => {
  if (!isAnalyticsEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data,
  });
};

/**
 * Track a virtual pageview
 * @param {string} pagePath - Page path (e.g., '/thank-you')
 * @param {string} pageTitle - Page title
 */
export const trackPageView = (pagePath, pageTitle) => {
  pushDataLayer('virtual_pageview', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * Track form submission (no PII)
 * @param {string} formId - Form identifier (e.g., 'hero-form', 'drawer-form')
 * @param {Object} formData - Non-PII form metadata
 */
export const trackFormSubmission = (formId, formData = {}) => {
  pushDataLayer('lead_form_submission', {
    formSource: formId,
    // Callers pass the course as `serviceInterest`; the dataLayer key keeps
    // its legacy name so existing GTM variables/triggers stay valid.
    investmentInterest: formData.serviceInterest || formData.investmentInterest || '',
  });

  // Also push the GA4 generate_lead event for conversion tracking
  pushDataLayer('generate_lead', {
    currency: 'INR',
    value: 0,
    lead_source: formId,
    method: 'form_submission',
  });
};

/**
 * Track a step event in the /apply multi-step application funnel.
 * Generic passthrough to the gated dataLayer helper so the application form
 * can push its own funnel events (step views, step completions, and the
 * intake-year dimension that `trackFormSubmission` deliberately does not carry).
 * @param {string} eventName - Event name (e.g., 'application_step_view')
 * @param {Object} data - Non-PII event data (e.g., { step, step_name })
 */
export const trackApplicationStep = (eventName, data = {}) => {
  if (!eventName) return;
  pushDataLayer(eventName, data);
};

/**
 * Track CTA button click
 * @param {string} ctaName - CTA identifier (e.g., 'hero_primary_cta')
 * @param {string} ctaLocation - Section where the CTA is located
 * @param {string} ctaText - Button text
 */
export const trackCTAClick = (ctaName, ctaLocation, ctaText = '') => {
  pushDataLayer('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    cta_text: ctaText,
  });
};

/**
 * Track the first-visit admission notice popup.
 *
 * One event name, so the GTM container needs a single trigger: the stage rides
 * in `notice_action` ('view' | 'dismiss' | 'cta') and, on a dismiss, how it was
 * closed. The CTA also fires the usual `cta_click` through useApplyCTA, so
 * `admission_notice` is purely the popup's own funnel. No PII.
 *
 * @param {string} action - 'view' | 'dismiss' | 'cta'
 * @param {Object} data - Extra non-PII data (e.g. { dismiss_method: 'escape' })
 */
export const trackAdmissionNotice = (action, data = {}) => {
  pushDataLayer('admission_notice', {
    notice_action: action,
    ...data,
  });
};

/**
 * Track phone number link click
 * @param {string} phoneNumber - Phone number clicked
 * @param {string} location - Where the click occurred
 */
export const trackPhoneClick = (phoneNumber, location = '') => {
  pushDataLayer('phone_click', {
    phone_number: phoneNumber,
    click_location: location,
  });
};

/**
 * Track WhatsApp link click
 * @param {string} location - Where the click occurred
 */
export const trackWhatsAppClick = (location = '') => {
  pushDataLayer('whatsapp_click', {
    click_location: location,
  });
};

/**
 * Track scroll depth milestones
 * @param {number} percentage - Scroll depth percentage (25, 50, 75, 100)
 */
export const trackScrollDepth = (percentage) => {
  pushDataLayer('scroll_depth', {
    scroll_percentage: percentage,
  });
};

/**
 * Track time on page milestones
 * @param {number} seconds - Time in seconds (30, 60, 120, 300)
 */
export const trackTimeOnPage = (seconds) => {
  pushDataLayer('time_on_page', {
    time_seconds: seconds,
    time_label: seconds >= 60 ? `${Math.floor(seconds / 60)}m` : `${seconds}s`,
  });
};

/**
 * Track when a page section enters the viewport
 * @param {string} sectionId - Section element ID
 */
export const trackSectionView = (sectionId) => {
  pushDataLayer('section_view', {
    section_id: sectionId,
  });
};

/**
 * Track navigation events
 * @param {string} navType - Navigation type ('desktop_nav', 'mobile_menu', 'mobile_drawer')
 * @param {string} action - Action taken ('open', 'close', 'click')
 * @param {string} label - Link label or menu item
 */
export const trackNavigation = (navType, action, label = '') => {
  pushDataLayer('navigation', {
    nav_type: navType,
    nav_action: action,
    nav_label: label,
  });
};

/**
 * Track page visibility changes (tab switches)
 * @param {string} state - 'visible' or 'hidden'
 */
export const trackPageVisibility = (state) => {
  pushDataLayer('page_visibility', {
    visibility_state: state,
  });
};

/**
 * Track form field interactions (focus)
 * @param {string} formId - Form identifier
 * @param {string} fieldName - Field that received focus
 */
export const trackFormFieldFocus = (formId, fieldName) => {
  pushDataLayer('form_field_focus', {
    form_id: formId,
    field_name: fieldName,
  });
};
