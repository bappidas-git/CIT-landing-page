/* ============================================
   Webhook Lead Submission Utility
   Currently uses a DUMMY endpoint for testing.
   Replace WEBHOOK_URL with your Pabbly Connect
   webhook URL when ready for production.
   ============================================ */

// GCLID manager for persistent gclid storage
import { getStoredGclid } from "./gclidManager";

// =============================================
// CONFIGURATION — REPLACE THIS URL WITH YOUR
// PABBLY CONNECT WEBHOOK URL
// =============================================
const WEBHOOK_URL =
  "https://connect.pabbly.com/webhook-listener/webhook/IjU3NjIwNTZkMDYzZTA0Mzc1MjZmNTUzZCI_3D_pc/IjU3NjcwNTZmMDYzZjA0Mzc1MjZhNTUzNzUxM2Ei_pc";

// Set to true when Pabbly webhook is configured
const USE_PABBLY = true;

// Dummy endpoint for testing (simulates success after 1.5s)
const DUMMY_MODE = false;

// Server-side lead storage endpoint. Admin panel reads leads from here
// so submissions made on one browser are visible to admins on another.
// Override via REACT_APP_LEADS_API_URL if your PHP endpoint lives
// elsewhere. Leave blank to disable server persistence.
const LEADS_API_URL =
  process.env.REACT_APP_LEADS_API_URL || "/api/leads.php";

// localStorage keys
const LEADS_KEY = "lp_submitted_leads";
const TEST_LEADS_KEY = "lp_test_leads";

/**
 * Generate a UUID v4
 */
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Store a lead in localStorage for the LMS
 */
const storeLeadForLMS = (leadData, isTest = false) => {
  const key = isTest ? TEST_LEADS_KEY : LEADS_KEY;
  const existingLeads = JSON.parse(localStorage.getItem(key) || "[]");

  // Dedup: skip if lead_id already exists
  if (
    leadData.lead_id &&
    existingLeads.some((l) => l.lead_id === leadData.lead_id)
  ) {
    return leadData;
  }

  const leadWithMeta = {
    ...leadData,
    lead_id: leadData.lead_id || generateUUID(),
    status: leadData.status || "new",
    notes: [],
    activity: [
      {
        action: "Lead created",
        status: "new",
        timestamp: leadData.submitted_at || new Date().toISOString(),
      },
    ],
  };
  existingLeads.push(leadWithMeta);
  localStorage.setItem(key, JSON.stringify(existingLeads));

  // Notify any admin panel listeners in the SAME tab — the native
  // `storage` event only fires across tabs, so we emit a custom event
  // to cover the case where the form and admin share a browser tab.
  try {
    window.dispatchEvent(
      new CustomEvent("lp:lead-submitted", {
        detail: { lead: leadWithMeta, isTest },
      }),
    );
  } catch (_err) {
    // CustomEvent unsupported — ignore; storage event still covers cross-tab.
  }

  return leadWithMeta;
};

/**
 * Submit lead data to Pabbly webhook or dummy endpoint
 * @param {Object} leadData - The form data to submit
 * @param {string} leadData.name - Applicant's full name
 * @param {string} leadData.mobile - Mobile number
 * @param {string} leadData.email - Email address
 * @param {string} leadData.service_interest - Selected service of interest
 * @param {string} leadData.source - Form source identifier (e.g., 'hero-form', 'apply-now', 'contact-form')
 * @param {Object} [leadData.metadata] - Additional metadata
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const submitLeadToWebhook = async (leadData) => {
  // Enrich data with timestamp and page info
  const enrichedData = {
    ...leadData,
    lead_id: generateUUID(),
    status: "new",
    submitted_at: new Date().toISOString(),
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    utm_source:
      new URLSearchParams(window.location.search).get("utm_source") || "",
    utm_medium:
      new URLSearchParams(window.location.search).get("utm_medium") || "",
    utm_campaign:
      new URLSearchParams(window.location.search).get("utm_campaign") || "",
    utm_term: new URLSearchParams(window.location.search).get("utm_term") || "",
    utm_content:
      new URLSearchParams(window.location.search).get("utm_content") || "",
    gclid:
      new URLSearchParams(window.location.search).get("gclid") ||
      getStoredGclid() ||
      "",
  };

  // === DUMMY MODE (for testing) ===
  if (DUMMY_MODE || !USE_PABBLY) {
    console.log(
      "[DUMMY MODE] Lead captured:",
      JSON.stringify(enrichedData, null, 2),
    );

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Store complete lead data in localStorage for LMS
    storeLeadForLMS(enrichedData, true);

    console.log("[DUMMY MODE] Lead stored in localStorage for LMS.");
    console.log(
      `To view all test leads, run in console: JSON.parse(localStorage.getItem("${TEST_LEADS_KEY}"))`,
    );

    return { success: true, message: "Lead captured successfully (test mode)" };
  }

  // === PABBLY WEBHOOK MODE ===
  // Store the lead in localStorage FIRST so the admin panel reflects it
  // regardless of the webhook's CORS/response behavior. Pabbly webhook
  // endpoints often do not return CORS headers the browser can read, which
  // would otherwise make `response.ok` false (or throw) even though Pabbly
  // received the data successfully.
  storeLeadForLMS(enrichedData, false);

  // Persist the lead to the shared server-side store so the admin panel
  // can see leads submitted from OTHER browsers/devices. localStorage
  // alone is per-device and would otherwise leave the admin empty. Run
  // fire-and-forget so a server outage doesn't block the Pabbly POST.
  if (LEADS_API_URL) {
    fetch(LEADS_API_URL + "?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead: enrichedData }),
      keepalive: true,
    }).catch((err) => {
      console.error("[LeadsAPI] create failed:", err);
    });
  }

  // Pabbly's webhook endpoint does not return CORS headers, so a normal
  // `cors` fetch either throws or produces a response the browser reports
  // as non-ok even when Pabbly received the payload successfully. Using
  // `no-cors` means Pabbly still receives the POST, but the browser
  // returns an opaque response we can't inspect. Since the lead has
  // already been persisted locally and sent to the server-side store
  // above, we treat a completed Pabbly POST as a successful submission.
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrichedData),
      keepalive: true,
    });
    return { success: true, message: "Lead submitted successfully" };
  } catch (error) {
    // Network-level failure (user offline, DNS error, etc.). The lead is
    // already in localStorage and has been sent to the server-side store,
    // so the admin panel will still see it — but the Pabbly hand-off
    // failed, so surface success to the user while logging for debug.
    console.error("Webhook network error:", error);
    return { success: true, message: "Lead submitted successfully" };
  }
};

/**
 * Check if a lead with this mobile number or email was already submitted
 * from this device (localStorage-based duplicate prevention).
 * Email match is case-insensitive and only applied when an email is provided.
 */
export const isDuplicateLead = (mobile, email) => {
  const existingLeads = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  const testLeads = JSON.parse(localStorage.getItem(TEST_LEADS_KEY) || "[]");
  const allLeads = [...existingLeads, ...testLeads];
  const normalizedMobile = (mobile || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();
  return allLeads.some((lead) => {
    if (normalizedMobile && lead.mobile === normalizedMobile) return true;
    if (
      normalizedEmail &&
      lead.email &&
      lead.email.trim().toLowerCase() === normalizedEmail
    ) {
      return true;
    }
    return false;
  });
};

/**
 * Mark a mobile number as submitted (for duplicate prevention)
 */
export const markLeadAsSubmitted = (mobile) => {
  // No-op: leads are now stored with full data in storeLeadForLMS
  // This function is kept for backward compatibility with form components
};

/**
 * Get current webhook configuration flags
 * Used by admin panel to detect mode (Pabbly vs Dummy)
 */
export const getConfig = () => ({
  USE_PABBLY,
  DUMMY_MODE,
  WEBHOOK_URL,
  LEADS_API_URL,
});
