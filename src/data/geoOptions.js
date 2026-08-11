/* ============================================
   Geography Options — Single Source of Truth
   ============================================
   The campaign runs across the whole of India (Karnataka and Tumkur itself
   included) plus Nepal and Bhutan, so every surface that asks an applicant
   where they live reads its choices from here:

     - /apply Step 4 (StepLogistics)      — the live application form
     - UnifiedLeadForm                    — the retained enquiry drawer
     - Tele-Calling module                — manually entered leads

   `country` is stored flat on the lead alongside the existing `state` and
   `district` keys. India is the default: it is the overwhelming majority of
   traffic, and a pre-filled country means most applicants touch one fewer
   control on a 360 px screen.
   ============================================ */

export const DEFAULT_COUNTRY = 'India';

export const COUNTRY_OPTIONS = ['India', 'Nepal', 'Bhutan', 'Other'];

// All 28 states + 8 union territories, alphabetical. Stored under the existing
// `state` key, so the value is the plain display string.
export const INDIAN_STATE_OPTIONS = [
  'Andaman & Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Nepal's seven federal provinces.
export const NEPAL_PROVINCE_OPTIONS = [
  'Bagmati',
  'Gandaki',
  'Karnali',
  'Koshi',
  'Lumbini',
  'Madhesh',
  'Sudurpashchim',
];

// Bhutan's twenty dzongkhags.
export const BHUTAN_DZONGKHAG_OPTIONS = [
  'Bumthang',
  'Chhukha',
  'Dagana',
  'Gasa',
  'Haa',
  'Lhuentse',
  'Mongar',
  'Paro',
  'Pemagatshel',
  'Punakha',
  'Samdrup Jongkhar',
  'Samtse',
  'Sarpang',
  'Thimphu',
  'Trashigang',
  'Trashiyangtse',
  'Trongsa',
  'Tsirang',
  'Wangdue Phodrang',
  'Zhemgang',
];

const STATE_OPTIONS_BY_COUNTRY = {
  India: INDIAN_STATE_OPTIONS,
  Nepal: NEPAL_PROVINCE_OPTIONS,
  Bhutan: BHUTAN_DZONGKHAG_OPTIONS,
};

/**
 * The state / province choices for a country. "Other" (and any country we do
 * not carry a list for) returns an empty array — the form then asks for the
 * region as free text rather than showing an empty dropdown.
 * @param {string} country - Value from COUNTRY_OPTIONS
 * @returns {string[]} Region options, empty when the country is free-text
 */
export const getStateOptions = (country) =>
  STATE_OPTIONS_BY_COUNTRY[country] || [];

/**
 * The label the state field wears for a country — "state" reads wrong in
 * Kathmandu and "province" reads wrong in Patna.
 * @param {string} country - Value from COUNTRY_OPTIONS
 * @returns {string} Field label
 */
export const getStateLabel = (country) => {
  if (country === 'Nepal') return 'Your home province';
  if (country === 'Bhutan') return 'Your home dzongkhag';
  if (country && country !== 'India') return 'Your home state / province';
  return 'Your home state';
};

// One flat dropdown for the tele-calling module, where a telecaller types a
// lead in by hand and a second country control would only slow them down.
export const TELECALL_REGION_OPTIONS = [
  ...INDIAN_STATE_OPTIONS,
  'Nepal',
  'Bhutan',
  'Other',
];

const geoOptions = {
  DEFAULT_COUNTRY,
  COUNTRY_OPTIONS,
  INDIAN_STATE_OPTIONS,
  NEPAL_PROVINCE_OPTIONS,
  BHUTAN_DZONGKHAG_OPTIONS,
  TELECALL_REGION_OPTIONS,
  getStateOptions,
  getStateLabel,
};

export default geoOptions;
