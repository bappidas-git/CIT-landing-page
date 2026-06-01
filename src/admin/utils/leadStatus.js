/* ============================================
   Lead Status — Single Source of Truth
   ============================================
   Every admin surface (Lead Management table, Lead Detail, Dashboard,
   activity timeline, snackbars, filter chips) must render the SAME set of
   statuses. Previously the status list + labels were copy-pasted into four
   files, which let raw internal keys (e.g. "contacted", "completed") leak
   into the UI when one copy drifted. Keeping the list here — and importing
   it everywhere — guarantees only the present statuses are ever shown:

     New · Hot · Warm · Cold · Seat Booked · Not Interested

   The `value` keys are the canonical workflow keys persisted on each lead
   and sent in sync/export payloads. DO NOT rename them — only the human
   `label` is shown in the UI.
   ============================================ */

export const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "#2B7BD5", bg: "#EBF5FF" },
  { value: "contacted", label: "Hot", color: "#EF4444", bg: "#FEF2F2" },
  { value: "consultation_booked", label: "Warm", color: "#F59E0B", bg: "#FFF7ED" },
  { value: "procedure_scheduled", label: "Cold", color: "#0097A7", bg: "#E0F7FA" },
  { value: "completed", label: "Seat Booked", color: "#10B981", bg: "#ECFDF5" },
  { value: "not_interested", label: "Not Interested", color: "#6B7280", bg: "#F3F4F6" },
];

// Quick lookup maps derived from the canonical list above.
export const STATUS_LABELS = STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

const STATUS_BY_VALUE = STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.value] = s;
  return acc;
}, {});

// Reverse map (label -> option) so we can also recognise entries that were
// already stored with a label.
const STATUS_BY_LABEL = STATUS_OPTIONS.reduce((acc, s) => {
  acc[s.label] = s;
  return acc;
}, {});

/**
 * Resolve a status value to its full config (label/color/bg). Falls back to
 * the first option ("New") so the UI never renders an unknown raw key.
 */
export const getStatusConfig = (status) =>
  STATUS_BY_VALUE[status] || STATUS_OPTIONS[0];

/**
 * Resolve a status value to its display label, falling back to the raw value.
 */
export const statusLabel = (value) => STATUS_LABELS[value] || value || "";

/**
 * Build the activity-log text for a status change using display labels, e.g.
 * `Status changed from "New" to "Hot"`.
 */
export const describeStatusChange = (from, to) =>
  `Status changed from "${statusLabel(from)}" to "${statusLabel(to)}"`;

/**
 * Normalise any activity-log action text so it always reads with the present
 * labels. Older entries (and sync payloads from older clients) stored the raw
 * status keys inside the quoted text (e.g. `... to "completed"`); this maps
 * any quoted raw key — or stale label — to its current label so the timeline
 * never shows "contacted"/"completed"/etc.
 */
export const formatActivityAction = (action) => {
  if (!action) return "";
  return action.replace(/"([^"]+)"/g, (match, token) => {
    const opt = STATUS_BY_VALUE[token] || STATUS_BY_LABEL[token];
    return opt ? `"${opt.label}"` : match;
  });
};
