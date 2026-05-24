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
 * Associate a stored gclid with a specific lead ID.
 * Updates the lead in localStorage with the gclid if not already present.
 * @param {string} leadId - The lead ID to associate
 * @returns {boolean} True if gclid was associated
 */
export const associateGclidWithLead = (leadId) => {
  try {
    const gclid = getStoredGclid();
    if (!gclid || !leadId) return false;

    const LEADS_KEY = 'lp_submitted_leads';
    const TEST_LEADS_KEY = 'lp_test_leads';

    // Check both prod and test leads
    for (const key of [LEADS_KEY, TEST_LEADS_KEY]) {
      const leads = JSON.parse(localStorage.getItem(key) || '[]');
      const lead = leads.find((l) => l.lead_id === leadId);

      if (lead) {
        if (!lead.gclid) {
          lead.gclid = gclid;
          localStorage.setItem(key, JSON.stringify(leads));
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[GclidManager] Error associating gclid:', error);
    return false;
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
