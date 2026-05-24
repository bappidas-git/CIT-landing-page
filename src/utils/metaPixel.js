/* ============================================
   Meta Pixel Helper Functions
   Browser-side Meta (Facebook) Pixel tracking.
   Only initializes if REACT_APP_META_PIXEL_ID
   is set in environment variables.
   ============================================ */

import { storeSentEventId } from './eventDedup';

const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID;
const TEST_EVENT_CODE = process.env.REACT_APP_META_TEST_EVENT_CODE;

let isInitialized = false;

/**
 * Initialize Meta Pixel with the given pixel ID
 * Injects the fbevents.js script and initializes the pixel
 * @param {string} [pixelId] - Optional override for pixel ID
 */
export const initPixel = (pixelId) => {
  const id = pixelId || PIXEL_ID;
  if (!id || isInitialized) return;

  // Avoid re-initialization
  if (window.fbq) {
    isInitialized = true;
    return;
  }

  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', id);
  isInitialized = true;

  if (process.env.NODE_ENV === 'development') {
    console.log('[MetaPixel] Initialized with ID:', id);
  }
};

/**
 * Check if Meta Pixel is available
 * @returns {boolean}
 */
const isPixelReady = () => {
  return isInitialized && typeof window.fbq === 'function';
};

/**
 * Track PageView event
 */
export const trackPageView = () => {
  if (!isPixelReady()) return;
  window.fbq('track', 'PageView');
};

/**
 * Track Lead event (browser-side, no PII)
 * @param {Object} leadData - Non-PII lead metadata
 * @param {string} leadData.event_id - Event ID for deduplication
 * @param {string} [leadData.content_name] - Form source identifier
 * @param {string} [leadData.content_category] - Lead category
 */
export const trackLead = (leadData = {}) => {
  if (!isPixelReady()) return;

  const params = {
    content_name: leadData.content_name || 'lead_form',
    content_category: leadData.content_category || 'lead_generation',
  };

  const options = {};
  if (leadData.event_id) {
    options.eventID = leadData.event_id;
    storeSentEventId(leadData.event_id, 'Lead');
  }

  if (TEST_EVENT_CODE) {
    // Test event code is handled by Meta Pixel Helper extension
    // but we log it for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[MetaPixel] Test Event Code:', TEST_EVENT_CODE);
    }
  }

  window.fbq('track', 'Lead', params, options);
};

/**
 * Track ViewContent event
 * @param {Object} contentData - Content data
 * @param {string} [contentData.content_name] - Content name
 * @param {string} [contentData.content_category] - Content category
 * @param {string} [contentData.content_type] - Content type
 * @param {string} [contentData.event_id] - Event ID for deduplication
 */
export const trackViewContent = (contentData = {}) => {
  if (!isPixelReady()) return;

  const params = {
    content_name: contentData.content_name || '',
    content_category: contentData.content_category || '',
    content_type: contentData.content_type || 'product',
  };

  const options = {};
  if (contentData.event_id) {
    options.eventID = contentData.event_id;
    storeSentEventId(contentData.event_id, 'ViewContent');
  }

  window.fbq('track', 'ViewContent', params, options);
};

/**
 * Track Contact event (phone/WhatsApp clicks)
 * @param {Object} [data] - Optional contact data
 * @param {string} [data.event_id] - Event ID for deduplication
 */
export const trackContact = (data = {}) => {
  if (!isPixelReady()) return;

  const options = {};
  if (data.event_id) {
    options.eventID = data.event_id;
    storeSentEventId(data.event_id, 'Contact');
  }

  window.fbq('track', 'Contact', {}, options);
};

/**
 * Track a custom event
 * @param {string} eventName - Custom event name
 * @param {Object} [data] - Event data
 * @param {string} [data.event_id] - Event ID for deduplication
 */
export const trackCustom = (eventName, data = {}) => {
  if (!isPixelReady()) return;

  const { event_id, ...params } = data;
  const options = {};
  if (event_id) {
    options.eventID = event_id;
    storeSentEventId(event_id, eventName);
  }

  window.fbq('trackCustom', eventName, params, options);
};
