/* ============================================
   Tele-Calling Service Utility
   The shared server-side store (public/api/telecalls.php)
   is the SINGLE SOURCE OF TRUTH for tele-calling records.
   This module keeps an in-memory cache that is hydrated
   from the server and refreshed on a poll interval, so
   every telecaller's browser/device shows the same data.

   It mirrors leadService.js exactly (same cache + sync +
   BroadcastChannel pattern) so tele-calling behaves
   identically to Lead Management for cross-device sync.
   ============================================ */

import { getConfig } from "../../utils/webhookSubmit";
import { describeTelecallStatusChange } from "./telecallStatus";

// Shared secret used to authenticate against the telecalls API admin actions.
// Reuses the same key as the leads API (must match ADMIN_API_KEY on the server).
const TELECALLS_ADMIN_KEY = process.env.REACT_APP_LEADS_ADMIN_KEY || "";

// In-memory cache of all tele-calling records, hydrated from the server by
// syncTelecallsFromServer(). Reads filter this cache; writes update it
// optimistically AND mirror to the server so the change is durable and visible
// to every other device.
let _cache = [];

// BroadcastChannel notifies every admin tab/window in the SAME browser that a
// record changed, so a mutation made in one window refreshes the others
// instantly (cross-device sync is handled by the server poll).
const TELECALLS_CHANNEL = "lp_telecalls_channel";

let telecallsChannel = null;
const getTelecallsChannel = () => {
  if (telecallsChannel) return telecallsChannel;
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    telecallsChannel = new BroadcastChannel(TELECALLS_CHANNEL);
  } catch (err) {
    telecallsChannel = null;
  }
  return telecallsChannel;
};

/**
 * Notify every admin view (this tab and other tabs/windows of the same
 * browser) that the tele-calling store changed.
 */
const notifyTelecallsChanged = () => {
  const channel = getTelecallsChannel();
  if (channel) {
    try {
      channel.postMessage({ type: "telecalls-changed", at: Date.now() });
    } catch (err) {
      /* ignore — fall back to the DOM event below */
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lp:telecalls-changed"));
  }
};

/**
 * Subscribe an admin page to tele-calling store changes. Returns an
 * unsubscribe function.
 */
export const onTelecallsChanged = (handler) => {
  if (typeof window === "undefined") return () => {};

  const channel = getTelecallsChannel();
  const onMessage = (e) => {
    if (e?.data?.type === "telecalls-changed") handler();
  };

  if (channel) channel.addEventListener("message", onMessage);
  window.addEventListener("lp:telecalls-changed", handler);

  return () => {
    if (channel) channel.removeEventListener("message", onMessage);
    window.removeEventListener("lp:telecalls-changed", handler);
  };
};

/**
 * Build the URL for the telecalls API. Returns empty string when disabled.
 */
const getTelecallsApiUrl = () => {
  const { TELECALLS_API_URL } = getConfig();
  return TELECALLS_API_URL || "";
};

/**
 * Fire-and-forget admin call to the telecalls API.
 */
const callTelecallsApi = (action, body) => {
  const url = getTelecallsApiUrl();
  if (!url || !TELECALLS_ADMIN_KEY) return Promise.resolve();
  return fetch(`${url}?action=${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": TELECALLS_ADMIN_KEY,
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch((err) => console.error(`[TelecallsAPI] ${action} failed:`, err));
};

/**
 * Generate a UUID (with a non-crypto fallback for older browsers).
 */
const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36).slice(2);

/**
 * Normalise a raw server record so the admin UI always has the fields it expects.
 */
const normalizeTelecall = (rec) => ({
  ...rec,
  status: rec.status || "hot",
  notes: Array.isArray(rec.notes) ? rec.notes : [],
  activity: Array.isArray(rec.activity)
    ? rec.activity
    : [
        {
          action: "Record created",
          status: rec.status || "hot",
          timestamp: rec.created_at || new Date().toISOString(),
        },
      ],
});

/**
 * Replace a record in the cache with a NEW object built by `updater`.
 */
const replaceInCache = (id, updater) => {
  let updated = null;
  _cache = _cache.map((r) => {
    if (r.telecall_id !== id) return r;
    updated = updater(r);
    return updated;
  });
  return updated;
};

/**
 * Pull every tele-calling record from the server-side store (the source of
 * truth) and replace the in-memory cache with it. Returns counts of what
 * changed versus the previous cache.
 *
 * Returns { synced, added, updated, removed, error? }.
 */
export const syncTelecallsFromServer = async () => {
  const url = getTelecallsApiUrl();
  if (!url) {
    return { synced: 0, added: 0, updated: 0, removed: 0, error: "TELECALLS_API_URL not configured" };
  }
  if (!TELECALLS_ADMIN_KEY) {
    return {
      synced: 0,
      added: 0,
      updated: 0,
      removed: 0,
      error: "REACT_APP_LEADS_ADMIN_KEY not set — cannot authenticate",
    };
  }

  try {
    const response = await fetch(`${url}?action=list`, {
      method: "GET",
      headers: { "X-Admin-Key": TELECALLS_ADMIN_KEY },
    });
    if (!response.ok) {
      return {
        synced: 0,
        added: 0,
        updated: 0,
        removed: 0,
        error: `Server returned ${response.status}`,
      };
    }
    const data = await response.json();
    const serverRecords = Array.isArray(data.telecalls) ? data.telecalls : [];
    const normalized = serverRecords.map(normalizeTelecall);

    const prevById = new Map(_cache.map((r) => [r.telecall_id, r]));
    const serverIds = new Set();
    let added = 0;
    let updated = 0;
    normalized.forEach((rec) => {
      serverIds.add(rec.telecall_id);
      const prev = prevById.get(rec.telecall_id);
      if (!prev) {
        added++;
      } else if (JSON.stringify(prev) !== JSON.stringify(rec)) {
        updated++;
      }
    });
    const removed = _cache.filter((r) => !serverIds.has(r.telecall_id)).length;

    _cache = normalized;
    return { synced: normalized.length, added, updated, removed };
  } catch (err) {
    console.error("[TelecallsAPI] sync failed:", err);
    return { synced: 0, added: 0, updated: 0, removed: 0, error: err.message || "Network error" };
  }
};

/**
 * Get all tele-calling records with optional filters (read from the cache).
 * @param {Object} filters - { search, status, nurturedBy, dateRange, startDate, endDate }
 * @returns {Array} Filtered records
 */
export const getTelecalls = (filters = {}) => {
  let records = [..._cache];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.mobile || "").includes(q) ||
        (r.address || "").toLowerCase().includes(q) ||
        (r.state || "").toLowerCase().includes(q) ||
        (r.nurtured_by || "").toLowerCase().includes(q)
    );
  }

  if (filters.status && filters.status !== "all") {
    records = records.filter((r) => r.status === filters.status);
  }

  if (filters.nurturedBy && filters.nurturedBy !== "all") {
    records = records.filter((r) => r.nurtured_by === filters.nurturedBy);
  }

  if (filters.dateRange && filters.dateRange !== "all") {
    const now = new Date();
    let startDate;

    switch (filters.dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week": {
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "custom":
        if (filters.startDate) startDate = new Date(filters.startDate);
        break;
      default:
        break;
    }

    if (startDate) {
      records = records.filter((r) => new Date(r.created_at) >= startDate);
    }
    if (filters.dateRange === "custom" && filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      records = records.filter((r) => new Date(r.created_at) <= endDate);
    }
  }

  // Sort by creation date descending by default
  records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return records;
};

/**
 * Get a single tele-calling record by ID
 */
export const getTelecallById = (id) => {
  return _cache.find((r) => r.telecall_id === id) || null;
};

/**
 * Create a new tele-calling record. Persists to the server (source of truth),
 * adds it to the cache optimistically, and notifies other tabs/devices.
 * Returns the created record.
 * @param {Object} fields - { name, mobile, address, state, notes, status,
 *   nurtured_by, callback_scheduled, callback_at }
 */
export const createTelecall = (fields) => {
  const now = new Date().toISOString();
  const status = fields.status || "hot";

  const activity = [
    { action: "Record created", status, timestamp: now },
  ];

  // The mandatory first note from the telecaller is stored as the first note.
  const notes = [];
  if (fields.notes && fields.notes.trim()) {
    notes.push({ id: Date.now().toString(), text: fields.notes.trim(), timestamp: now });
    activity.push({ action: "Note added", status, timestamp: now });
  }

  if (fields.callback_scheduled && fields.callback_at) {
    activity.push({
      action: `Callback scheduled for "${fields.callback_at}"`,
      status,
      timestamp: now,
    });
  }

  const record = {
    telecall_id: generateId(),
    name: (fields.name || "").trim(),
    mobile: (fields.mobile || "").trim(),
    address: (fields.address || "").trim(),
    state: fields.state || "",
    status,
    nurtured_by: fields.nurtured_by || "",
    callback_scheduled: !!fields.callback_scheduled,
    callback_at: fields.callback_scheduled ? fields.callback_at || "" : "",
    source: "Tele-Calling",
    notes,
    activity,
    created_at: now,
    updated_at: now,
  };

  _cache = [record, ..._cache];
  notifyTelecallsChanged();

  // Persist to the shared server store so every device sees it.
  callTelecallsApi("create", { telecall: record });

  return record;
};

/**
 * Update a record's status
 */
export const updateTelecallStatus = (id, status) => {
  const existing = _cache.find((r) => r.telecall_id === id);
  if (!existing) return null;

  const oldStatus = existing.status;
  const now = new Date().toISOString();
  const updated = replaceInCache(id, (r) => ({
    ...r,
    status,
    activity: [
      ...(r.activity || []),
      {
        action: describeTelecallStatusChange(oldStatus, status),
        status,
        timestamp: now,
      },
    ],
    updated_at: now,
  }));

  notifyTelecallsChanged();

  callTelecallsApi("update", {
    telecall_id: id,
    patch: {
      status: updated.status,
      activity: updated.activity,
      updated_at: updated.updated_at,
    },
  });

  return updated;
};

/**
 * Add a note to a record
 */
export const addTelecallNote = (id, noteText) => {
  const existing = _cache.find((r) => r.telecall_id === id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const note = {
    id: Date.now().toString(),
    text: noteText,
    timestamp: now,
  };
  const updated = replaceInCache(id, (r) => ({
    ...r,
    notes: [...(r.notes || []), note],
    activity: [
      ...(r.activity || []),
      { action: "Note added", status: r.status, timestamp: now },
    ],
    updated_at: now,
  }));

  notifyTelecallsChanged();

  callTelecallsApi("update", {
    telecall_id: id,
    patch: {
      notes: updated.notes,
      activity: updated.activity,
      updated_at: updated.updated_at,
    },
  });

  return updated;
};

/**
 * Edit the core fields of a record (used when a telecaller fixes a wrongly
 * entered value). Logs an activity entry and mirrors the change to the server.
 * @param {string} id
 * @param {Object} fields - { name, mobile, address, state, nurtured_by,
 *   callback_scheduled, callback_at }
 */
export const updateTelecallFields = (id, fields) => {
  const existing = _cache.find((r) => r.telecall_id === id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const callbackScheduled = !!fields.callback_scheduled;
  const updated = replaceInCache(id, (r) => ({
    ...r,
    name: fields.name !== undefined ? fields.name : r.name,
    mobile: fields.mobile !== undefined ? fields.mobile : r.mobile,
    address: fields.address !== undefined ? fields.address : r.address,
    state: fields.state !== undefined ? fields.state : r.state,
    nurtured_by: fields.nurtured_by !== undefined ? fields.nurtured_by : r.nurtured_by,
    callback_scheduled: callbackScheduled,
    callback_at: callbackScheduled ? fields.callback_at || "" : "",
    activity: [
      ...(r.activity || []),
      { action: "Details updated", status: r.status, timestamp: now },
    ],
    updated_at: now,
  }));

  notifyTelecallsChanged();

  callTelecallsApi("update", {
    telecall_id: id,
    patch: {
      name: updated.name,
      mobile: updated.mobile,
      address: updated.address,
      state: updated.state,
      nurtured_by: updated.nurtured_by,
      callback_scheduled: updated.callback_scheduled,
      callback_at: updated.callback_at,
      activity: updated.activity,
      updated_at: updated.updated_at,
    },
  });

  return updated;
};

/**
 * Delete a single record
 */
export const deleteTelecall = (id) => {
  _cache = _cache.filter((r) => r.telecall_id !== id);
  notifyTelecallsChanged();
  callTelecallsApi("delete", { telecall_ids: [id] });
  return true;
};

/**
 * Bulk delete records
 */
export const deleteTelecalls = (ids) => {
  const idSet = new Set(ids);
  _cache = _cache.filter((r) => !idSet.has(r.telecall_id));
  notifyTelecallsChanged();
  if (ids.length > 0) {
    callTelecallsApi("delete", { telecall_ids: ids });
  }
  return true;
};

/**
 * Export tele-calling records to CSV string and trigger download
 */
export const exportTelecallsCSV = (records) => {
  const headers = [
    "Telecall ID",
    "Name",
    "Mobile",
    "Address",
    "State",
    "Status",
    "Lead Nurtured By",
    "Callback Scheduled",
    "Callback At",
    "Created At",
    "Notes",
  ];

  const escapeCSV = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((r) => [
    r.telecall_id,
    r.name,
    r.mobile,
    r.address,
    r.state,
    r.status,
    r.nurtured_by,
    r.callback_scheduled ? "Yes" : "No",
    r.callback_at,
    r.created_at,
    (r.notes || []).map((n) => n.text).join(" | "),
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `telecalling_export_${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Get summary stats for the tele-calling dashboard cards
 */
export const getTelecallStats = () => {
  const records = _cache;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalRecords = records.length;
  const newToday = records.filter((r) => new Date(r.created_at) >= today).length;
  const seatBooked = records.filter((r) => r.status === "seat_booked").length;
  const conversionRate =
    totalRecords > 0 ? ((seatBooked / totalRecords) * 100).toFixed(1) : "0";

  // Count callbacks scheduled for today or later (upcoming follow-ups).
  const upcomingCallbacks = records.filter(
    (r) => r.callback_scheduled && r.callback_at && new Date(r.callback_at) >= now
  ).length;

  return {
    totalRecords,
    newToday,
    seatBooked,
    conversionRate,
    upcomingCallbacks,
  };
};
