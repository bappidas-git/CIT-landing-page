/* ============================================
   Tele-Calling Management Page
   Telecaller-entered leads with table, filters,
   stats, Add New, bulk actions and CSV export.
   Mirrors the Lead Management module but its data
   is created manually by telecallers (not by the
   public website form). Syncs across every browser
   /device via the shared telecalls server store.
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
  getTelecalls,
  createTelecall,
  updateTelecallStatus,
  deleteTelecall,
  deleteTelecalls,
  exportTelecallsCSV,
  getTelecallStats,
  syncTelecallsFromServer,
  onTelecallsChanged,
} from "../utils/telecallService";
import {
  TELECALL_STATUS_OPTIONS,
  NURTURED_BY_OPTIONS,
  getTelecallStatusConfig,
} from "../utils/telecallStatus";
import TelecallFormDialog from "../components/TelecallFormDialog";
import useMediaQuery from "../../hooks/useMediaQuery";
import styles from "./LeadManagement.module.css";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

const formatShortDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCallback = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const COLUMNS = [
  { id: "name", label: "Name", sortable: true },
  { id: "mobile", label: "Mobile", sortable: true, width: 130 },
  { id: "state", label: "State", sortable: true, width: 120, hideTablet: true },
  { id: "nurtured_by", label: "Nurtured By", sortable: true, hideTablet: true },
  { id: "status", label: "Status", sortable: true, width: 180 },
  { id: "callback_at", label: "Callback", sortable: true, width: 130 },
  { id: "created_at", label: "Date", sortable: true, width: 100 },
];

const TeleCalling = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nurturedByFilter, setNurturedByFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Table
  const [orderBy, setOrderBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  // UI
  const [addOpen, setAddOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkStatusMenu, setBulkStatusMenu] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const loadData = useCallback(() => {
    const filters = {
      search,
      status: statusFilter,
      nurturedBy: nurturedByFilter,
      dateRange,
      startDate: customStart,
      endDate: customEnd,
    };
    setRecords(getTelecalls(filters));
    setStats(getTelecallStats());
  }, [search, statusFilter, nurturedByFilter, dateRange, customStart, customEnd]);

  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Initial sync from the server (records entered on other devices appear).
  useEffect(() => {
    syncTelecallsFromServer().then((result) => {
      if (
        !result.error &&
        (result.added > 0 || result.updated > 0 || result.removed > 0)
      ) {
        loadDataRef.current();
      }
    });
  }, []);

  // Auto-poll the server while the tab is visible.
  useEffect(() => {
    const POLL_MS = 15000;
    let intervalId = null;

    const poll = () => {
      if (document.visibilityState !== "visible") return;
      syncTelecallsFromServer().then((result) => {
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

  // Live-sync across tabs/windows of the same browser.
  useEffect(() => onTelecallsChanged(() => loadDataRef.current()), []);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await syncTelecallsFromServer();
      loadData();
      if (result.error) {
        showSnackbar(`Refresh failed: ${result.error}`, "error");
      } else {
        const parts = [];
        if (result.added > 0) parts.push(`${result.added} new`);
        if (result.updated > 0) parts.push(`${result.updated} updated`);
        if (result.removed > 0) parts.push(`${result.removed} removed`);
        showSnackbar(
          parts.length > 0
            ? `Refreshed — ${parts.join(", ")}`
            : "Refreshed — already up to date"
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  const sortedRecords = useMemo(() => {
    const sorted = [...records];
    sorted.sort((a, b) => {
      let aVal = a[orderBy] || "";
      let bVal = b[orderBy] || "";
      if (orderBy === "created_at" || orderBy === "callback_at") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [records, orderBy, order]);

  const paginatedRecords = useMemo(
    () => sortedRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRecords, page, rowsPerPage]
  );

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
      setSelected(paginatedRecords.map((r) => r.telecall_id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleStatusChange = (id, newStatus) => {
    updateTelecallStatus(id, newStatus);
    loadData();
    showSnackbar(`Status updated to "${getTelecallStatusConfig(newStatus).label}"`);
  };

  const handleBulkStatusChange = (newStatus) => {
    const count = selected.length;
    selected.forEach((id) => updateTelecallStatus(id, newStatus));
    setBulkStatusMenu(null);
    setSelected([]);
    loadData();
    showSnackbar(`Updated ${count} leads to "${getTelecallStatusConfig(newStatus).label}"`);
  };

  const handleViewDetail = (record) => {
    navigate(`/admin/tele-calling/lead/${record.telecall_id}`);
  };

  const handleAddSave = (fields) => {
    const created = createTelecall(fields);
    setAddOpen(false);
    loadData();
    showSnackbar("Tele-calling lead added");
    if (created) navigate(`/admin/tele-calling/lead/${created.telecall_id}`);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteTelecall(deleteTarget);
      showSnackbar("Lead deleted");
    } else {
      deleteTelecalls(selected);
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
        ? records.filter((r) => selected.includes(r.telecall_id))
        : records;
    exportTelecallsCSV(dataToExport);
    showSnackbar(`Exported ${dataToExport.length} records`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setNurturedByFilter("all");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
    setPage(0);
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "all" ||
    nurturedByFilter !== "all" ||
    dateRange !== "all";

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Tele-Calling Leads</h1>
          <p className={styles.pageSubtitle}>
            Log and manage leads contacted by the tele-calling team.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh"
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
            variant="contained"
            size="small"
            startIcon={<Icon icon="mdi:plus" />}
            onClick={() => setAddOpen(true)}
            sx={{
              textTransform: "none",
              bgcolor: "var(--admin-accent)",
              "&:hover": { bgcolor: "var(--admin-accent-light)" },
            }}
          >
            Add New
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
              setAddOpen(true);
              setMoreMenuAnchor(null);
            }}
          >
            <Icon icon="mdi:plus" width={18} style={{ marginRight: 8 }} /> Add New
          </MenuItem>
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
              handleExport();
              setMoreMenuAnchor(null);
            }}
          >
            <Icon icon="mdi:download" width={18} style={{ marginRight: 8 }} /> Export CSV
          </MenuItem>
        </Menu>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <Icon icon="mdi:phone-log" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.totalRecords}</p>
              <p className={styles.statLabel}>Total Leads</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <Icon icon="mdi:account-plus" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.newToday}</p>
              <p className={styles.statLabel}>New Today</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconTeal}`}>
              <Icon icon="mdi:seat" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.conversionRate}%</p>
              <p className={styles.statLabel}>Seat Booked Rate</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <Icon icon="mdi:calendar-clock" width={20} />
            </div>
            <div>
              <p className={styles.statValue}>{stats.upcomingCallbacks}</p>
              <p className={styles.statLabel}>Upcoming Callbacks</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Table Card */}
      <div className={styles.card}>
        <div className={styles.filtersBar}>
          <TextField
            size="small"
            placeholder="Search by name, mobile, state, or telecaller..."
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
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="all">All Status</MenuItem>
              {TELECALL_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Nurtured By</InputLabel>
            <Select
              value={nurturedByFilter}
              label="Nurtured By"
              onChange={(e) => {
                setNurturedByFilter(e.target.value);
                setPage(0);
              }}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="all">All Telecallers</MenuItem>
              {NURTURED_BY_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
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
              sx={{ borderRadius: "8px" }}
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
                sx={{ bgcolor: "#EBF5FF", color: "var(--admin-accent)" }}
              />
            )}
            {statusFilter !== "all" && (
              <Chip
                label={`Status: ${getTelecallStatusConfig(statusFilter).label}`}
                size="small"
                onDelete={() => setStatusFilter("all")}
                sx={{
                  bgcolor: getTelecallStatusConfig(statusFilter).bg,
                  color: getTelecallStatusConfig(statusFilter).color,
                }}
              />
            )}
            {nurturedByFilter !== "all" && (
              <Chip
                label={`Nurtured By: ${nurturedByFilter}`}
                size="small"
                onDelete={() => setNurturedByFilter("all")}
                sx={{ bgcolor: "#EBF5FF", color: "var(--admin-accent)" }}
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
                sx={{ bgcolor: "#EBF5FF", color: "var(--admin-accent)" }}
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
              {TELECALL_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} onClick={() => handleBulkStatusChange(s.value)}>
                  <Chip
                    label={s.label}
                    size="small"
                    sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, mr: 1 }}
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
        {records.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Icon icon="mdi:phone-outline" width={64} height={64} />
            </div>
            <p className={styles.emptyText}>No tele-calling leads yet</p>
            <p className={styles.emptySubtext}>
              {hasActiveFilters
                ? "No results match your current filters. Try adjusting your search or filters."
                : 'Click "Add New" to log the first lead your team has called.'}
            </p>
            {hasActiveFilters ? (
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
            ) : (
              <Button
                size="small"
                variant="contained"
                startIcon={<Icon icon="mdi:plus" />}
                onClick={() => setAddOpen(true)}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  bgcolor: "var(--admin-accent)",
                  "&:hover": { bgcolor: "var(--admin-accent-light)" },
                }}
              >
                Add New
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
                      <TableCell padding="checkbox" sx={{ bgcolor: "var(--admin-bg)", width: 48 }}>
                        <Checkbox
                          indeterminate={
                            selected.length > 0 && selected.length < paginatedRecords.length
                          }
                          checked={
                            paginatedRecords.length > 0 &&
                            selected.length === paginatedRecords.length
                          }
                          onChange={handleSelectAll}
                          size="small"
                        />
                      </TableCell>
                      {COLUMNS.filter((col) => !(col.hideTablet && isTablet)).map((col) => (
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
                                "&.Mui-active": { color: "var(--admin-accent) !important" },
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
                    {paginatedRecords.map((record) => {
                      const sc = getTelecallStatusConfig(record.status);
                      const isSelected = selected.includes(record.telecall_id);
                      return (
                        <TableRow
                          key={record.telecall_id}
                          onClick={() => handleViewDetail(record)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isSelected ? "rgba(43, 123, 213, 0.06)" : "#fff",
                            borderLeft: isSelected
                              ? "3px solid var(--admin-accent)"
                              : "3px solid transparent",
                            "&:hover": { bgcolor: "#F8FAFF" },
                            transition: "background 0.15s ease",
                            "& td": { borderBottom: "1px solid var(--admin-border)" },
                          }}
                        >
                          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectOne(record.telecall_id)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "var(--admin-text-primary)" }}
                            >
                              {record.name || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'SF Mono', 'Fira Code', 'Roboto Mono', monospace",
                                fontSize: "0.8125rem",
                              }}
                            >
                              {record.mobile || "—"}
                            </Typography>
                          </TableCell>
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.8125rem", color: "var(--admin-text-secondary)" }}
                              >
                                {record.state || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.8125rem", color: "var(--admin-text-secondary)" }}
                              >
                                {record.nurtured_by || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={record.status || "hot"}
                              size="small"
                              onChange={(e) =>
                                handleStatusChange(record.telecall_id, e.target.value)
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
                              {TELECALL_STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s.value} value={s.value}>
                                  <Chip
                                    label={s.label}
                                    size="small"
                                    sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }}
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
                                color: record.callback_scheduled
                                  ? "var(--admin-accent)"
                                  : "var(--admin-text-muted)",
                                fontWeight: record.callback_scheduled ? 600 : 400,
                              }}
                            >
                              {record.callback_scheduled
                                ? formatCallback(record.callback_at)
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              sx={{ whiteSpace: "nowrap", color: "var(--admin-text-secondary)" }}
                            >
                              {formatShortDate(record.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(record)}
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
                                  setDeleteTarget(record.telecall_id);
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
              {paginatedRecords.map((record) => {
                const sc = getTelecallStatusConfig(record.status);
                const isSelected = selected.includes(record.telecall_id);
                return (
                  <div
                    key={record.telecall_id}
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
                          onChange={() => handleSelectOne(record.telecall_id)}
                          size="small"
                          sx={{ p: 0 }}
                        />
                        <span className={styles.leadCardName}>{record.name || "—"}</span>
                      </div>
                      <span className={styles.leadCardDate}>
                        {formatShortDate(record.created_at)}
                      </span>
                    </div>
                    <div className={styles.leadCardMobile} style={{ paddingLeft: 32 }}>
                      {record.mobile || "—"}
                    </div>
                    <div
                      className={styles.leadCardMobile}
                      style={{ paddingLeft: 32, fontFamily: "inherit", marginTop: 2 }}
                    >
                      {record.nurtured_by || "—"}
                      {record.state ? ` · ${record.state}` : ""}
                    </div>
                    {record.callback_scheduled && record.callback_at && (
                      <div
                        className={styles.leadCardMobile}
                        style={{
                          paddingLeft: 32,
                          fontFamily: "inherit",
                          marginTop: 2,
                          color: "var(--admin-accent)",
                          fontWeight: 600,
                        }}
                      >
                        Callback: {formatCallback(record.callback_at)}
                      </div>
                    )}
                    <div className={styles.leadCardChips} style={{ paddingLeft: 32 }}>
                      <Select
                        value={record.status || "hot"}
                        size="small"
                        onChange={(e) => handleStatusChange(record.telecall_id, e.target.value)}
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
                        {TELECALL_STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            <Chip
                              label={s.label}
                              size="small"
                              sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div className={styles.leadCardActions} style={{ paddingLeft: 32 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(record)}
                        sx={{ color: "var(--admin-text-muted)" }}
                      >
                        <Icon icon="mdi:eye-outline" width={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteTarget(record.telecall_id);
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
              count={sortedRecords.length}
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
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
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

      {/* Add New Dialog */}
      <TelecallFormDialog
        open={addOpen}
        mode="create"
        onClose={() => setAddOpen(false)}
        onSave={handleAddSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? "Are you sure you want to delete this lead? This action cannot be undone."
              : `Are you sure you want to delete ${selected.length} selected lead(s)? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
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

export default TeleCalling;
