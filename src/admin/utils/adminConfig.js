/* ============================================
   Admin Panel Configuration
   Reads from webhookSubmit.js config and provides
   helper functions for mode detection and data cleanup.
   ============================================ */

// Import mode flags from webhook config
import { getConfig } from '../../utils/webhookSubmit';

/**
 * Check if admin is running in Pabbly mode
 */
export const isPabblyMode = () => {
  const config = getConfig();
  return config.USE_PABBLY === true && config.DUMMY_MODE === false;
};

/**
 * Check if admin is running in dummy/test mode
 */
export const isDummyMode = () => {
  const config = getConfig();
  return config.DUMMY_MODE === true || config.USE_PABBLY === false;
};

/**
 * Clear all test/dummy data from localStorage
 * Called when switching from DUMMY_MODE to USE_PABBLY
 */
export const clearTestData = () => {
  const keysToClean = [
    'lp_test_leads',
    'lp_submitted_leads',
  ];
  keysToClean.forEach(key => localStorage.removeItem(key));
  console.log('[AdminConfig] Test data cleared from localStorage');
};

/**
 * Initialize admin panel — check mode and clean up if needed
 */
export const initAdminConfig = () => {
  if (isPabblyMode()) {
    // In Pabbly mode, clear any leftover test leads
    const testLeads = localStorage.getItem('lp_test_leads');
    if (testLeads && JSON.parse(testLeads).length > 0) {
      localStorage.removeItem('lp_test_leads');
      console.log('[AdminConfig] Cleared leftover test leads (Pabbly mode active)');
    }
  }
};
