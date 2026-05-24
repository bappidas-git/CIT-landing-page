/* ============================================
   Admin Auth Helper Functions
   ============================================ */

const AUTH_STORAGE_KEY = 'admin_auth';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get stored auth data from localStorage
 */
export const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const now = Date.now();

    // Check session expiry
    if (data.expiresAt && now > data.expiresAt) {
      clearStoredAuth();
      return null;
    }

    return data;
  } catch {
    clearStoredAuth();
    return null;
  }
};

/**
 * Store auth data in localStorage
 */
export const setStoredAuth = (username, rememberMe = false) => {
  const data = {
    username,
    token: generateToken(),
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_TIMEOUT,
    rememberMe,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  return data;
};

/**
 * Clear auth data from localStorage
 */
export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

/**
 * Validate credentials against env vars or defaults
 */
export const validateCredentials = (username, password) => {
  const validUsername = process.env.REACT_APP_ADMIN_USERNAME || 'monjoven';
  const validPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'monjoven@2026vip';
  return username === validUsername && password === validPassword;
};

/**
 * Generate a simple session token
 */
const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
};
