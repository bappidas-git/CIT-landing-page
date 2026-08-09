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
