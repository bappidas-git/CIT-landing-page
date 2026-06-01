/* ============================================
   GCLID Manager Utility
   Captures, stores, and manages Google Click IDs
   for offline conversion tracking and attribution.
   ============================================ */

const GCLID_STORAGE_KEY = 'gads_gclid';
const GCLID_TIMESTAMP_KEY = 'gads_gclid_timestamp';
const GCLID_EXPIRY_DAYS = 90; // Google Ads click ID validity period

/**
 * Capture gclid from URL parameters and store in localStorage.
 * Should be called on every page load to catch gclid from Google Ads clicks.
 * @returns {string|null} The captured gclid or null if not present
 */
export const captureGclid = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');

    if (gclid) {
      localStorage.setItem(GCLID_STORAGE_KEY, gclid);
      localStorage.setItem(GCLID_TIMESTAMP_KEY, Date.now().toString());
      return gclid;
    }
  } catch (error) {
    console.error('[GclidManager] Error capturing gclid:', error);
  }
  return null;
};

/**
 * Get the stored gclid from localStorage.
 * Returns null if expired (older than 90 days).
 * @returns {string|null} Stored gclid or null
 */
export const getStoredGclid = () => {
  try {
    const gclid = localStorage.getItem(GCLID_STORAGE_KEY);
    const timestamp = localStorage.getItem(GCLID_TIMESTAMP_KEY);

    if (!gclid || !timestamp) return null;

    // Check expiry
    const age = Date.now() - parseInt(timestamp, 10);
    const maxAge = GCLID_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (age > maxAge) {
      // Expired - clean up
      localStorage.removeItem(GCLID_STORAGE_KEY);
      localStorage.removeItem(GCLID_TIMESTAMP_KEY);
      return null;
    }

    return gclid;
  } catch (error) {
    console.error('[GclidManager] Error reading gclid:', error);
    return null;
  }
};

/**
 * Clear stored gclid (e.g., after successful conversion)
 */
export const clearStoredGclid = () => {
  try {
    localStorage.removeItem(GCLID_STORAGE_KEY);
    localStorage.removeItem(GCLID_TIMESTAMP_KEY);
  } catch (error) {
    console.error('[GclidManager] Error clearing gclid:', error);
  }
};
