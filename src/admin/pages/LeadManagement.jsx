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
} from "../utils/leadService";
import { exportGoogleAdsCSV } from "../utils/googleAdsExport";
import useMediaQuery from "../../hooks/useMediaQuery";
import styles from "./LeadManagement.module.css";

// Status config
const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "#2B7BD5", bg: "#EBF5FF" },
  { value: "contacted", label: "Contacted", color: "#F59E0B", bg: "#FFF7ED" },
  {
    value: "consultation_booked",
    label: "Consultation Booked",
    color: "#8B5CF6",
    bg: "#F3E8FF",
  },
  {
    value: "procedure_scheduled",
    label: "Procedure Scheduled",
    color: "#0097A7",
    bg: "#E0F7FA",
  },
  { value: "completed", label: "Completed", color: "#10B981", bg: "#ECFDF5" },
  {
    value: "not_interested",
    label: "Not Interested",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
];

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

const formatShortDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Columns config
const COLUMNS = [
  { id: "name", label: "Patient Name", sortable: true },
  { id: "mobile", label: "Phone", sortable: true, width: 130 },
  { id: "email", label: "Email", sortable: true },
  {
    id: "service_interest",
    label: "Service Interest",
    sortable: true,
    hideTablet: true,
  },
  { id: "source", label: "Source", sortable: true, width: 140 },
  { id: "status", label: "Status", sortable: true, width: 150 },
  { id: "submitted_at", label: "Date", sortable: true, width: 100 },
];

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
    const data = getLeads(filters);
    setLeads(data);

    const s = getLeadStats();
    setStats(s);
    setAvailableSources(s.sources);
  }, [search, statusFilter, sourceFilter, dateRange, customStart, customEnd]);

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
      if (!result.error && result.added > 0) {
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
        if (!result.error && result.added > 0) {
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

  // Live-sync: reflect new leads without a hard reload.
  //
  // 1. `lp:lead-submitted` — custom event dispatched by webhookSubmit after
  //    it writes to localStorage. Covers same-tab submissions (native
  //    `storage` events don't fire in the originating tab).
  // 2. `storage` — cross-tab changes to lp_submitted_leads.
  useEffect(() => {
    const handleLeadSubmitted = () => loadDataRef.current();

    const handleStorage = (e) => {
      if (e.key === "lp_submitted_leads" || e.key === "lp_test_leads") {
        loadDataRef.current();
      }
    };

    window.addEventListener("lp:lead-submitted", handleLeadSubmitted);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("lp:lead-submitted", handleLeadSubmitted);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await syncLeadsFromServer();
      loadData();
      if (result.error) {
        showSnackbar(`Refresh failed: ${result.error}`, "error");
      } else if (result.added > 0) {
        showSnackbar(
          `Refreshed — ${result.added} new lead${result.added === 1 ? "" : "s"} synced`,
        );
      } else {
        showSnackbar("Refreshed — already up to date");
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Sorting
  const sortedLeads = useMemo(() => {
    const sorted = [...leads];
    sorted.sort((a, b) => {
      let aVal = a[orderBy] || "";
      let bVal = b[orderBy] || "";
      if (orderBy === "submitted_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
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
  const handleSort = (column) => {
    if (orderBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrder("asc");
    }
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
    showSnackbar(`Status updated to "${newStatus}"`);
  };

  const handleBulkStatusChange = (newStatus) => {
    selected.forEach((id) => updateLeadStatus(id, newStatus));
    setBulkStatusMenu(null);
    setSelected([]);
    loadData();
    showSnackbar(`Updated ${selected.length} leads to "${newStatus}"`);
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
    reader.onload = (ev) => {
      const result = importLeadsCSV(ev.target.result);
      loadData();
      showSnackbar(
        `Imported ${result.imported} leads (${result.duplicates} duplicates skipped)`,
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSourceFilter("all");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
    setPage(0);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    sourceFilter !== "all" ||
    dateRange !== "all";

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Consultation Requests</h1>
          <p className={styles.pageSubtitle}>
            View and manage all consultation requests in one place.
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
            placeholder="Search by patient name, email, or phone..."
            value={search}
            onChange={(e) => {
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
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => {
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
            <p className={styles.emptyText}>No consultation requests found</p>
            <p className={styles.emptySubtext}>
              {hasActiveFilters
                ? "No results match your current filters. Try adjusting your search or filters."
                : "New consultation requests will appear here as they come in from your landing page forms."}
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
                      return (
                        <TableRow
                          key={lead.lead_id}
                          onClick={() => handleViewDetail(lead)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isSelected
                              ? "rgba(43, 123, 213, 0.06)"
                              : "#fff",
                            borderLeft: isSelected
                              ? "3px solid var(--admin-accent)"
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
                return (
                  <div
                    key={lead.lead_id}
                    className={`${styles.leadCard} ${isSelected ? styles.leadCardSelected : ""}`}
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
                      className={styles.leadCardChips}
                      style={{ paddingLeft: 32 }}
                    >
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
