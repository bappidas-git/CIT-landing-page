/* ============================================
   Dashboard Page — Redesigned Professional UI
   ============================================ */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Chip, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getLeadStats, exportLeadsCSV, getLeads, syncLeadsFromServer, onLeadsChanged } from '../utils/leadService';
import { getStatusConfig } from '../utils/leadStatus';
import styles from './Dashboard.module.css';

const formatDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const Dashboard = () => {
  useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const refresh = () => setStats(getLeadStats());
    refresh();

    // Initial server sync so leads from ad visitors on other devices appear.
    // React to BOTH new leads and updated ones (e.g. a status change made on
    // another device) so the recent-leads status chips stay current.
    syncLeadsFromServer().then((result) => {
      if (!result.error && (result.added > 0 || result.updated > 0)) refresh();
    });

    // Reflect new leads and admin edits from any tab/window of this browser.
    const unsubscribe = onLeadsChanged(refresh);

    // Poll the server every 15s while visible to catch new ad-driven leads
    // and status changes synced from other devices.
    const POLL_MS = 15000;
    let intervalId = null;
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      syncLeadsFromServer().then((result) => {
        if (!result.error && (result.added > 0 || result.updated > 0)) refresh();
      });
    };
    const startPolling = () => {
      if (!intervalId) intervalId = setInterval(poll, POLL_MS);
    };
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        poll();
        refresh();
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") startPolling();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const statCards = [
    { label: 'Total Admission Leads', value: stats?.totalLeads ?? 0, icon: 'mdi:account-multiple', colorClass: 'statIconBlue' },
    { label: 'New Today', value: stats?.newLeads24h ?? 0, icon: 'mdi:account-plus', colorClass: 'statIconGreen' },
    { label: 'This Week', value: stats?.weekLeads ?? 0, icon: 'mdi:calendar-week', colorClass: 'statIconPink' },
    { label: 'Conversion Rate', value: `${stats?.conversionRate ?? 0}%`, icon: 'mdi:percent', colorClass: 'statIconTeal' },
  ];

  const recentLeads = stats?.recentLeads || [];

  const handleExportCSV = () => {
    const leads = getLeads();
    exportLeadsCSV(leads);
  };

  const handleViewLead = (leadId) => {
    navigate(`/admin/lms/lead/${leadId}`);
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await syncLeadsFromServer();
      setStats(getLeadStats());
      if (result.error) {
        setSnackbar({ open: true, message: `Refresh failed: ${result.error}`, severity: "error" });
      } else if (result.added > 0) {
        setSnackbar({
          open: true,
          message: `Refreshed — ${result.added} new lead${result.added === 1 ? "" : "s"} synced`,
          severity: "success",
        });
      } else {
        setSnackbar({ open: true, message: "Refreshed — already up to date", severity: "success" });
      }
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Welcome to CIT Admissions Lead Management. Here&rsquo;s your admission lead overview.
          </p>
        </div>
        <div className={styles.headerRight}>
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
          <div className={styles.headerDate}>
            <Icon icon="mdi:calendar-outline" width={18} height={18} />
            <span>{formatDate()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles[stat.colorClass]}`}>
              <Icon icon={stat.icon} width={22} height={22} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.actionOutlined} onClick={handleExportCSV}>
          <Icon icon="mdi:download-outline" width={18} height={18} />
          Export All Leads
        </button>
        <Link to="/admin/lms" className={styles.actionSolid}>
          <Icon icon="mdi:account-group-outline" width={18} height={18} />
          View All Leads
        </Link>
        <Link to="/admin/guideline" className={styles.actionGhost}>
          <Icon icon="mdi:book-open-outline" width={18} height={18} />
          Open Guideline
        </Link>
      </div>

      {/* Recent Leads Section */}
      <div className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.sectionTitle}>Recent Admission Leads</h2>
          <Link to="/admin/lms" className={styles.viewAllLink}>
            View All <Icon icon="mdi:arrow-right" width={16} height={16} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Icon icon="mdi:inbox-outline" width={56} height={56} />
            </div>
            <p className={styles.emptyText}>No admission leads yet</p>
            <p className={styles.emptySubtext}>
              New admission leads will appear here as they come in from your landing page forms.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.recentTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Course</th>
                    <th>State</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, idx) => {
                    const sc = getStatusConfig(lead.status);
                    return (
                      <tr key={lead.lead_id} className={idx % 2 === 1 ? styles.rowAlt : undefined}>
                        <td className={styles.leadName}>{lead.name || '—'}</td>
                        <td>{lead.mobile || '—'}</td>
                        <td>{lead.service_interest || '—'}</td>
                        <td>{lead.state || '—'}</td>
                        <td>
                          <Chip
                            label={sc.label}
                            size="small"
                            sx={{
                              bgcolor: sc.bg,
                              color: sc.color,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </td>
                        <td className={styles.leadDate}>
                          {lead.submitted_at
                            ? new Date(lead.submitted_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td>
                          <IconButton
                            size="small"
                            onClick={() => handleViewLead(lead.lead_id)}
                            sx={{ color: 'var(--admin-accent)' }}
                          >
                            <Icon icon="mdi:eye-outline" width={18} height={18} />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className={styles.mobileCards}>
              {recentLeads.map((lead) => {
                const sc = getStatusConfig(lead.status);
                return (
                  <div
                    key={lead.lead_id}
                    className={styles.mobileCard}
                    onClick={() => handleViewLead(lead.lead_id)}
                  >
                    <div className={styles.mobileCardTop}>
                      <span className={styles.mobileCardName}>{lead.name || '—'}</span>
                      <Chip
                        label={sc.label}
                        size="small"
                        sx={{
                          bgcolor: sc.bg,
                          color: sc.color,
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 22,
                        }}
                      />
                    </div>
                    <div className={styles.mobileCardRow}>
                      <Icon icon="mdi:phone-outline" width={14} height={14} />
                      <span>{lead.mobile || '—'}</span>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <Icon icon="mdi:school-outline" width={14} height={14} />
                      <span>{lead.service_interest || '—'}</span>
                    </div>
                    <div className={styles.mobileCardBottom}>
                      <Chip
                        label={lead.state || '—'}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                      <span className={styles.mobileCardDate}>
                        {lead.submitted_at
                          ? new Date(lead.submitted_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer Badge */}
      <p className={styles.footerBadge}>
        CIT Admissions Admin Panel | Lead Management System v1.0
      </p>

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

export default Dashboard;
