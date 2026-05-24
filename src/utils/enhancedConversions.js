/* ============================================
   Enhanced Conversions Utility
   SHA-256 hashing of user data and enhanced
   conversion setup for Google Ads.
   ============================================ */

const ENHANCED_CONVERSIONS_ENABLED =
  process.env.REACT_APP_GOOGLE_ADS_ENHANCED_CONVERSIONS === 'true';

/**
 * SHA-256 hash a value for enhanced conversions
 * @param {string} value - The value to hash
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
const sha256Hash = async (value) => {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash user data (email, phone, name) with SHA-256
 * @param {string} email - User email
 * @param {string} phone - User phone number
 * @param {string} name - User full name
 * @returns {Promise<Object>} Hashed user data object
 */
export const hashUserData = async (email, phone, name) => {
  const [hashedEmail, hashedPhone, hashedFirstName] = await Promise.all([
    sha256Hash(email),
    sha256Hash(phone),
    sha256Hash(name?.split(' ')[0] || ''),
  ]);

  // Also hash last name if available
  const nameParts = (name || '').trim().split(' ');
  const hashedLastName = nameParts.length > 1
    ? await sha256Hash(nameParts.slice(1).join(' '))
    : '';

  return {
    email: hashedEmail,
    phone_number: hashedPhone,
    first_name: hashedFirstName,
    last_name: hashedLastName,
  };
};

/**
 * Send enhanced conversion data to Google via gtag
 * @param {Object} hashedData - Hashed user data from hashUserData()
 */
export const sendEnhancedConversion = (hashedData) => {
  if (!ENHANCED_CONVERSIONS_ENABLED) return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('set', 'user_data', {
    sha256_email_address: hashedData.email,
    sha256_phone_number: hashedData.phone_number,
    address: {
      sha256_first_name: hashedData.first_name,
      sha256_last_name: hashedData.last_name,
    },
  });
};

/**
 * Configure gtag for enhanced conversions and push to GTM dataLayer
 */
export const setupEnhancedConversions = () => {
  if (!ENHANCED_CONVERSIONS_ENABLED) return;

  // Configure gtag for enhanced conversions
  if (typeof window.gtag === 'function') {
    const adsId = process.env.REACT_APP_GOOGLE_ADS_ID;
    if (adsId) {
      window.gtag('config', adsId, {
        allow_enhanced_conversions: true,
      });
    }
  }

  // Push enhanced conversion config to GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'enhanced_conversions_config',
    enhanced_conversions_enabled: true,
  });
};

/**
 * Full pipeline: hash user data, send enhanced conversion, and push to dataLayer
 * @param {string} email - User email
 * @param {string} phone - User phone
 * @param {string} name - User name
 * @returns {Promise<Object>} Hashed data that was sent
 */
export const sendEnhancedConversionData = async (email, phone, name) => {
  if (!ENHANCED_CONVERSIONS_ENABLED) return null;

  const hashedData = await hashUserData(email, phone, name);

  // Send to gtag
  sendEnhancedConversion(hashedData);

  // Also push to GTM dataLayer for enhanced conversion variables
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'enhanced_conversion_data',
    enhanced_conversion_data: {
      email: hashedData.email,
      phone_number: hashedData.phone_number,
      first_name: hashedData.first_name,
      last_name: hashedData.last_name,
    },
  });

  return hashedData;
};
