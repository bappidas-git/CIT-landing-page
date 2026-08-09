/* ============================================
   /apply — Form Primitives & Icons
   Plain HTML controls styled with the page's CSS
   module: native selects, radio chips and 44 px
   touch targets, no MUI popovers and no
   @iconify/react runtime fetches (the few mdi
   glyphs needed are inlined as SVG paths).

   Every control marks its wrapper with
   data-invalid="true" when it carries an error —
   that is the hook Apply.jsx uses to scroll to
   and focus the first invalid field.
   ============================================ */

import React from 'react';
import styles from './Apply.module.css';

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

export const IconClose = (props) => (
  <Svg
    {...props}
    path="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
  />
);

export const IconChevronLeft = (props) => (
  <Svg {...props} path="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
);

export const IconChevronRight = (props) => (
  <Svg {...props} path="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
);

export const IconCheck = (props) => (
  <Svg {...props} path="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
);

export const IconCheckCircle = (props) => (
  <Svg
    {...props}
    path="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"
  />
);

export const IconAlert = (props) => (
  <Svg
    {...props}
    path="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
  />
);

export const IconInfo = (props) => (
  <Svg
    {...props}
    path="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
  />
);

export const IconLock = (props) => (
  <Svg
    {...props}
    path="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
  />
);

export const IconPlus = (props) => (
  <Svg {...props} path="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
);

export const IconUser = (props) => (
  <Svg
    {...props}
    path="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
  />
);

export const IconPhone = (props) => (
  <Svg
    {...props}
    path="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"
  />
);

export const IconSchool = (props) => (
  <Svg
    {...props}
    path="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"
  />
);

export const IconMapMarker = (props) => (
  <Svg
    {...props}
    path="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"
  />
);

export const IconEmail = (props) => (
  <Svg
    {...props}
    path="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"
  />
);

export const IconMessage = (props) => (
  <Svg
    {...props}
    path="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"
  />
);

// ============================================
// Input masking helpers
// (reimplemented here — the enquiry form's handler is not imported)
// ============================================

/**
 * Keep digits only, capped at maxLength characters.
 * @param {string} value - Raw input value
 * @param {number} maxLength - Maximum number of digits
 * @returns {string} Digits-only value
 */
export const maskDigits = (value, maxLength) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, maxLength);

/**
 * Digits-only 10-digit Indian mobile. Numbers pasted from a contact list
 * routinely carry a country code or a trunk zero ("+91 94350 12345",
 * "094350 12345") — strip those rather than keeping the first 10 characters,
 * which would silently store a wrong number.
 * @param {string} value - Raw input value
 * @returns {string} Up to 10 digits
 */
export const maskMobile = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length > 10) {
    digits = digits.replace(/^(?:0091|091|91|0)/, '');
  }
  return digits.slice(0, 10);
};

/**
 * Keep digits and a single decimal point (one decimal place), for percentages.
 * @param {string} value - Raw input value
 * @returns {string} Numeric value with at most one decimal
 */
export const maskDecimal = (value) => {
  const cleaned = String(value || '').replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  const head = whole.slice(0, 3);
  if (!rest.length) return head;
  return `${head}.${rest.join('').slice(0, 1)}`;
};

// ============================================
// Field shell
// ============================================
const FieldShell = ({ id, label, optional, error, hint, children }) => (
  <div className={styles.field} data-invalid={error ? 'true' : undefined}>
    {label && (
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
    )}
    {children}
    {error ? (
      <span className={styles.errorText} role="alert">
        {error}
      </span>
    ) : (
      hint && <span className={styles.hintText}>{hint}</span>
    )}
  </div>
);

// ============================================
// Text / tel / email input
// ============================================
export const TextField = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  optional,
  icon,
  prefix,
  mask,
  type = 'text',
  ...inputProps
}) => (
  <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
    <div className={styles.inputWrap} data-error={error ? 'true' : undefined}>
      {icon && <span className={styles.inputIcon}>{icon}</span>}
      {prefix && (
        <>
          <span className={styles.prefix}>{prefix}</span>
          <span className={styles.prefixDivider} />
        </>
      )}
      <input
        id={id}
        className={styles.input}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(mask ? mask(event.target.value) : event.target.value)
        }
        // A pasted "+91 98765 43210" would be cut to 10 CHARACTERS by
        // maxLength before the mask ever sees it, silently losing digits.
        // Masking the clipboard text first keeps paste lossless.
        onPaste={
          mask
            ? (event) => {
                event.preventDefault();
                onChange(mask(event.clipboardData.getData('text')));
              }
            : undefined
        }
        onBlur={onBlur}
        aria-invalid={error ? 'true' : undefined}
        {...inputProps}
      />
    </div>
  </FieldShell>
);

// ============================================
// Native select — no popover menu
// ============================================
export const SelectField = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  placeholder = 'Please select',
  options,
  ...selectProps
}) => (
  <FieldShell id={id} label={label} error={error} hint={hint}>
    <select
      id={id}
      className={styles.select}
      data-error={error ? 'true' : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      aria-invalid={error ? 'true' : undefined}
      {...selectProps}
    >
      <option value="" disabled={false}>
        {placeholder}
      </option>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label;
        return (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  </FieldShell>
);

// ============================================
// Radio chips — single tap, 44 px targets
// ============================================
export const ChipGroup = ({ label, value, onChange, options, error, hint }) => (
  <div className={styles.field} data-invalid={error ? 'true' : undefined}>
    {label && <span className={styles.label}>{label}</span>}
    <div className={styles.chips} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles.chip} ${active ? styles.chipActive : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
    {error ? (
      <span className={styles.errorText} role="alert">
        {error}
      </span>
    ) : (
      hint && <span className={styles.hintText}>{hint}</span>
    )}
  </div>
);

// ============================================
// Full-width option rows (longer answers)
// ============================================
export const OptionRows = ({ label, value, onChange, options, error, hint }) => (
  <div className={styles.field} data-invalid={error ? 'true' : undefined}>
    {label && <span className={styles.label}>{label}</span>}
    <div className={styles.rows} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles.optionRow} ${active ? styles.optionRowActive : ''}`}
            onClick={() => onChange(option.value)}
          >
            <span className={styles.radioDot}>
              {active && <span className={styles.radioDotInner} />}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
    {error ? (
      <span className={styles.errorText} role="alert">
        {error}
      </span>
    ) : (
      hint && <span className={styles.hintText}>{hint}</span>
    )}
  </div>
);

// ============================================
// Textarea
// ============================================
export const TextAreaField = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  optional,
  ...textareaProps
}) => (
  <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
    <textarea
      id={id}
      className={styles.textarea}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      aria-invalid={error ? 'true' : undefined}
      {...textareaProps}
    />
  </FieldShell>
);

// ============================================
// Checkbox row
// ============================================
export const CheckboxField = ({ id, label, checked, onChange }) => (
  <div className={styles.field}>
    <label className={styles.checkboxRow} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.checkboxBox}>
        {checked && <IconCheck size={14} />}
      </span>
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  </div>
);
