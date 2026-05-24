/* ============================================
   Event Deduplication System
   Generates unique event IDs and manages
   deduplication between browser pixel and
   server-side CAPI calls.
   ============================================ */

const SESSION_STORAGE_KEY = 'meta_sent_event_ids';

/**
 * Generate a unique event ID for deduplication
 * @returns {string} Unique event ID
 */
export const generateEventId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `evt_${timestamp}_${randomPart}`;
};

/**
 * Store a sent event ID in sessionStorage
 * @param {string} eventId - The event ID to store
 * @param {string} eventName - The event name (e.g., 'Lead', 'PageView')
 */
export const storeSentEventId = (eventId, eventName) => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '[]');
    stored.push({
      event_id: eventId,
      event_name: eventName,
      timestamp: Date.now(),
    });
    // Keep only last 100 events to prevent storage bloat
    const trimmed = stored.slice(-100);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('[EventDedup] Error storing event ID:', error);
  }
};

/**
 * Check if an event ID has already been sent
 * @param {string} eventId - The event ID to check
 * @returns {boolean} True if the event was already sent
 */
export const isEventSent = (eventId) => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '[]');
    return stored.some((entry) => entry.event_id === eventId);
  } catch {
    return false;
  }
};

/**
 * Get all sent event IDs (for debugging)
 * @returns {Array} Array of sent event entries
 */
export const getSentEvents = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};
