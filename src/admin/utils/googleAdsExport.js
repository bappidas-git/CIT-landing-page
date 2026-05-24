/* ============================================
   Google Ads Offline Conversion Export
   Generates CSV files in Google Ads offline
   conversion import format for manual upload.
   ============================================ */

/**
 * Export converted leads with gclid as a Google Ads offline conversion CSV.
 * Only includes leads with status "converted" that have a gclid.
 *
 * Google Ads offline conversion CSV format:
 * - Google Click ID
 * - Conversion Name
 * - Conversion Time
 * - Conversion Value
 * - Conversion Currency
 *
 * @param {Array} leads - Array of lead objects from localStorage
 * @param {Object} [options] - Export options
 * @param {string} [options.conversionName] - Name of the conversion action in Google Ads (default: 'Offline Lead Conversion')
 * @param {number} [options.defaultValue] - Default conversion value (default: 0)
 * @param {string} [options.currency] - Currency code (default: 'INR')
 * @returns {{ exported: number, skipped: number }} Export result counts
 */
export const exportGoogleAdsCSV = (leads, options = {}) => {
  const {
    conversionName = 'Offline Lead Conversion',
    defaultValue = 0,
    currency = 'INR',
  } = options;

  // Filter: only converted leads with a gclid
  const eligibleLeads = leads.filter(
    (lead) => lead.status === 'converted' && lead.gclid
  );

  const skipped = leads.filter(
    (lead) => lead.status === 'converted' && !lead.gclid
  ).length;

  if (eligibleLeads.length === 0) {
    return { exported: 0, skipped };
  }

  // Google Ads required headers
  const headers = [
    'Google Click ID',
    'Conversion Name',
    'Conversion Time',
    'Conversion Value',
    'Conversion Currency',
  ];

  const escapeCSV = (val) => {
    const str = String(val || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  /**
   * Format date for Google Ads: "yyyy-MM-dd HH:mm:ss+TZ"
   * Google Ads requires the conversion time in a specific format.
   */
  const formatConversionTime = (lead) => {
    // Use the conversion timestamp from activity if available, otherwise submitted_at
    const conversionActivity = (lead.activity || [])
      .filter((a) => a.status === 'converted')
      .pop();

    const timestamp = conversionActivity?.timestamp || lead.submitted_at;
    const date = new Date(timestamp);

    // Format as yyyy-MM-dd HH:mm:ss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Get timezone offset
    const tzOffset = -date.getTimezoneOffset();
    const tzSign = tzOffset >= 0 ? '+' : '-';
    const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
    const tzMins = String(Math.abs(tzOffset) % 60).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${tzSign}${tzHours}${tzMins}`;
  };

  /**
   * Extract conversion value from lead notes if available
   */
  const getConversionValue = (lead) => {
    // Look for conversion value in notes (set by conversion modal)
    const conversionNote = (lead.notes || []).find(
      (n) => n.text && n.text.includes('Conversion sent')
    );
    if (conversionNote) {
      const match = conversionNote.text.match(/₹([\d,]+)/);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    return lead.conversion_value || defaultValue;
  };

  const rows = eligibleLeads.map((lead) => [
    lead.gclid,
    conversionName,
    formatConversionTime(lead),
    getConversionValue(lead),
    currency,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((r) => r.map(escapeCSV).join(',')),
  ].join('\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `google_ads_conversions_${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  return { exported: eligibleLeads.length, skipped };
};
