/* ============================================
   Meta Conversions API (CAPI) Frontend Utility
   Sends server-side events via the CAPI proxy
   endpoint for enhanced tracking and
   event deduplication.
   ============================================ */

import { generateEventId, storeSentEventId } from './eventDedup';

const CAPI_ENDPOINT = process.env.REACT_APP_META_CAPI_ENDPOINT || '/api/meta-capi.php';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * SHA-256 hash a value (for PII hashing before sending to CAPI)
 * @param {string} value - The value to hash
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export const hashData = async (value) => {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Get the CAPI proxy URL
 * @returns {string}
 */
const getCapiUrl = () => {
  return `${API_BASE_URL}${CAPI_ENDPOINT}`;
};

/**
 * Get user data for CAPI (browser context info)
 * @returns {Object} User data object
 */
const getUserData = () => {
  return {
    client_user_agent: navigator.userAgent,
    client_ip_address: '', // Will be filled by server from request
    fbc: getCookie('_fbc') || '',
    fbp: getCookie('_fbp') || '',
  };
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string} Cookie value or empty string
 */
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
};

/**
 * Send a Lead event to Meta CAPI
 * @param {Object} leadData - Lead form data
 * @param {string} leadData.name - Lead's full name
 * @param {string} leadData.email - Lead's email
 * @param {string} leadData.mobile - Lead's phone number
 * @param {string} [leadData.event_id] - Event ID for deduplication (auto-generated if not provided)
 * @param {string} [leadData.source] - Form source identifier
 * @returns {Promise<{success: boolean, message: string, event_id: string}>}
 */
export const sendLeadEvent = async (leadData) => {
  const eventId = leadData.event_id || generateEventId();

  try {
    const [hashedEmail, hashedPhone, hashedName] = await Promise.all([
      hashData(leadData.email),
      hashData(leadData.mobile),
      hashData(leadData.name),
    ]);

    const payload = {
      event_name: 'Lead',
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      user_data: {
        ...getUserData(),
        em: hashedEmail,
        ph: hashedPhone,
        fn: hashedName,
      },
      custom_data: {
        content_name: leadData.source || 'lead_form',
        content_category: 'lead_generation',
        lead_source: leadData.source || '',
      },
    };

    const response = await fetch(getCapiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      storeSentEventId(eventId, 'Lead');
      return { success: true, message: 'Lead event sent to CAPI', event_id: eventId };
    }

    console.error('[MetaCAPI] Lead event failed:', response.status);
    return { success: false, message: 'CAPI request failed', event_id: eventId };
  } catch (error) {
    console.error('[MetaCAPI] Lead event error:', error);
    return { success: false, message: error.message, event_id: eventId };
  }
};

/**
 * Send a conversion event to Meta CAPI (e.g., when admin marks lead as converted)
 * @param {Object} leadData - Original lead data (will be hashed)
 * @param {Object} conversionData - Conversion details
 * @param {number} conversionData.value - Conversion value in currency
 * @param {string} [conversionData.currency] - Currency code (default: INR)
 * @param {string} [conversionData.conversion_type] - Type of conversion
 * @param {string} [conversionData.event_id] - Event ID for deduplication
 * @returns {Promise<{success: boolean, message: string, event_id: string}>}
 */
export const sendConversionEvent = async (leadData, conversionData = {}) => {
  const eventId = conversionData.event_id || generateEventId();

  try {
    const [hashedEmail, hashedPhone, hashedName] = await Promise.all([
      hashData(leadData.email),
      hashData(leadData.mobile),
      hashData(leadData.name),
    ]);

    const payload = {
      event_name: 'Purchase',
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: window.location.href,
      user_data: {
        ...getUserData(),
        em: hashedEmail,
        ph: hashedPhone,
        fn: hashedName,
      },
      custom_data: {
        value: conversionData.value || 0,
        currency: conversionData.currency || 'INR',
        content_name: conversionData.conversion_type || 'lead_converted',
        content_category: 'conversion',
      },
    };

    const response = await fetch(getCapiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      storeSentEventId(eventId, 'Purchase');
      return { success: true, message: 'Conversion event sent to CAPI', event_id: eventId };
    }

    console.error('[MetaCAPI] Conversion event failed:', response.status);
    return { success: false, message: 'CAPI request failed', event_id: eventId };
  } catch (error) {
    console.error('[MetaCAPI] Conversion event error:', error);
    return { success: false, message: error.message, event_id: eventId };
  }
};

// Re-export generateEventId for convenience
export { generateEventId } from './eventDedup';
