/* ============================================
   /test — Shared bits for the merit-test route
   Icons and the two controls the pre-test screens
   need, kept local to the route on purpose: the
   house convention is per-route duplication rather
   than a cross-route import, so /apply and /test
   can each stay a lean, independently-shipped
   chunk.

   No @iconify/react (it fetches glyphs at runtime),
   no MUI popovers — the few mdi glyphs used here
   are inlined as SVG paths.
   ============================================ */

import React from 'react';
import styles from './Test.module.css';

// ============================================
// Icons (mdi paths, 24×24)
// ============================================
const Svg = ({ path, size = 20, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <path d={path} />
  </svg>
);

export const IconKey = (props) => (
  <Svg
    {...props}
    path="M22,18V22H18V19H15V16H12L9.74,13.74C9.19,13.91 8.61,14 8,14A6,6 0 0,1 2,8A6,6 0 0,1 8,2A6,6 0 0,1 14,8C14,8.61 13.91,9.19 13.74,9.74L22,18M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5Z"
  />
);

export const IconCheck = (props) => (
  <Svg {...props} path="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
);

export const IconChevronRight = (props) => (
  <Svg {...props} path="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
);

export const IconAlert = (props) => (
  <Svg
    {...props}
    path="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
  />
);

export const IconLock = (props) => (
  <Svg
    {...props}
    path="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
  />
);

export const IconList = (props) => (
  <Svg
    {...props}
    path="M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z"
  />
);

export const IconTimer = (props) => (
  <Svg
    {...props}
    path="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z"
  />
);

export const IconPlusCircle = (props) => (
  <Svg
    {...props}
    path="M13,7H11V11H7V13H11V17H13V13H17V11H13V7M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"
  />
);

export const IconNoBack = (props) => (
  <Svg
    {...props}
    path="M20,13.5C20,17.09 17.09,20 13.5,20H6V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5C17.09,7 20,9.91 20,13.5Z"
  />
);

export const IconSkipNext = (props) => (
  <Svg
    {...props}
    path="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M16,8V16H14V8H16M8,8L13,12L8,16V8Z"
  />
);

export const IconClock = (props) => (
  <Svg
    {...props}
    path="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12.5,7H11V13L15.75,15.85L16.5,14.62L12.5,12.25V7Z"
  />
);

export const IconOneAttempt = (props) => (
  <Svg
    {...props}
    path="M10,7V9H12V17H14V7H10M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"
  />
);

export const IconSave = (props) => (
  <Svg
    {...props}
    path="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"
  />
);

export const IconCalendarClock = (props) => (
  <Svg
    {...props}
    path="M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z"
  />
);

export const IconCalendarCheck = (props) => (
  <Svg
    {...props}
    path="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H18V1M16.53,11.06L15.47,10L10.59,14.88L8.47,12.76L7.41,13.82L10.59,17L16.53,11.06Z"
  />
);

export const IconDocument = (props) => (
  <Svg
    {...props}
    path="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12V14H16V12H8M8,16V18H13V16H8Z"
  />
);

export const IconFamily = (props) => (
  <Svg
    {...props}
    path="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"
  />
);

export const IconPhone = (props) => (
  <Svg
    {...props}
    path="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"
  />
);

export const IconWhatsApp = (props) => (
  <Svg
    {...props}
    path="M12.04,2C6.58,2 2.13,6.45 2.13,11.91C2.13,13.66 2.59,15.36 3.45,16.86L2.05,22L7.3,20.62C8.75,21.41 10.38,21.83 12.04,21.83C17.5,21.83 21.95,17.38 21.95,11.92C21.95,9.27 20.92,6.78 19.05,4.91C17.18,3.03 14.69,2 12.04,2M12.05,3.67C14.25,3.67 16.31,4.53 17.87,6.09C19.42,7.65 20.28,9.72 20.28,11.92C20.28,16.46 16.58,20.15 12.04,20.15C10.56,20.15 9.11,19.76 7.85,19L7.55,18.83L4.43,19.65L5.26,16.61L5.06,16.29C4.24,15 3.8,13.47 3.8,11.91C3.81,7.37 7.5,3.67 12.05,3.67M8.53,7.33C8.37,7.33 8.1,7.39 7.87,7.64C7.65,7.89 7,8.5 7,9.71C7,10.93 7.89,12.1 8,12.27C8.14,12.44 9.76,14.94 12.25,16C12.84,16.27 13.3,16.42 13.66,16.53C14.25,16.72 14.79,16.69 15.22,16.63C15.7,16.56 16.68,16.03 16.89,15.45C17.1,14.87 17.1,14.38 17.04,14.27C16.97,14.17 16.81,14.11 16.56,14C16.31,13.86 15.09,13.26 14.87,13.18C14.64,13.1 14.5,13.06 14.31,13.3C14.15,13.55 13.67,14.11 13.53,14.27C13.38,14.44 13.24,14.46 13,14.34C12.74,14.21 11.94,13.95 11,13.11C10.26,12.45 9.77,11.64 9.62,11.39C9.5,11.15 9.61,11 9.73,10.89C9.84,10.78 10,10.6 10.1,10.45C10.23,10.31 10.27,10.2 10.35,10.04C10.43,9.87 10.39,9.73 10.33,9.61C10.27,9.5 9.77,8.26 9.56,7.77C9.36,7.29 9.16,7.35 9,7.34C8.86,7.34 8.7,7.33 8.53,7.33Z"
  />
);

// ============================================
// Login-key masking
// ============================================

/** Fixed prefix every issued key carries. */
export const KEY_PREFIX = 'CIT26-';

/** Length of the random part of a key. */
export const KEY_BODY_LENGTH = 5;

/**
 * The 32-char alphabet leads.php issues keys from. `0 O 1 I` are deliberately
 * absent so a key survives being read out over a bad phone line — which also
 * means a typed `O` or `1` is always a mis-read and is dropped rather than
 * silently submitted as part of a key that can never match.
 */
const KEY_BODY_ALPHABET = /[^23456789ABCDEFGHJKLMNPQRSTUVWXYZ]/g;

/**
 * Reduce anything the applicant types or pastes to the 5-character body of a
 * login key. Accepts the key with or without its `CIT26-` prefix, in any case,
 * with or without spaces — a key copied from WhatsApp, read off a call or
 * pasted from /thank-you all land on the same value.
 * @param {string} raw - Raw input or clipboard text
 * @returns {string} Up to 5 characters from the key alphabet
 */
export const maskKeyBody = (raw) => {
  // Strip separators first so "cit26 - abcde" still reveals its prefix.
  let value = String(raw || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  // The prefix check must run BEFORE the alphabet filter: `I` and `1` are not
  // in the key alphabet, so filtering first would eat the `I` out of `CIT26`.
  // A body can never itself be "CIT26" — `I` is not an issuable character.
  if (value.startsWith('CIT26')) value = value.slice(5);
  return value.replace(KEY_BODY_ALPHABET, '').slice(0, KEY_BODY_LENGTH);
};

/**
 * The full key for a body, or '' while the field is empty.
 * @param {string} body - Masked key body
 * @returns {string} `CIT26-XXXXX` or ''
 */
export const formatKey = (body) => (body ? `${KEY_PREFIX}${body}` : '');

// ============================================
// Controls
// ============================================

/**
 * The single field on the login screen. The prefix lives inside the value
 * rather than beside it, so what the applicant sees is exactly the key that was
 * shown to them after applying.
 */
export const KeyField = ({ id, value, onChange, onSubmitHint, error, inputRef }) => (
  <div className={styles.field} data-invalid={error ? 'true' : undefined}>
    <label className={styles.label} htmlFor={id}>
      Test Login Key
    </label>
    <div className={styles.keyWrap} data-error={error ? 'true' : undefined}>
      <span className={styles.keyIcon}>
        <IconKey size={20} />
      </span>
      <input
        id={id}
        ref={inputRef}
        // Named so EngagementTracker's global focus event reports a readable
        // field rather than falling back to the placeholder. It sends the name
        // only, never the value — the key never reaches the dataLayer.
        name="login_key"
        className={styles.keyInput}
        type="text"
        value={formatKey(value)}
        placeholder="CIT26-XXXXX"
        // 6 prefix characters + the 5-character body.
        maxLength={KEY_PREFIX.length + KEY_BODY_LENGTH}
        onChange={(event) => onChange(maskKeyBody(event.target.value))}
        // maxLength would truncate a pasted "CIT26 - ABCDE" before the mask ever
        // saw it, silently losing the last character. Masking the clipboard text
        // first keeps paste lossless.
        onPaste={(event) => {
          event.preventDefault();
          onChange(maskKeyBody(event.clipboardData.getData('text')));
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck="false"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={`${id}-hint`}
      />
    </div>
    <span className={styles.hintText} id={`${id}-hint`}>
      {onSubmitHint}
    </span>
  </div>
);

/**
 * Checkbox row with a 44 px touch target — the T&C gate.
 */
export const CheckboxField = ({ id, label, checked, onChange }) => (
  <label className={styles.checkboxRow} htmlFor={id}>
    <input
      id={id}
      type="checkbox"
      className={styles.checkboxInput}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span className={styles.checkboxBox}>{checked && <IconCheck size={14} />}</span>
    <span className={styles.checkboxLabel}>{label}</span>
  </label>
);
