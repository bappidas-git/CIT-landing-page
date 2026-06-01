/* ============================================
   Lead Service Utility
   CRUD operations for leads stored in localStorage
   With Pabbly webhook support for admin actions
   ============================================ */

import { isPabblyMode } from './adminConfig';
import { getConfig } from '../../utils/webhookSubmit';
import { describeStatusChange } from './leadStatus';

// Pabbly webhook for admin actions (status change, notes, deletions)
// Set this to your Pabbly admin workflow webhook URL
const ADMIN_WEBHOOK_URL = process.env.REACT_APP_ADMIN_PABBLY_WEBHOOK_URL || "";

// Shared secret used to authenticate against /api/leads.php admin actions.
// Must match ADMIN_API_KEY in public/api/config.php on the server.
const LEADS_ADMIN_KEY = process.env.REACT_APP_LEADS_ADMIN_KEY || "";

const LEADS_KEY = "lp_submitted_leads";
const TEST_LEADS_KEY = "lp_test_leads";

// Name of the BroadcastChannel used to notify every admin tab/window in the
// SAME browser that a lead changed. The native `storage` event only covers
// cross-tab changes and can be missed in edge cases; broadcasting explicitly
// after every admin mutation makes same-browser sync instant and reliable.
const LEADS_CHANNEL = "lp_leads_channel";

let leadsChannel = null;
const getLeadsChannel = () => {
  if (leadsChannel) return leadsChannel;
  if (typeof BroadcastChannel === "undefined") return null;
  try {
    leadsChannel = new BroadcastChannel(LEADS_CHANNEL);
  } catch (err) {
    leadsChannel = null;
  }
  return leadsChannel;
};

/**
 * Notify every admin view (this tab and other tabs/windows of the same
 * browser) that the lead store changed, so they reload without waiting for
 * the next server poll. Also dispatches a same-tab DOM event because the
 * originating tab never receives its own `storage` / BroadcastChannel message.
 */
const notifyLeadsChanged = () => {
  const channel = getLeadsChannel();
  if (channel) {
    try {
      channel.postMessage({ type: "leads-changed", at: Date.now() });
    } catch (err) {
      /* ignore — fall back to the DOM event below */
    }
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lp:leads-changed"));
  }
};

/**
 * Subscribe an admin page to lead-store changes coming from any source:
 * another tab/window (BroadcastChannel), a cross-tab localStorage write
 * (`storage`), a new public submission (`lp:lead-submitted`), or a mutation in
 * this same tab (`lp:leads-changed`). Returns an unsubscribe function.
 */
export const onLeadsChanged = (handler) => {
  if (typeof window === "undefined") return () => {};

  const channel = getLeadsChannel();
  const onMessage = (e) => {
    if (e?.data?.type === "leads-changed") handler();
  };
  const onStorage = (e) => {
    if (e.key === LEADS_KEY || e.key === TEST_LEADS_KEY) handler();
  };

  if (channel) channel.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  window.addEventListener("lp:lead-submitted", handler);
  window.addEventListener("lp:leads-changed", handler);

  return () => {
    if (channel) channel.removeEventListener("message", onMessage);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("lp:lead-submitted", handler);
    window.removeEventListener("lp:leads-changed", handler);
  };
};

// Admin-only fields that live alongside a lead and are mutated from the admin
// panel (status changes, notes, conversion tracking). These are the fields we
// merge back from the shared server store so changes made on one browser /
// device appear on all of them. `updated_at` is the last-write-wins marker.
const ADMIN_SYNC_FIELDS = [
  "status",
  "notes",
  "activity",
  "conversion_value",
  "conversion_type",
  "converted_at",
  "updated_at",
];

const toMillis = (ts) => {
  if (!ts) return 0;
  const t = new Date(ts).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Build the URL for the leads API. Returns empty string when disabled.
 */
const getLeadsApiUrl = () => {
  const { LEADS_API_URL } = getConfig();
  return LEADS_API_URL || "";
};

/**
 * Fire-and-forget admin call to the leads API.
 */
const callLeadsApi = (action, body) => {
  const url = getLeadsApiUrl();
  if (!url || !LEADS_ADMIN_KEY) return Promise.resolve();
  return fetch(`${url}?action=${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": LEADS_ADMIN_KEY,
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch((err) => console.error(`[LeadsAPI] ${action} failed:`, err));
};

/**
 * Pull every lead from the server-side store and reconcile it with
 * localStorage. New leads are imported, and admin-only state (status, notes,
 * activity, conversion tracking) on existing leads is merged back when the
 * server copy is newer than the local one.
 *
 * Why the merge matters: admin actions (status change, note) are mirrored to
 * the shared server store, but each browser/device keeps its own localStorage.
 * Previously existing leads were skipped on sync, so a status/note change made
 * on one device never appeared on another. We now use the per-lead `updated_at`
 * timestamp as a last-write-wins marker: if the server's copy was updated more
 * recently than ours, we adopt its admin fields. The `updated_at` guard means a
 * device with newer unsynced edits is never clobbered by a stale server copy.
 *
 * Returns { synced: number, added: number, updated: number, error?: string }.
 */
export const syncLeadsFromServer = async () => {
  const url = getLeadsApiUrl();
  if (!url) {
    return { synced: 0, added: 0, updated: 0, error: "LEADS_API_URL not configured" };
  }
  if (!LEADS_ADMIN_KEY) {
    return {
      synced: 0,
      added: 0,
      updated: 0,
      error: "REACT_APP_LEADS_ADMIN_KEY not set — cannot authenticate",
    };
  }

  try {
    const response = await fetch(`${url}?action=list`, {
      method: "GET",
      headers: { "X-Admin-Key": LEADS_ADMIN_KEY },
    });
    if (!response.ok) {
      return {
        synced: 0,
        added: 0,
        updated: 0,
        error: `Server returned ${response.status}`,
      };
    }
    const data = await response.json();
    const serverLeads = Array.isArray(data.leads) ? data.leads : [];

    const localLeads = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    const localById = new Map(localLeads.map((l) => [l.lead_id, l]));

    let added = 0;
    let updated = 0;
    serverLeads.forEach((lead) => {
      if (!lead || !lead.lead_id) return;
      const local = localById.get(lead.lead_id);
      if (!local) {
        // New lead from another browser/device — import it with sensible
        // defaults for admin-only fields.
        localLeads.push({
          ...lead,
          status: lead.status || "new",
          notes: Array.isArray(lead.notes) ? lead.notes : [],
          activity: Array.isArray(lead.activity)
            ? lead.activity
            : [
                {
                  action: "Lead created",
                  status: lead.status || "new",
                  timestamp: lead.submitted_at || new Date().toISOString(),
                },
              ],
        });
        added++;
        return;
      }

      // Existing lead — adopt the server's admin fields only when its copy is
      // newer, so admin updates made on another device become visible here
      // without overwriting edits we made more recently.
      if (toMillis(lead.updated_at) > toMillis(local.updated_at)) {
        ADMIN_SYNC_FIELDS.forEach((field) => {
          if (lead[field] !== undefined) local[field] = lead[field];
        });
        updated++;
      }
    });

    if (added > 0 || updated > 0) {
      localStorage.setItem(LEADS_KEY, JSON.stringify(localLeads));
    }
    return { synced: serverLeads.length, added, updated };
  } catch (err) {
    console.error("[LeadsAPI] sync failed:", err);
    return { synced: 0, added: 0, updated: 0, error: err.message || "Network error" };
  }
};

/**
 * Get all leads from both production and test storage
 */
const getAllLeadsRaw = () => {
  const leads = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  const testLeads = JSON.parse(localStorage.getItem(TEST_LEADS_KEY) || "[]").map(
    (l) => ({ ...l, _isTest: true })
  );
  return [...leads, ...testLeads];
};

/**
 * Save leads back to localStorage (split by test/prod)
 */
const saveLeads = (allLeads) => {
  const prodLeads = allLeads.filter((l) => !l._isTest);
  const testLeads = allLeads.filter((l) => l._isTest);
  localStorage.setItem(LEADS_KEY, JSON.stringify(prodLeads));
  localStorage.setItem(TEST_LEADS_KEY, JSON.stringify(testLeads));
};

/**
 * Get all leads with optional filters
 * @param {Object} filters - { search, status, source, dateRange, startDate, endDate }
 * @returns {Array} Filtered leads
 */
export const getLeads = (filters = {}) => {
  let leads = getAllLeadsRaw();

  // Search filter — name, email, mobile, course (service_interest), state
  if (filters.search) {
    const q = filters.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        (l.name || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.mobile || "").includes(q) ||
        (l.service_interest || "").toLowerCase().includes(q) ||
        (l.state || "").toLowerCase().includes(q)
    );
  }

  // Status filter
  if (filters.status && filters.status !== "all") {
    leads = leads.filter((l) => l.status === filters.status);
  }

  // Source filter
  if (filters.source && filters.source !== "all") {
    leads = leads.filter((l) => l.source === filters.source);
  }

  // Date range filter
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
      leads = leads.filter((l) => new Date(l.submitted_at) >= startDate);
    }
    if (filters.dateRange === "custom" && filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      leads = leads.filter((l) => new Date(l.submitted_at) <= endDate);
    }
  }

  // Sort by date descending by default
  leads.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  return leads;
};

/**
 * Get a single lead by ID
 */
export const getLeadById = (id) => {
  const leads = getAllLeadsRaw();
  return leads.find((l) => l.lead_id === id) || null;
};

/**
 * Update lead status
 */
export const updateLeadStatus = (id, status) => {
  const leads = getAllLeadsRaw();
  const lead = leads.find((l) => l.lead_id === id);
  if (!lead) return null;

  const oldStatus = lead.status;
  lead.status = status;
  if (!lead.activity) lead.activity = [];
  lead.activity.push({
    // Action text is built from display labels; the timeline also re-maps any
    // quoted status at render time, so it always shows the present labels.
    action: describeStatusChange(oldStatus, status),
    status,
    timestamp: new Date().toISOString(),
  });
  // Last-write-wins marker so other devices know this edit is newer.
  lead.updated_at = new Date().toISOString();

  saveLeads(leads);
  notifyLeadsChanged();

  // Mirror to shared server store so other admins see the change.
  callLeadsApi("update", {
    lead_id: id,
    patch: {
      status: lead.status,
      activity: lead.activity,
      updated_at: lead.updated_at,
    },
  });

  // If Pabbly mode, also send to webhook
  if (isPabblyMode() && ADMIN_WEBHOOK_URL) {
    fetch(ADMIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'status_update',
        lead_id: id,
        new_status: status,
        old_status: oldStatus,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('[LeadService] Pabbly webhook failed:', err));
  }

  return lead;
};

/**
 * Add a note to a lead
 */
export const addLeadNote = (id, noteText) => {
  const leads = getAllLeadsRaw();
  const lead = leads.find((l) => l.lead_id === id);
  if (!lead) return null;

  if (!lead.notes) lead.notes = [];
  const note = {
    id: Date.now().toString(),
    text: noteText,
    timestamp: new Date().toISOString(),
  };
  lead.notes.push(note);

  if (!lead.activity) lead.activity = [];
  lead.activity.push({
    action: "Note added",
    status: lead.status,
    timestamp: new Date().toISOString(),
  });
  // Last-write-wins marker so other devices know this edit is newer.
  lead.updated_at = new Date().toISOString();

  saveLeads(leads);
  notifyLeadsChanged();

  // Mirror to shared server store so notes persist across admins.
  callLeadsApi("update", {
    lead_id: id,
    patch: {
      notes: lead.notes,
      activity: lead.activity,
      updated_at: lead.updated_at,
    },
  });

  // If Pabbly mode, also send to webhook
  if (isPabblyMode() && ADMIN_WEBHOOK_URL) {
    fetch(ADMIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'note_added',
        lead_id: id,
        note_text: noteText,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('[LeadService] Pabbly webhook failed:', err));
  }

  return lead;
};

/**
 * Persist conversion tracking details on a lead and mirror them to the shared
 * server store so the conversion value/type also appears on other devices.
 * Returns the updated lead, or null if not found.
 */
export const updateLeadConversion = (id, { conversion_value, conversion_type, converted_at }) => {
  const leads = getAllLeadsRaw();
  const lead = leads.find((l) => l.lead_id === id);
  if (!lead) return null;

  lead.conversion_value = conversion_value;
  lead.conversion_type = conversion_type;
  lead.converted_at = converted_at || new Date().toISOString();
  // Last-write-wins marker so other devices know this edit is newer.
  lead.updated_at = new Date().toISOString();

  saveLeads(leads);
  notifyLeadsChanged();

  // Mirror to shared server store so conversion data syncs across admins.
  callLeadsApi("update", {
    lead_id: id,
    patch: {
      conversion_value: lead.conversion_value,
      conversion_type: lead.conversion_type,
      converted_at: lead.converted_at,
      updated_at: lead.updated_at,
    },
  });

  return lead;
};

/**
 * Delete a single lead
 */
export const deleteLead = (id) => {
  const leads = getAllLeadsRaw();
  const filtered = leads.filter((l) => l.lead_id !== id);
  saveLeads(filtered);
  notifyLeadsChanged();

  // Mirror delete to shared server store.
  callLeadsApi("delete", { lead_ids: [id] });

  // If Pabbly mode, also send to webhook
  if (isPabblyMode() && ADMIN_WEBHOOK_URL) {
    fetch(ADMIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'lead_deleted',
        lead_id: id,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('[LeadService] Pabbly webhook failed:', err));
  }

  return true;
};

/**
 * Bulk delete leads
 */
export const deleteLeads = (ids) => {
  const idSet = new Set(ids);
  const leads = getAllLeadsRaw();
  const filtered = leads.filter((l) => !idSet.has(l.lead_id));
  saveLeads(filtered);
  notifyLeadsChanged();

  // Mirror bulk delete to shared server store.
  if (ids.length > 0) {
    callLeadsApi("delete", { lead_ids: ids });
  }

  // If Pabbly mode, also send to webhook for each deleted lead
  if (isPabblyMode() && ADMIN_WEBHOOK_URL) {
    ids.forEach(id => {
      fetch(ADMIN_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lead_deleted',
          lead_id: id,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('[LeadService] Pabbly webhook failed:', err));
    });
  }

  return true;
};

/**
 * Export leads to CSV string and trigger download
 */
export const exportLeadsCSV = (leads) => {
  const headers = [
    "Lead ID",
    "Name",
    "Mobile",
    "Email",
    "Course Interested",
    "State",
    "Source",
    "Status",
    "Submitted At",
    "Page URL",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "UTM Term",
    "UTM Content",
    "GCLID",
    "Notes",
  ];

  const escapeCSV = (val) => {
    const str = String(val || "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = leads.map((l) => [
    l.lead_id,
    l.name,
    l.mobile,
    l.email,
    l.service_interest,
    l.state,
    l.source,
    l.status,
    l.submitted_at,
    l.page_url,
    l.utm_source,
    l.utm_medium,
    l.utm_campaign,
    l.utm_term,
    l.utm_content,
    l.gclid,
    (l.notes || []).map((n) => n.text).join(" | "),
  ]);

  const csvContent =
    [headers.map(escapeCSV).join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `leads_export_${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Import leads from CSV string
 * @param {string} csvText - Raw CSV content
 * @returns {{ imported: number, duplicates: number }}
 */
export const importLeadsCSV = (csvText) => {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { imported: 0, duplicates: 0 };

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
  const mobileIdx = headers.findIndex((h) => h === "mobile");
  const existingLeads = getAllLeadsRaw();
  const existingMobiles = new Set(existingLeads.map((l) => l.mobile));

  let imported = 0;
  let duplicates = 0;

  const fieldMap = {
    "lead id": "lead_id",
    name: "name",
    mobile: "mobile",
    email: "email",
    // Canonical key is `service_interest` (kept from the public form); the
    // exported header label is "Course Interested" but legacy "Service
    // Interest" CSVs still import into the same key.
    "course interested": "service_interest",
    "service interest": "service_interest",
    state: "state",
    source: "source",
    status: "status",
    "submitted at": "submitted_at",
  };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/^"|"$/g, "").trim());
    const mobile = mobileIdx >= 0 ? values[mobileIdx] : null;

    if (mobile && existingMobiles.has(mobile)) {
      duplicates++;
      continue;
    }

    const lead = {
      lead_id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).slice(2),
      status: "new",
      submitted_at: new Date().toISOString(),
      notes: [],
      activity: [{ action: "Imported from CSV", status: "new", timestamp: new Date().toISOString() }],
    };

    headers.forEach((h, idx) => {
      const key = fieldMap[h] || h.replace(/\s+/g, "_");
      if (values[idx]) lead[key] = values[idx];
    });

    existingLeads.push(lead);
    if (mobile) existingMobiles.add(mobile);
    imported++;
  }

  saveLeads(existingLeads);
  notifyLeadsChanged();
  return { imported, duplicates };
};

/**
 * Get summary stats for the dashboard
 */
export const getLeadStats = () => {
  const leads = getAllLeadsRaw();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const totalLeads = leads.length;
  const newLeads24h = leads.filter(
    (l) => new Date(l.submitted_at) >= today
  ).length;
  const weekLeads = leads.filter(
    (l) => new Date(l.submitted_at) >= weekStart
  ).length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

  // Top source
  const sourceCounts = {};
  leads.forEach((l) => {
    const src = l.source || "unknown";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const topSource =
    Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Recent leads (last 5)
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .slice(0, 5);

  // Unique sources
  const sources = [...new Set(leads.map((l) => l.source).filter(Boolean))];

  return {
    totalLeads,
    newLeads24h,
    weekLeads,
    conversionRate,
    convertedLeads,
    topSource,
    recentLeads,
    sources,
  };
};
