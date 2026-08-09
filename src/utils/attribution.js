/* ============================================
   Attribution Utility
   Captures, stores, and manages Meta click IDs
   (fbclid) and first-touch UTM parameters for
   attribution, mirroring the gclid manager
   pattern (localStorage, 90-day expiry).
   ============================================ */

const ATTRIBUTION_STORAGE_KEY = 'cit_attribution';
const ATTRIBUTION_EXPIRY_DAYS = 90; // Meta click ID validity window

// URL parameters persisted first-touch. fbp/fbc are NOT stored — they are
// read live from the Meta Pixel cookies in getAttribution().
const ATTRIBUTION_PARAMS = [
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string} Cookie value or empty string
 */
const getCookie = (name) => {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
  } catch (error) {
    return '';
  }
};

/**
 * Read the stored attribution record from localStorage.
 * Returns null if absent, unparsable, or expired (older than 90 days).
 * @returns {Object|null} Stored attribution record or null
 */
const readStoredAttribution = () => {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    const capturedAt = parseInt(data.captured_at, 10);
    if (!capturedAt) return null;

    // Check expiry
    const age = Date.now() - capturedAt;
    const maxAge = ATTRIBUTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (age > maxAge) {
      // Expired - clean up
      localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Attribution] Error reading attribution:', error);
    return null;
  }
};

/**
 * Capture fbclid and UTM parameters from the URL and persist them in
 * localStorage under a single record with a `captured_at` timestamp.
 * Should be called once on app load (next to the gclid capture).
 *
 * First-touch: an existing non-expired value is NEVER overwritten — only
 * missing keys are filled in, and `captured_at` keeps the timestamp of the
 * first capture (it anchors the fbc fallback built in getAttribution()).
 *
 * @returns {Object|null} The stored attribution record or null
 */
export const captureAttribution = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = readStoredAttribution();
    const next = { ...(stored || {}) };
    let changed = false;

    ATTRIBUTION_PARAMS.forEach((key) => {
      const incoming = params.get(key);
      if (incoming && !next[key]) {
        next[key] = incoming;
        changed = true;
      }
    });

    if (!changed) return stored;

    if (!next.captured_at) {
      next.captured_at = Date.now();
    }
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('[Attribution] Error capturing attribution:', error);
    return null;
  }
};

/**
 * Get the full attribution snapshot for a lead payload.
 * fbp/fbc are read live from the Meta Pixel `_fbp`/`_fbc` cookies; when the
 * `_fbc` cookie is absent but an fbclid was captured, fbc is rebuilt in
 * Meta's format: `fb.1.<captured_at ms>.<fbclid>`.
 *
 * @returns {{fbclid: string, fbp: string, fbc: string, utm_source: string,
 *   utm_medium: string, utm_campaign: string, utm_term: string,
 *   utm_content: string}}
 */
export const getAttribution = () => {
  const stored = readStoredAttribution() || {};

  const fbp = getCookie('_fbp');
  let fbc = getCookie('_fbc');
  if (!fbc && stored.fbclid && stored.captured_at) {
    fbc = `fb.1.${stored.captured_at}.${stored.fbclid}`;
  }

  return {
    fbclid: stored.fbclid || '',
    fbp: fbp || '',
    fbc: fbc || '',
    utm_source: stored.utm_source || '',
    utm_medium: stored.utm_medium || '',
    utm_campaign: stored.utm_campaign || '',
    utm_term: stored.utm_term || '',
    utm_content: stored.utm_content || '',
  };
};

/**
 * Clear stored attribution (e.g., for testing)
 */
export const clearStoredAttribution = () => {
  try {
    localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch (error) {
    console.error('[Attribution] Error clearing attribution:', error);
  }
};
