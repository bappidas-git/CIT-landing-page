/* ============================================
   Formatters - Landing Page Boilerplate
   Utility functions for formatting data
   ============================================ */

/**
 * Format number to Indian currency format with symbol
 * @param {number} amount - Amount in rupees
 * @param {boolean} showSymbol - Whether to show rupee symbol
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

/**
 * Format number with Indian number system commas
 * @param {number} number - Number to format
 * @returns {string} - Formatted number with commas (e.g., 12,34,567)
 */
export const formatIndianNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  const numStr = Math.abs(number).toString();
  let result = '';

  // Handle decimal part
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with Indian grouping
  if (integerPart.length > 3) {
    // Last 3 digits
    result = integerPart.slice(-3);
    integerPart = integerPart.slice(0, -3);

    // Remaining digits in groups of 2
    while (integerPart.length > 2) {
      result = integerPart.slice(-2) + ',' + result;
      integerPart = integerPart.slice(0, -2);
    }

    if (integerPart.length > 0) {
      result = integerPart + ',' + result;
    }
  } else {
    result = integerPart;
  }

  // Add decimal part if exists
  if (decimalPart) {
    result += '.' + decimalPart;
  }

  // Add negative sign if needed
  if (number < 0) {
    result = '-' + result;
  }

  return result;
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as XXX XXX XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // If has country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
};

/**
 * Format phone number with country code
 * @param {string} phone - Phone number
 * @returns {string} - Phone number with +91
 */
export const formatPhoneWithCountryCode = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+91 ${cleaned}`;
  }

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  return phone;
};

/**
 * Format distance display
 * @param {number} distance - Distance value
 * @param {string} unit - Unit (km, m, mins)
 * @returns {string} - Formatted distance
 */
export const formatDistance = (distance, unit = 'km') => {
  if (!distance || distance <= 0) return '0 ' + unit;

  if (unit === 'km' && distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance} ${unit}`;
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to readable format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const d = new Date(date);

  if (isNaN(d.getTime())) return '';

  const options = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' },
    monthYear: { month: 'long', year: 'numeric' },
  };

  return d.toLocaleDateString('en-IN', options[format] || options.short);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Slugify text for URLs
 * @param {string} text - Text to slugify
 * @returns {string} - URL-safe slug
 */
export const slugify = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default {
  formatCurrency,
  formatIndianNumber,
  formatPhoneNumber,
  formatPhoneWithCountryCode,
  formatDistance,
  formatPercentage,
  formatDate,
  truncateText,
  capitalizeWords,
  slugify,
};
