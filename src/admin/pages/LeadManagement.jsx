/* ============================================
   Lead Management Page
   Full-featured LMS with table, filters,
   detail panel, notes, export/import
   ============================================ */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Chip,
  Button,
  Menu,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
  getLeads,
  updateLeadStatus,
  deleteLead,
  deleteLeads,
  exportLeadsCSV,
  importLeadsCSV,
  getLeadStats,
  syncLeadsFromServer,
  onLeadsChanged,
} from "../utils/leadService";
import { STATUS_OPTIONS, getStatusConfig } from "../utils/leadStatus";
import {
  AFFORDABILITY_LABELS,
  FUNDING_PLAN_SHORT_LABELS,
  INTAKE_YEAR_LABELS,
  PARTIAL_HINT,
  QUALITY_BANDS,
  TEST_STATUS_OPTIONS,
  computeQualityScore,
  formatScore,
  formatSlot,
  getLeadTier,
  getQualityConfig,
  getTestSortValue,
  getTestStatus,
  getTestStatusConfig,
  getTierConfig,
  hasQualitySignal,
  labelFor,
  shortBranch,
} from "../utils/leadQuality";
import { exportGoogleAdsCSV } from "../utils/googleAdsExport";
import useMediaQuery from "../../hooks/useMediaQuery";
import styles from "./LeadManagement.module.css";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

// Tier filter. The default deliberately hides server-flagged spam — a
// telecaller should never have to scroll past junk — while "All + spam" keeps
// it one click away for anyone auditing what the anti-bot checks caught.
const TIER_FILTER_OPTIONS = [
  { value: "active", label: "All (no spam)" },
  { value: "application", label: "Application" },
  { value: "partial", label: "Partial" },
  { value: "enquiry", label: "Enquiry" },
  { value: "spam", label: "Spam only" },
  { value: "all", label: "All + spam" },
];

const QUALITY_FILTER_OPTIONS = [
  { value: "all", label: "All Quality" },
  ...QUALITY_BANDS.map((b) => ({ value: b.value, label: b.label })),
];

const INTAKE_FILTER_OPTIONS = [
  { value: "all", label: "All Intakes" },
  ...Object.keys(INTAKE_YEAR_LABELS).map((value) => ({
    value,
    label: INTAKE_YEAR_LABELS[value],
  })),
];

const FUNDING_FILTER_OPTIONS = [
  { value: "all", label: "All Funding" },
  ...Object.keys(FUNDING_PLAN_SHORT_LABELS).map((value) => ({
    value,
    label: FUNDING_PLAN_SHORT_LABELS[value],
  })),
];

// Merit-test state. "All" keeps legacy leads (never issued a key) visible;
// picking a specific state necessarily hides them, because they were never
// asked to sit the paper.
const TEST_FILTER_OPTIONS = [
  { value: "all", label: "All Tests" },
  ...TEST_STATUS_OPTIONS.map((t) => ({ value: t.value, label: t.label })),
];

const AFFORDABILITY_FILTER_OPTIONS = [
  { value: "all", label: "All Affordability" },
  ...Object.keys(AFFORDABILITY_LABELS).map((value) => ({
    value,
    label: AFFORDABILITY_LABELS[value],
  })),
];

/* ============================================
   TELECALLER QUEUES
   ============================================
   Two one-tap views onto the two calls the team actually makes. A preset is
   nothing more than a saved position of the filter + sort state above plus one
   extra predicate in the same filter chain (see `loadData`) — there is no
   second filtering path, so what the table shows always matches the chips.
   Touching any filter by hand drops the badge: the view is no longer the queue
   the button promised.
   ============================================ */
const QUEUE_PRESETS = {
  push_to_test: {
    label: "Push-to-test queue",
    icon: "mdi:key-arrow-right",
    hint: "Applicants holding a login key who have not finished the test — call, re-share the key, get them to attempt it.",
  },
  counselling: {
    label: "Counselling queue",
    icon: "mdi:phone-in-talk-outline",
    hint: "Finished papers, next call slot first. Unbooked applicants sort last, best scores first among them.",
  },
};

// Left-border accent + hint colour for an abandoned Step-1 application.
const PARTIAL_TIER = getTierConfig("partial");

// Columns whose first click should sort high-to-low — a score or a date is
// only useful with the best/newest at the top.
// `counselling_slot` is deliberately absent: the next call belongs at the top,
// so its first click sorts ascending.
const DESC_FIRST_COLUMNS = new Set([
  "quality",
  "eligibility_percent",
  "submitted_at",
  "test_status",
]);

const formatShortDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Columns config — `service_interest` is the canonical key (kept from the
// public form), displayed as "Course Interested" in the UI. `lead_tier` and
// `quality` are derived on read (leadQuality.js), not stored on the lead.
//
// This list drives the header row only. The body cells and the mobile card
// layout below are hand-written — all three must be kept in step.
const COLUMNS = [
  // Wide enough that the partial-lead hint under the name wraps to one extra
  // line instead of squeezing the column to a sliver.
  { id: "name", label: "Name", sortable: true, width: 190 },
  { id: "mobile", label: "Mobile", sortable: true, width: 130 },
  { id: "lead_tier", label: "Tier", sortable: true, width: 120 },
  { id: "quality", label: "Quality", sortable: true, width: 110 },
  // ---- Merit test & selection (server-written, see leadQuality.js) ----
  { id: "login_key", label: "Key", width: 110 },
  { id: "test_status", label: "Test", sortable: true, width: 120 },
  { id: "counselling_slot", label: "Call Slot", sortable: true, width: 140 },
  {
    id: "fee_affordability",
    label: "Affordability",
    sortable: true,
    width: 120,
    hideTablet: true,
  },
  { id: "branch_prefs", label: "Pref Branches", width: 140, hideTablet: true },
  { id: "intake_year", label: "Intake", sortable: true, width: 110 },
  {
    id: "eligibility_percent",
    label: "Eligibility %",
    sortable: true,
    width: 120,
    hideTablet: true,
  },
  {
    id: "funding_plan",
    label: "Funding",
    sortable: true,
    width: 140,
    hideTablet: true,
  },
  { id: "email", label: "Email", sortable: true, hideTablet: true },
  {
    id: "service_interest",
    label: "Course Interested",
    sortable: true,
    hideTablet: true,
  },
  { id: "state", label: "State", sortable: true, width: 120 },
  { id: "source", label: "Source", sortable: true, width: 130 },
  { id: "status", label: "Status", sortable: true, width: 150 },
  { id: "submitted_at", label: "Date", sortable: true, width: 100 },
];

/**
 * Render the stored eligibility aggregate as `72.4% ✔` / `41.0% –`, or a dash
 * when the lead never entered 12th marks (legacy and partial leads).
 * @param {Object} lead - Lead record
 * @returns {{text: string, met: boolean}|null} Display parts, or null
 */
const formatEligibility = (lead) => {
  const percent = Number(lead.eligibility_percent);
  if (!Number.isFinite(percent) || lead.eligibility_percent === "") return null;
  const met = lead.eligibility_met === true;
  return { text: `${percent.toFixed(1)}% ${met ? "✔" : "–"}`, met };
};

/**
 * Render both ranked branch choices as `CSE → ECE`, using the short names so
 * the column stays narrow. Returns "" when neither was answered.
 * @param {Object} lead - Lead record
 * @returns {string} Preference pair
 */
const formatBranchPrefs = (lead) =>
  [shortBranch(lead.branch_pref_1), shortBranch(lead.branch_pref_2)]
    .filter(Boolean)
    .join(" → ");

const LeadManagement = () => {
  const navigate = useNavigate();

  // Data state
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  // Qualification filters — composed on top of the filters above.
  const [tierFilter, setTierFilter] = useState("active");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [fundingFilter, setFundingFilter] = useState("all");
  const [testFilter, setTestFilter] = useState("all");
  const [affordabilityFilter, setAffordabilityFilter] = useState("all");
  // Active telecaller queue ("push_to_test" | "counselling" | null).
  const [queuePreset, setQueuePreset] = useState(null);

  // Table state
  const [orderBy, setOrderBy] = useState("submitted_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  // UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, string = single id
  const [bulkStatusMenu, setBulkStatusMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  // Login key most recently copied to the clipboard, so the row can confirm it.
  const [copiedKey, setCopiedKey] = useState(null);
  const fileInputRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Sources from data
  const [availableSources, setAvailableSources] = useState([]);

  // Manual refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  const loadData = useCallback(() => {
    const filters = {
      search,
      status: statusFilter,
      source: sourceFilter,
      dateRange,
      startDate: customStart,
      endDate: customEnd,
    };
    // The qualification filters are applied here rather than in leadService
    // because quality is derived in the admin and never stored on the lead.
    const data = getLeads(filters).filter((lead) => {
      const tier = getLeadTier(lead);
      if (tierFilter === "active") {
        if (tier === "spam") return false;
      } else if (tierFilter !== "all" && tier !== tierFilter) {
        return false;
      }
      if (qualityFilter !== "all") {
        // Legacy leads were never asked the scored questions, so a band
        // filter must not sweep them up as "Low".
        if (!hasQualitySignal(lead)) return false;
        if (computeQualityScore(lead).band !== qualityFilter) return false;
      }
      if (intakeFilter !== "all" && (lead.intake_year || "") !== intakeFilter) {
        return false;
      }
      if (
        fundingFilter !== "all" &&
        (lead.funding_plan || "") !== fundingFilter
      ) {
        return false;
      }
      if (testFilter !== "all" && getTestStatus(lead) !== testFilter) {
        return false;
      }
      if (
        affordabilityFilter !== "all" &&
        (lead.fee_affordability || "") !== affordabilityFilter
      ) {
        return false;
      }
      // The one queue rule the dropdowns above cannot express: an apply-funnel
      // lead that holds a key and still owes us a paper. Applied in the same
      // chain so the table can never disagree with the chips.
      if (queuePreset === "push_to_test") {
        if (!lead.login_key) return false;
        const funnelTier = getLeadTier(lead);
        if (funnelTier !== "application" && funnelTier !== "partial") return false;
        if (getTestStatus(lead) === "completed") return false;
      }
      return true;
    });
    setLeads(data);

    // Summary counts exclude spam so they agree with the Dashboard and with
    // the default table view, which hides spam too.
    const s = getLeadStats({ excludeSpam: true });
    setStats(s);
    setAvailableSources(s.sources);
  }, [
    search,
    statusFilter,
    sourceFilter,
    dateRange,
    customStart,
    customEnd,
    tierFilter,
    qualityFilter,
    intakeFilter,
    fundingFilter,
    testFilter,
    affordabilityFilter,
    queuePreset,
  ]);

  // Keep the latest loadData in a ref so event listeners below don't need
  // to re-bind every time filters change.
  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh from the server on mount so newly submitted leads from
  // other browsers/devices appear without requiring a full app reload.
  // Leads from paid traffic (Meta/Google ads) are submitted from a visitor's
  // browser, so the admin's localStorage is never the source of truth — the
  // server is. We sync on mount, then poll on an interval below.
  useEffect(() => {
    syncLeadsFromServer().then((result) => {
      if (
        !result.error &&
        (result.added > 0 || result.updated > 0 || result.removed > 0)
      ) {
        loadDataRef.current();
      }
    });
  }, []);

  // Auto-poll the server for new leads while the admin tab is visible.
  // Without this, leads submitted by ad visitors on other devices don't
  // appear until the admin clicks Refresh or the tab regains focus.
  useEffect(() => {
    const POLL_MS = 15000;
    let intervalId = null;

    const poll = () => {
      if (document.visibilityState !== "visible") return;
      syncLeadsFromServer().then((result) => {
        if (
          !result.error &&
          (result.added > 0 || result.updated > 0 || result.removed > 0)
        ) {
          loadDataRef.current();
        }
      });
    };

    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(poll, POLL_MS);
    };
    const stop = () => {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    };

    if (document.visibilityState === "visible") start();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        poll();
        start();
      } else {
        stop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Live-sync: reflect new leads and admin edits (status, notes, deletes)
  // without a hard reload. `onLeadsChanged` covers every channel — a new
  // public submission, a mutation in this same tab, a cross-tab `storage`
  // write, and a BroadcastChannel message from another window of the same
  // browser — so a status change in one window appears in all of them.
  useEffect(() => onLeadsChanged(() => loadDataRef.current()), []);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await syncLeadsFromServer();
      loadData();
      if (result.error) {
        showSnackbar(`Refresh failed: ${result.error}`, "error");
      } else {
        const parts = [];
        if (result.added > 0)
          parts.push(`${result.added} new`);
        if (result.updated > 0)
          parts.push(`${result.updated} updated`);
        if (result.removed > 0)
          parts.push(`${result.removed} removed`);
        showSnackbar(
          parts.length > 0
            ? `Refreshed — ${parts.join(", ")}`
            : "Refreshed — already up to date",
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Sorting. `quality` and `lead_tier` are derived rather than stored, and
  // eligibility must compare as a number, so those columns resolve their own
  // sort value instead of reading the raw field.
  const sortedLeads = useMemo(() => {
    const sortValue = (lead) => {
      switch (orderBy) {
        case "quality":
          return computeQualityScore(lead).score;
        case "lead_tier":
          return getTierConfig(getLeadTier(lead)).label.toLowerCase();
        case "eligibility_percent": {
          const percent = Number(lead.eligibility_percent);
          return Number.isFinite(percent) ? percent : -1;
        }
        case "funding_plan":
          return labelFor(
            FUNDING_PLAN_SHORT_LABELS,
            lead.funding_plan
          ).toLowerCase();
        case "test_status":
          return getTestSortValue(lead);
        case "counselling_slot": {
          const at = new Date(lead.counselling_slot || 0).getTime();
          // An unbooked applicant sorts last on the natural (ascending) click,
          // where the top of the list is the next call due.
          return lead.counselling_slot && Number.isFinite(at)
            ? at
            : Number.POSITIVE_INFINITY;
        }
        case "fee_affordability":
          return labelFor(
            AFFORDABILITY_LABELS,
            lead.fee_affordability
          ).toLowerCase();
        case "submitted_at":
          return new Date(lead.submitted_at || 0).getTime() || 0;
        default:
          return String(lead[orderBy] || "").toLowerCase();
      }
    };

    // Ties inside the call-slot column break on score, best first — that is
    // the whole ordering of the counselling queue's unbooked tail.
    const tieBreak = (a, b) => {
      if (orderBy !== "counselling_slot") return 0;
      return (Number(b.test_score) || 0) - (Number(a.test_score) || 0);
    };

    const sorted = [...leads];
    sorted.sort((a, b) => {
      const aVal = sortValue(a);
      const bVal = sortValue(b);
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return tieBreak(a, b);
    });
    return sorted;
  }, [leads, orderBy, order]);

  // Paginated leads
  const paginatedLeads = useMemo(
    () =>
      sortedLeads.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedLeads, page, rowsPerPage],
  );

  // Handlers

  // Any hand-made change to the view drops the queue badge — what is on screen
  // is no longer the queue the button promised.
  const clearPreset = () => setQueuePreset(null);

  const handleSort = (column) => {
    clearPreset();
    if (orderBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrder(DESC_FIRST_COLUMNS.has(column) ? "desc" : "asc");
    }
  };

  // Reset every filter to its default WITHOUT touching the preset badge, so a
  // queue button always starts from a clean view.
  const resetFilterState = () => {
    setSearch("");
    setStatusFilter("all");
    setSourceFilter("all");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
    setTierFilter("active");
    setQualityFilter("all");
    setIntakeFilter("all");
    setFundingFilter("all");
    setTestFilter("all");
    setAffordabilityFilter("all");
    setPage(0);
  };

  /**
   * Telecaller queue: everyone holding a login key who has not finished the
   * paper, newest application first. The "has a key, not completed" rule lives
   * in `loadData`; this only positions the shared filter/sort state.
   */
  const applyPushToTestQueue = () => {
    resetFilterState();
    // A selection made in another view means nothing in this one.
    setSelected([]);
    setOrderBy("submitted_at");
    setOrder("desc");
    setQueuePreset("push_to_test");
  };

  /**
   * Counselling Officer queue: finished papers ordered by the hour they booked,
   * next call on top. Applicants who never chose a slot fall to the bottom,
   * best score first, so the officer works down them when the diary is clear.
   */
  const applyCounsellingQueue = () => {
    resetFilterState();
    setSelected([]);
    setTestFilter("completed");
    setOrderBy("counselling_slot");
    setOrder("asc");
    setQueuePreset("counselling");
  };

  const handleCopyKey = (key) => {
    if (!key) return;
    if (!navigator.clipboard?.writeText) {
      showSnackbar("Clipboard unavailable — open the lead to copy the key", "warning");
      return;
    }
    navigator.clipboard
      .writeText(key)
      .then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      })
      .catch(() => showSnackbar("Could not copy the key", "warning"));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedLeads.map((l) => l.lead_id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleStatusChange = (id, newStatus) => {
    updateLeadStatus(id, newStatus);
    loadData();
    showSnackbar(`Status updated to "${getStatusConfig(newStatus).label}"`);
  };

  const handleBulkStatusChange = (newStatus) => {
    const count = selected.length;
    selected.forEach((id) => updateLeadStatus(id, newStatus));
    setBulkStatusMenu(null);
    setSelected([]);
    loadData();
    showSnackbar(`Updated ${count} leads to "${getStatusConfig(newStatus).label}"`);
  };

  const handleViewDetail = (lead) => {
    navigate(`/admin/lms/lead/${lead.lead_id}`);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteLead(deleteTarget);
      showSnackbar("Lead deleted");
    } else {
      deleteLeads(selected);
      showSnackbar(`${selected.length} leads deleted`);
      setSelected([]);
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
    loadData();
  };

  const handleExport = () => {
    const dataToExport =
      selected.length > 0
        ? leads.filter((l) => selected.includes(l.lead_id))
        : leads;
    exportLeadsCSV(dataToExport);
    showSnackbar(`Exported ${dataToExport.length} leads`);
  };

  const handleGoogleAdsExport = () => {
    const allLeads = getLeads({});
    const result = exportGoogleAdsCSV(allLeads);
    if (result.exported === 0) {
      showSnackbar(
        result.skipped > 0
          ? `No leads with GCLID to export (${result.skipped} converted leads have no GCLID)`
          : "No converted leads found for Google Ads export",
        "warning",
      );
    } else {
      showSnackbar(
        `Exported ${result.exported} conversions for Google Ads${result.skipped > 0 ? ` (${result.skipped} skipped — no GCLID)` : ""}`,
        "success",
      );
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = await importLeadsCSV(ev.target.result);
      loadData();
      showSnackbar(
        `Imported ${result.imported} leads (${result.duplicates} duplicates skipped)`,
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearFilters = () => {
    // Back to the default view, which still hides spam.
    resetFilterState();
    clearPreset();
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    sourceFilter !== "all" ||
    dateRange !== "all" ||
    tierFilter !== "active" ||
    qualityFilter !== "all" ||
    intakeFilter !== "all" ||
    fundingFilter !== "all" ||
    testFilter !== "all" ||
    affordabilityFilter !== "all" ||
    !!queuePreset;

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Admission Leads</h1>
          <p className={styles.pageSubtitle}>
            View and manage all 2026 B.E. admission leads in one place.
          </p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <Tooltip title="Refresh leads">
            <span>
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh leads"
                sx={{
                  border: "1px solid var(--admin-border)",
                  borderRadius: "8px",
                  color: "var(--admin-text-secondary)",
                  "&:hover": {
                    borderColor: "var(--admin-accent)",
                    color: "var(--admin-accent)",
                  },
                }}
              >
                <Icon
                  icon="mdi:refresh"
                  width={20}
                  className={refreshing ? styles.refreshSpinning : undefined}
                />
              </IconButton>
            </span>
          </Tooltip>
          {/* Telecaller queues — one tap to the list the team is calling from. */}
          {Object.entries(QUEUE_PRESETS).map(([key, preset]) => {
            const active = queuePreset === key;
            return (
              <Tooltip key={key} title={preset.hint}>
                <Button
                  variant={active ? "contained" : "outlined"}
                  size="small"
                  disableElevation
                  startIcon={<Icon icon={preset.icon} />}
                  onClick={() =>
                    active
                      ? clearFilters()
                      : key === "push_to_test"
                        ? applyPushToTestQueue()
                        : applyCounsellingQueue()
                  }
                  aria-pressed={active}
                  sx={{
                    textTransform: "none",
                    borderColor: "var(--admin-accent)",
                    color: active ? "#fff" : "var(--admin-accent)",
                    bgcolor: active ? "var(--admin-accent)" : "transparent",
                    "&:hover": {
                      borderColor: "var(--admin-accent)",
                      bgcolor: active
                        ? "var(--admin-accent)"
                        : "rgba(216, 38, 24, 0.06)",
                    },
                  }}
                >
                  {preset.label}
                </Button>
              </Tooltip>
            );
          })}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon icon="mdi:upload" />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              textTransform: "none",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-secondary)",
              "&:hover": {
                borderColor: "var(--admin-accent)",
                color: "var(--admin-accent)",
              },
            }}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon icon="mdi:download" />}
            onClick={handleExport}
            sx={{
              textTransform: "none",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-secondary)",
              "&:hover": {
                borderColor: "var(--admin-accent)",
                color: "var(--admin-accent)",
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Icon icon="mdi:google-ads" />}
            onClick={handleGoogleAdsExport}
            sx={{
              textTransform: "none",
              borderColor: "var(--admin-accent)",
              color: "var(--admin-accent)",
            }}
          >
            Export for Google Ads
          </Button>
        </div>
        {/* Mobile more menu */}
        <IconButton
          className={styles.moreMenuBtn}
          onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
          size="small"
          sx={{ border: "1px solid var(--admin-border)", borderRadius: "8px" }}
        >
          <Icon icon="mdi:dots-vertical" width={20} />
        </IconButton>
        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={() => setMoreMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              handleRefresh();
              setMoreMenuAnchor(null);
            }}
            disabled={refreshing}
          >
            <Icon
              icon="mdi:refresh"
              width={18}
              style={{ marginRight: 8 }}
              className={refreshing ? styles.refreshSpinning : undefined}
            />{" "}
            Refresh
          </MenuItem>
          {Object.entries(QUEUE_PRESETS).map(([key, preset]) => (
            <MenuItem
              key={key}
              selected={queuePreset === key}
              onClick={() => {
                if (queuePreset === key) clearFilters();
                else if (key === "push_to_test") applyPushToTestQueue();
                else applyCounsellingQueue();
                setMoreMenuAnchor(null);
              }}
            >
              <Icon icon={preset.icon} width={18} style={{ marginRight: 8 }} />{" "}
              {preset.label}
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              fileInputRef.current?.click();
              setMoreMenuAnchor(null);
            }}
          >
            <Icon icon="mdi:upload" width={18} style={{ marginRight: 8 }} />{" "}
            Import CSV
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleExport();
              setMoreMenuAnchor(null);
            }}
          >
            <Icon icon="mdi:download" width={18} style={{ marginRight: 8 }} />{" "}
            Export CSV
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleGoogleAdsExport();
              setMoreMenuAnchor(null);
            }}
          >
            <Icon icon="mdi:google-ads" width={18} style={{ marginRight: 8 }} />{" "}
            Export for Google Ads
          </MenuItem>
        </Menu>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <Icon icon="mdi:account-multiple" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.totalLeads}</p>
              <p className={styles.statLabel}>Total Leads</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <Icon icon="mdi:account-plus" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.newLeads24h}</p>
              <p className={styles.statLabel}>New Today</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconTeal}`}>
              <Icon icon="mdi:percent" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.conversionRate}%</p>
              <p className={styles.statLabel}>Conversion Rate</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <Icon icon="mdi:target" width={20} />
            </div>
            <div>
              <p className={styles.statValue} title={stats.topSource}>
                {stats.topSource.length > 14
                  ? stats.topSource.slice(0, 14) + "..."
                  : stats.topSource}
              </p>
              <p className={styles.statLabel}>Top Source</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Table Card */}
      <div className={styles.card}>
        {/* Filter Bar */}
        <div className={styles.filtersBar}>
          <TextField
            size="small"
            placeholder="Search by name, mobile, key, parent, district, school, course..."
            value={search}
            onChange={(e) => {
              clearPreset();
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon
                    icon="mdi:magnify"
                    width={20}
                    style={{ color: "var(--admin-text-muted)" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: "1 1 240px",
              minWidth: isMobile ? "100%" : 240,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                clearPreset();
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={sourceFilter}
              label="Source"
              onChange={(e) => {
                clearPreset();
                setSourceFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              <MenuItem value="all">All Sources</MenuItem>
              {availableSources.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Tier</InputLabel>
            <Select
              value={tierFilter}
              label="Tier"
              onChange={(e) => {
                clearPreset();
                setTierFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {TIER_FILTER_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Quality</InputLabel>
            <Select
              value={qualityFilter}
              label="Quality"
              onChange={(e) => {
                clearPreset();
                setQualityFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {QUALITY_FILTER_OPTIONS.map((q) => (
                <MenuItem key={q.value} value={q.value}>
                  {q.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Intake</InputLabel>
            <Select
              value={intakeFilter}
              label="Intake"
              onChange={(e) => {
                clearPreset();
                setIntakeFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {INTAKE_FILTER_OPTIONS.map((i) => (
                <MenuItem key={i.value} value={i.value}>
                  {i.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Funding</InputLabel>
            <Select
              value={fundingFilter}
              label="Funding"
              onChange={(e) => {
                clearPreset();
                setFundingFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {FUNDING_FILTER_OPTIONS.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Test</InputLabel>
            <Select
              value={testFilter}
              label="Test"
              onChange={(e) => {
                clearPreset();
                setTestFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {TEST_FILTER_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Affordability</InputLabel>
            <Select
              value={affordabilityFilter}
              label="Affordability"
              onChange={(e) => {
                clearPreset();
                setAffordabilityFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {AFFORDABILITY_FILTER_OPTIONS.map((a) => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => {
                clearPreset();
                setDateRange(e.target.value);
                setPage(0);
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--admin-accent)",
                },
              }}
            >
              {DATE_RANGE_OPTIONS.map((d) => (
                <MenuItem key={d.value} value={d.value}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {dateRange === "custom" && (
            <>
              <TextField
                size="small"
                type="date"
                label="Start Date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                size="small"
                type="date"
                label="End Date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
            </>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className={styles.filterChips}>
            {queuePreset && (
              <Chip
                label={`Queue: ${QUEUE_PRESETS[queuePreset].label}`}
                size="small"
                icon={
                  <Icon
                    icon={QUEUE_PRESETS[queuePreset].icon}
                    width={14}
                    style={{ color: "#fff" }}
                  />
                }
                onDelete={clearFilters}
                sx={{
                  bgcolor: "var(--admin-accent)",
                  color: "#fff",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": { color: "#ffffffcc" },
                }}
              />
            )}
            {search && (
              <Chip
                label={`Search: "${search}"`}
                size="small"
                onDelete={() => setSearch("")}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            {statusFilter !== "all" && (
              <Chip
                label={`Status: ${getStatusConfig(statusFilter).label}`}
                size="small"
                onDelete={() => setStatusFilter("all")}
                sx={{
                  bgcolor: getStatusConfig(statusFilter).bg,
                  color: getStatusConfig(statusFilter).color,
                  "& .MuiChip-deleteIcon": {
                    color: getStatusConfig(statusFilter).color,
                  },
                }}
              />
            )}
            {sourceFilter !== "all" && (
              <Chip
                label={`Source: ${sourceFilter}`}
                size="small"
                onDelete={() => setSourceFilter("all")}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            {tierFilter !== "active" && (
              <Chip
                label={`Tier: ${
                  TIER_FILTER_OPTIONS.find((t) => t.value === tierFilter)?.label
                }`}
                size="small"
                onDelete={() => setTierFilter("active")}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            {qualityFilter !== "all" && (
              <Chip
                label={`Quality: ${getQualityConfig(qualityFilter).label}`}
                size="small"
                onDelete={() => setQualityFilter("all")}
                sx={{
                  bgcolor: getQualityConfig(qualityFilter).bg,
                  color: getQualityConfig(qualityFilter).color,
                  "& .MuiChip-deleteIcon": {
                    color: getQualityConfig(qualityFilter).color,
                  },
                }}
              />
            )}
            {intakeFilter !== "all" && (
              <Chip
                label={`Intake: ${labelFor(INTAKE_YEAR_LABELS, intakeFilter)}`}
                size="small"
                onDelete={() => setIntakeFilter("all")}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            {fundingFilter !== "all" && (
              <Chip
                label={`Funding: ${labelFor(
                  FUNDING_PLAN_SHORT_LABELS,
                  fundingFilter
                )}`}
                size="small"
                onDelete={() => setFundingFilter("all")}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            {testFilter !== "all" && (
              <Chip
                label={`Test: ${getTestStatusConfig(testFilter).label}`}
                size="small"
                onDelete={() => {
                  clearPreset();
                  setTestFilter("all");
                }}
                sx={{
                  bgcolor: getTestStatusConfig(testFilter).bg,
                  color: getTestStatusConfig(testFilter).color,
                  "& .MuiChip-deleteIcon": {
                    color: getTestStatusConfig(testFilter).color,
                  },
                }}
              />
            )}
            {affordabilityFilter !== "all" && (
              <Chip
                label={`Affordability: ${labelFor(
                  AFFORDABILITY_LABELS,
                  affordabilityFilter
                )}`}
                size="small"
                onDelete={() => {
                  clearPreset();
                  setAffordabilityFilter("all");
                }}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            {dateRange !== "all" && (
              <Chip
                label={`Date: ${DATE_RANGE_OPTIONS.find((d) => d.value === dateRange)?.label}`}
                size="small"
                onDelete={() => {
                  setDateRange("all");
                  setCustomStart("");
                  setCustomEnd("");
                }}
                sx={{
                  bgcolor: "#EBF5FF",
                  color: "var(--admin-accent)",
                  "& .MuiChip-deleteIcon": { color: "var(--admin-accent)" },
                }}
              />
            )}
            <Chip
              label="Clear All"
              size="small"
              variant="outlined"
              onClick={clearFilters}
              sx={{
                cursor: "pointer",
                borderColor: "var(--admin-text-muted)",
                color: "var(--admin-text-muted)",
              }}
            />
          </div>
        )}

        {/* Bulk actions bar */}
        {selected.length > 0 && (
          <div className={styles.bulkBar}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "var(--admin-accent)", flex: 1 }}
            >
              {selected.length} lead{selected.length > 1 ? "s" : ""} selected
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => setBulkStatusMenu(e.currentTarget)}
              startIcon={<Icon icon="mdi:swap-horizontal" />}
              sx={{
                textTransform: "none",
                borderColor: "var(--admin-accent)",
                color: "var(--admin-accent)",
              }}
            >
              Change Status
            </Button>
            <Menu
              anchorEl={bulkStatusMenu}
              open={Boolean(bulkStatusMenu)}
              onClose={() => setBulkStatusMenu(null)}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem
                  key={s.value}
                  onClick={() => handleBulkStatusChange(s.value)}
                >
                  <Chip
                    label={s.label}
                    size="small"
                    sx={{
                      bgcolor: s.bg,
                      color: s.color,
                      fontWeight: 600,
                      mr: 1,
                    }}
                  />
                </MenuItem>
              ))}
            </Menu>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteDialogOpen(true);
              }}
              startIcon={<Icon icon="mdi:delete-outline" />}
              sx={{ textTransform: "none" }}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Content: Empty / Table / Cards */}
        {leads.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Icon icon="mdi:account-group-outline" width={64} height={64} />
            </div>
            <p className={styles.emptyText}>No admission leads found</p>
            <p className={styles.emptySubtext}>
              {hasActiveFilters
                ? "No results match your current filters. Try adjusting your search or filters."
                : "New admission leads will appear here as they come in from your landing page forms."}
            </p>
            {hasActiveFilters && (
              <Button
                size="small"
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderColor: "var(--admin-accent)",
                  color: "var(--admin-accent)",
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className={styles.desktopTable}>
              <div className={styles.tableWrap}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        padding="checkbox"
                        sx={{ bgcolor: "var(--admin-bg)", width: 48 }}
                      >
                        <Checkbox
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < paginatedLeads.length
                          }
                          checked={
                            paginatedLeads.length > 0 &&
                            selected.length === paginatedLeads.length
                          }
                          onChange={handleSelectAll}
                          size="small"
                        />
                      </TableCell>
                      {COLUMNS.filter(
                        (col) => !(col.hideTablet && isTablet),
                      ).map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{
                            bgcolor: "var(--admin-bg)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "var(--admin-text-muted)",
                            whiteSpace: "nowrap",
                            width: col.width || "auto",
                            borderBottom: "1px solid var(--admin-border)",
                          }}
                        >
                          {col.sortable ? (
                            <TableSortLabel
                              active={orderBy === col.id}
                              direction={orderBy === col.id ? order : "asc"}
                              onClick={() => handleSort(col.id)}
                              sx={{
                                color: "var(--admin-text-muted) !important",
                                "&.Mui-active": {
                                  color: "var(--admin-accent) !important",
                                },
                                "& .MuiTableSortLabel-icon": {
                                  color: "var(--admin-accent) !important",
                                },
                              }}
                            >
                              {col.label}
                            </TableSortLabel>
                          ) : (
                            col.label
                          )}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          bgcolor: "var(--admin-bg)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--admin-text-muted)",
                          width: 80,
                          borderBottom: "1px solid var(--admin-border)",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLeads.map((lead) => {
                      const sc = getStatusConfig(lead.status);
                      const isSelected = selected.includes(lead.lead_id);
                      const tier = getLeadTier(lead);
                      const tc = getTierConfig(tier);
                      const isPartial = tier === "partial";
                      const quality = computeQualityScore(lead);
                      const qc = getQualityConfig(quality.band);
                      const scored = hasQualitySignal(lead);
                      const eligibility = formatEligibility(lead);
                      // Test state is null for a lead that never held a key —
                      // it renders as a dash, never as "Not Started".
                      const testStatus = getTestStatus(lead);
                      const testConfig = getTestStatusConfig(testStatus);
                      const branchPrefs = formatBranchPrefs(lead);
                      return (
                        <TableRow
                          key={lead.lead_id}
                          onClick={() => handleViewDetail(lead)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isSelected
                              ? "rgba(43, 123, 213, 0.06)"
                              : "#fff",
                            // A partial lead keeps a subtle amber rail so an
                            // unfinished application is spottable while
                            // scanning the list.
                            borderLeft: isSelected
                              ? "3px solid var(--admin-accent)"
                              : isPartial
                                ? `3px solid ${PARTIAL_TIER.color}`
                                : "3px solid transparent",
                            "&:hover": { bgcolor: "#F8FAFF" },
                            transition: "background 0.15s ease",
                            "& td": {
                              borderBottom: "1px solid var(--admin-border)",
                            },
                          }}
                        >
                          <TableCell
                            padding="checkbox"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectOne(lead.lead_id)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "var(--admin-text-primary)",
                              }}
                            >
                              {lead.name || "—"}
                            </Typography>
                            {isPartial && (
                              <span className={styles.partialHint}>
                                {PARTIAL_HINT}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily:
                                  "'SF Mono', 'Fira Code', 'Roboto Mono', monospace",
                                fontSize: "0.8125rem",
                              }}
                            >
                              {lead.mobile || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tc.label}
                              size="small"
                              sx={{
                                bgcolor: tc.bg,
                                color: tc.color,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 22,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {scored ? (
                              <Tooltip
                                title={`Quality score ${quality.score}/100${
                                  quality.capped
                                    ? " — capped at Warm until the application is completed"
                                    : ""
                                }`}
                              >
                                <Chip
                                  label={qc.label}
                                  size="small"
                                  sx={{
                                    bgcolor: qc.bg,
                                    color: qc.color,
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                    height: 22,
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-muted)",
                                }}
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                          {/* Login key — the credential the telecaller reads
                              out on the call, so it copies in one tap. */}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {lead.login_key ? (
                              <Tooltip
                                title={
                                  copiedKey === lead.login_key
                                    ? "Copied"
                                    : "Copy login key"
                                }
                              >
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => handleCopyKey(lead.login_key)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleCopyKey(lead.login_key);
                                    }
                                  }}
                                  className={styles.keyCell}
                                >
                                  {lead.login_key}
                                  <Icon
                                    icon={
                                      copiedKey === lead.login_key
                                        ? "mdi:check"
                                        : "mdi:content-copy"
                                    }
                                    width={12}
                                  />
                                </span>
                              </Tooltip>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-muted)",
                                }}
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {testStatus ? (
                              <div className={styles.testCell}>
                                <Chip
                                  label={testConfig.label}
                                  size="small"
                                  sx={{
                                    bgcolor: testConfig.bg,
                                    color: testConfig.color,
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                    height: 22,
                                  }}
                                />
                                {testStatus === "completed" && (
                                  <span className={styles.testScore}>
                                    {formatScore(lead)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-muted)",
                                }}
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.8125rem",
                                fontWeight: lead.counselling_slot ? 600 : 400,
                                color: lead.counselling_slot
                                  ? "var(--admin-text-primary)"
                                  : "var(--admin-text-muted)",
                              }}
                            >
                              {formatSlot(lead.counselling_slot) || "—"}
                            </Typography>
                          </TableCell>
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-secondary)",
                                }}
                              >
                                {labelFor(
                                  AFFORDABILITY_LABELS,
                                  lead.fee_affordability
                                ) || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-secondary)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {branchPrefs || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.8125rem",
                                color: "var(--admin-text-secondary)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {labelFor(INTAKE_YEAR_LABELS, lead.intake_year) ||
                                "—"}
                            </Typography>
                          </TableCell>
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  fontWeight: eligibility?.met ? 600 : 400,
                                  whiteSpace: "nowrap",
                                  color: eligibility
                                    ? eligibility.met
                                      ? "var(--admin-success)"
                                      : "var(--admin-text-secondary)"
                                    : "var(--admin-text-muted)",
                                }}
                              >
                                {eligibility ? eligibility.text : "—"}
                              </Typography>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-secondary)",
                                }}
                              >
                                {labelFor(
                                  FUNDING_PLAN_SHORT_LABELS,
                                  lead.funding_plan
                                ) || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {lead.email || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "var(--admin-text-secondary)",
                                }}
                              >
                                {lead.service_interest || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "0.8125rem",
                                color: "var(--admin-text-secondary)",
                              }}
                            >
                              {lead.state || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={lead.source || "—"}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.7rem",
                                maxWidth: 130,
                                "& .MuiChip-label": {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={lead.status || "new"}
                              size="small"
                              onChange={(e) =>
                                handleStatusChange(lead.lead_id, e.target.value)
                              }
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                bgcolor: sc.bg,
                                color: sc.color,
                                height: 28,
                                borderRadius: "6px",
                                "& .MuiSelect-select": { py: 0.3, px: 1 },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: sc.color + "44",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: sc.color + "88",
                                },
                              }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s.value} value={s.value}>
                                  <Chip
                                    label={s.label}
                                    size="small"
                                    sx={{
                                      bgcolor: s.bg,
                                      color: s.color,
                                      fontWeight: 600,
                                    }}
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{
                                whiteSpace: "nowrap",
                                color: "var(--admin-text-secondary)",
                              }}
                            >
                              {formatShortDate(lead.submitted_at)}
                            </Typography>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(lead)}
                                sx={{
                                  color: "var(--admin-text-muted)",
                                  "&:hover": { color: "var(--admin-accent)" },
                                }}
                              >
                                <Icon icon="mdi:eye-outline" width={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteTarget(lead.lead_id);
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{
                                  color: "var(--admin-text-muted)",
                                  "&:hover": { color: "var(--admin-error)" },
                                }}
                              >
                                <Icon icon="mdi:delete-outline" width={18} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className={styles.mobileCards}>
              {paginatedLeads.map((lead) => {
                const sc = getStatusConfig(lead.status);
                const isSelected = selected.includes(lead.lead_id);
                const tier = getLeadTier(lead);
                const tc = getTierConfig(tier);
                const isPartial = tier === "partial";
                const quality = computeQualityScore(lead);
                const qc = getQualityConfig(quality.band);
                const scored = hasQualitySignal(lead);
                const eligibility = formatEligibility(lead);
                // One compact qualification line — only the answers this lead
                // actually has, so a legacy enquiry card is unchanged.
                const qualificationLine = [
                  labelFor(INTAKE_YEAR_LABELS, lead.intake_year),
                  eligibility ? `Eligibility ${eligibility.text}` : "",
                  labelFor(FUNDING_PLAN_SHORT_LABELS, lead.funding_plan),
                ]
                  .filter(Boolean)
                  .join(" · ");
                // Second compact line for the merit-test stage — again only
                // what this lead actually carries.
                const testStatus = getTestStatus(lead);
                const testConfig = getTestStatusConfig(testStatus);
                const branchPrefs = formatBranchPrefs(lead);
                const selectionLine = [
                  lead.counselling_slot
                    ? `Call ${formatSlot(lead.counselling_slot)}`
                    : "",
                  labelFor(AFFORDABILITY_LABELS, lead.fee_affordability),
                  branchPrefs,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div
                    key={lead.lead_id}
                    className={`${styles.leadCard} ${isPartial ? styles.leadCardPartial : ""} ${isSelected ? styles.leadCardSelected : ""}`}
                  >
                    <div className={styles.leadCardRow}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectOne(lead.lead_id)}
                          size="small"
                          sx={{ p: 0 }}
                        />
                        <span className={styles.leadCardName}>
                          {lead.name || "—"}
                        </span>
                      </div>
                      <span className={styles.leadCardDate}>
                        {formatShortDate(lead.submitted_at)}
                      </span>
                    </div>
                    <div
                      className={styles.leadCardMobile}
                      style={{ paddingLeft: 32 }}
                    >
                      {lead.mobile || "—"}
                    </div>
                    <div
                      className={styles.leadCardMobile}
                      style={{
                        paddingLeft: 32,
                        fontFamily: "inherit",
                        marginTop: 2,
                      }}
                    >
                      {lead.service_interest || "—"}
                      {lead.state ? ` · ${lead.state}` : ""}
                    </div>
                    {qualificationLine && (
                      <div
                        className={styles.leadCardMobile}
                        style={{
                          paddingLeft: 32,
                          fontFamily: "inherit",
                          marginTop: 2,
                        }}
                      >
                        {qualificationLine}
                      </div>
                    )}
                    {selectionLine && (
                      <div
                        className={styles.leadCardMobile}
                        style={{
                          paddingLeft: 32,
                          fontFamily: "inherit",
                          marginTop: 2,
                        }}
                      >
                        {selectionLine}
                      </div>
                    )}
                    {isPartial && (
                      <div
                        className={styles.partialHint}
                        style={{ paddingLeft: 32, marginTop: 4 }}
                      >
                        {PARTIAL_HINT}
                      </div>
                    )}
                    <div
                      className={styles.leadCardChips}
                      style={{ paddingLeft: 32 }}
                    >
                      <Chip
                        label={tc.label}
                        size="small"
                        sx={{
                          bgcolor: tc.bg,
                          color: tc.color,
                          fontWeight: 600,
                          fontSize: "0.65rem",
                          height: 24,
                        }}
                      />
                      {scored && (
                        <Tooltip title={`Quality score ${quality.score}/100`}>
                          <Chip
                            label={qc.label}
                            size="small"
                            sx={{
                              bgcolor: qc.bg,
                              color: qc.color,
                              fontWeight: 600,
                              fontSize: "0.65rem",
                              height: 24,
                            }}
                          />
                        </Tooltip>
                      )}
                      {testStatus && (
                        <Chip
                          label={
                            testStatus === "completed"
                              ? `${testConfig.label} · ${formatScore(lead)}`
                              : testConfig.label
                          }
                          size="small"
                          sx={{
                            bgcolor: testConfig.bg,
                            color: testConfig.color,
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 24,
                          }}
                        />
                      )}
                      {lead.login_key && (
                        <Chip
                          label={lead.login_key}
                          size="small"
                          variant="outlined"
                          icon={
                            <Icon
                              icon={
                                copiedKey === lead.login_key
                                  ? "mdi:check"
                                  : "mdi:content-copy"
                              }
                              width={12}
                            />
                          }
                          onClick={() => handleCopyKey(lead.login_key)}
                          sx={{
                            fontSize: "0.7rem",
                            height: 24,
                            fontFamily:
                              "'SF Mono', 'Fira Code', 'Roboto Mono', monospace",
                          }}
                        />
                      )}
                      <Chip
                        label={lead.source || "—"}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 24 }}
                      />
                      <Select
                        value={lead.status || "new"}
                        size="small"
                        onChange={(e) =>
                          handleStatusChange(lead.lead_id, e.target.value)
                        }
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: sc.bg,
                          color: sc.color,
                          height: 24,
                          borderRadius: "12px",
                          "& .MuiSelect-select": { py: 0, px: 1 },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: sc.color + "44",
                          },
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            <Chip
                              label={s.label}
                              size="small"
                              sx={{
                                bgcolor: s.bg,
                                color: s.color,
                                fontWeight: 600,
                              }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div
                      className={styles.leadCardActions}
                      style={{ paddingLeft: 32 }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(lead)}
                        sx={{ color: "var(--admin-text-muted)" }}
                      >
                        <Icon icon="mdi:eye-outline" width={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteTarget(lead.lead_id);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{
                          color: "var(--admin-text-muted)",
                          "&:hover": { color: "var(--admin-error)" },
                        }}
                      >
                        <Icon icon="mdi:delete-outline" width={18} />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={sortedLeads.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{
                borderTop: "1px solid var(--admin-border)",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "0.8125rem",
                    color: "var(--admin-text-secondary)",
                  },
                ...(isMobile && {
                  "& .MuiTablePagination-selectLabel": { display: "none" },
                  "& .MuiTablePagination-select": { display: "none" },
                  "& .MuiInputBase-root": { display: "none" },
                }),
              }}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? "Are you sure you want to delete this lead? This action cannot be undone."
              : `Are you sure you want to delete ${selected.length} selected lead(s)? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LeadManagement;
