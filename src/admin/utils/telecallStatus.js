/* ============================================
   Tele-Calling Status — Single Source of Truth
   ============================================
   Every tele-calling surface (list table, detail page, activity timeline,
   snackbars, filter chips, Add New form) must render the SAME set of
   statuses. Keeping the list here — and importing it everywhere — guarantees
   only these statuses are ever shown:

     Hot · Warm · Cold · Need More Follow Ups · Seat Booked · Not Interested

   The `value` keys are the canonical keys persisted on each record and sent
   in sync payloads. DO NOT rename them — only the human `label` is shown.
   ============================================ */

export const TELECALL_STATUS_OPTIONS = [
  { value: "hot", label: "Hot", color: "#EF4444", bg: "#FEF2F2" },
  { value: "warm", label: "Warm", color: "#F59E0B", bg: "#FFF7ED" },
  { value: "cold", label: "Cold", color: "#0097A7", bg: "#E0F7FA" },
  { value: "follow_up", label: "Need More Follow Ups", color: "#2B7BD5", bg: "#EBF5FF" },
  { value: "seat_booked", label: "Seat Booked", color: "#10B981", bg: "#ECFDF5" },
  { value: "not_interested", label: "Not Interested", color: "#6B7280", bg: "#F3F4F6" },
];

// Telecallers who nurture leads — used by the "Lead Nurtured By" dropdown.
export const NURTURED_BY_OPTIONS = [
  "Urmi Das",
  "Drishty Newar",
  "Susmit Sarma",
  "Subhasis Bhuyan",
  "Bappi Das",
  "Bhaswar Jyoti Bhuyan",
  "Shubendu Das",
  "Abhijit Rabha",
];

// North-East India state options (the campaign's target geography) — mirrors
// the public lead form so both modules offer the same choices.
export const TELECALL_STATE_OPTIONS = [
  "Assam",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Tripura",
  "Sikkim",
  "Other",
];

// Quick lookup maps derived from the canonical list above.
export const TELECALL_STATUS_LABELS = TELECALL_STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

const STATUS_BY_VALUE = TELECALL_STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s;
  return acc;
}, {});

const STATUS_BY_LABEL = TELECALL_STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.label] = s;
  return acc;
}, {});

/**
 * Resolve a status value to its full config (label/color/bg). Falls back to
 * the first option ("Hot") so the UI never renders an unknown raw key.
 */
export const getTelecallStatusConfig = (status) =>
  STATUS_BY_VALUE[status] || TELECALL_STATUS_OPTIONS[0];

/**
 * Resolve a status value to its display label, falling back to the raw value.
 */
export const telecallStatusLabel = (value) =>
  TELECALL_STATUS_LABELS[value] || value || "";

/**
 * Build the activity-log text for a status change using display labels.
 */
export const describeTelecallStatusChange = (from, to) =>
  `Status changed from "${telecallStatusLabel(from)}" to "${telecallStatusLabel(to)}"`;

/**
 * Normalise any activity-log action text so it always reads with the present
 * labels (maps any quoted raw key — or stale label — to its current label).
 */
export const formatTelecallActivityAction = (action) => {
  if (!action) return "";
  return action.replace(/"([^"]+)"/g, (match, token) => {
    const opt = STATUS_BY_VALUE[token] || STATUS_BY_LABEL[token];
    return opt ? `"${opt.label}"` : match;
  });
};
