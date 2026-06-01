/* ============================================
   Tele-Calling Lead Detail Page
   Dedicated full-page view for a telecaller-entered
   lead: edit fields, change status, add notes, and
   see the activity timeline. Stays in sync with the
   shared server store across every browser/device,
   exactly like the Lead Detail page.
   ============================================ */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
  getTelecallById,
  updateTelecallStatus,
  updateTelecallFields,
  addTelecallNote,
  deleteTelecall,
  syncTelecallsFromServer,
  onTelecallsChanged,
} from "../utils/telecallService";
import {
  TELECALL_STATUS_OPTIONS,
  getTelecallStatusConfig,
  formatTelecallActivityAction,
} from "../utils/telecallStatus";
import TelecallFormDialog from "../components/TelecallFormDialog";
import styles from "./LeadDetail.module.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* Notes Section — isolated to avoid full-page re-render per keystroke */
const NotesSection = ({ telecallId, notes, onNoteAdded }) => {
  const [noteText, setNoteText] = useState("");

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const updated = addTelecallNote(telecallId, noteText.trim());
    setNoteText("");
    if (onNoteAdded) onNoteAdded(updated);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        <Icon icon="mdi:note-text-outline" width={16} />
        Notes
      </h3>
      <textarea
        className={styles.noteTextarea}
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Add notes..."
        rows={3}
      />
      <button className={styles.addNoteBtn} onClick={handleAddNote} disabled={!noteText.trim()}>
        <Icon icon="mdi:plus" width={16} />
        Add Note
      </button>
      <div className={styles.notesList}>
        {!notes || notes.length === 0 ? (
          <p className={styles.emptyNotes}>No notes yet.</p>
        ) : (
          [...notes].reverse().map((note) => (
            <div key={note.id} className={styles.noteItem}>
              <p className={styles.noteText}>{note.text}</p>
              <span className={styles.noteTime}>{formatDate(note.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TeleCallDetail = () => {
  const { telecallId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadRecord = useCallback(() => {
    const data = getTelecallById(telecallId);
    if (!data) {
      setNotFound(true);
    } else {
      setRecord(data);
      setNotFound(false);
    }
  }, [telecallId]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  // Keep this record in sync with the shared server store (status/notes/edits
  // from another device show up here). Sync on mount, poll while visible,
  // re-sync on focus, and react to cross-tab changes — same as Lead Detail.
  useEffect(() => {
    let cancelled = false;
    const POLL_MS = 15000;
    let intervalId = null;

    const syncAndReload = () => {
      if (document.visibilityState !== "visible") return;
      syncTelecallsFromServer().then((result) => {
        if (cancelled || result.error) return;
        if (result.added > 0 || result.updated > 0 || result.removed > 0) loadRecord();
      });
    };

    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(syncAndReload, POLL_MS);
    };
    const stop = () => {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncAndReload();
        start();
      } else {
        stop();
      }
    };

    const unsubscribe = onTelecallsChanged(() => loadRecord());

    syncTelecallsFromServer().then((result) => {
      if (cancelled || result.error) return;
      if (result.added > 0 || result.updated > 0 || result.removed > 0) loadRecord();
    });

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribe();
    };
  }, [loadRecord]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStatusChange = (newStatus) => {
    updateTelecallStatus(telecallId, newStatus);
    loadRecord();
    showSnackbar(`Status updated to "${getTelecallStatusConfig(newStatus).label}"`);
  };

  const handleNoteAdded = (updated) => {
    setRecord(updated);
    showSnackbar("Note added");
  };

  const handleEditSave = (fields) => {
    updateTelecallFields(telecallId, fields);
    setEditOpen(false);
    loadRecord();
    showSnackbar("Details updated");
  };

  const handleDelete = () => {
    deleteTelecall(telecallId);
    showSnackbar("Lead deleted");
    navigate("/admin/tele-calling");
  };

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>
          <Icon icon="mdi:phone-remove-outline" width={64} />
        </div>
        <h2 className={styles.notFoundTitle}>Lead not found</h2>
        <p className={styles.notFoundText}>
          The tele-calling lead you're looking for doesn't exist or has been deleted.
        </p>
        <button className={styles.backBtn} onClick={() => navigate("/admin/tele-calling")}>
          <Icon icon="mdi:arrow-left" width={16} />
          Back to Tele-Calling
        </button>
      </div>
    );
  }

  if (!record) return null;

  const sc = getTelecallStatusConfig(record.status);

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate("/admin/tele-calling")}>
            <Icon icon="mdi:arrow-left" width={16} />
            Back to Tele-Calling
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.leadName}>{record.name || "Unknown Lead"}</h1>
            <p className={styles.leadId}>ID: {record.telecall_id}</p>
          </div>
        </div>
        <Select
          value={record.status || "hot"}
          size="small"
          onChange={(e) => handleStatusChange(e.target.value)}
          sx={{
            fontWeight: 600,
            bgcolor: sc.bg,
            color: sc.color,
            minWidth: 180,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: sc.color + "44" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: sc.color + "88" },
          }}
        >
          {TELECALL_STATUS_OPTIONS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }} />
            </MenuItem>
          ))}
        </Select>
      </div>

      {/* Two-Column Layout */}
      <div className={styles.columns}>
        {/* Left Column — Lead Information */}
        <div className={styles.leftColumn}>
          {/* Contact Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:account-circle-outline" width={16} />
              Contact Details
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Full Name</span>
                <span className={record.name ? styles.infoValue : styles.infoDash}>
                  {record.name || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Mobile</span>
                {record.mobile ? (
                  <a href={`tel:${record.mobile}`} className={styles.infoLink}>
                    {record.mobile}
                  </a>
                ) : (
                  <span className={styles.infoDash}>{"—"}</span>
                )}
              </div>
              <div className={styles.infoFieldFull}>
                <span className={styles.infoLabel}>Address</span>
                <span className={record.address ? styles.infoValue : styles.infoDash}>
                  {record.address || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>State</span>
                <span className={record.state ? styles.infoValue : styles.infoDash}>
                  {record.state || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Tele-Calling Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:headset" width={16} />
              Tele-Calling Details
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Lead Nurtured By</span>
                <span className={record.nurtured_by ? styles.infoValue : styles.infoDash}>
                  {record.nurtured_by || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Status</span>
                <span className={styles.sourceChip} style={{ background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Callback Scheduled</span>
                <span className={styles.infoValue}>
                  {record.callback_scheduled ? "Yes" : "No"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Callback Time</span>
                <span
                  className={
                    record.callback_scheduled && record.callback_at
                      ? styles.infoValue
                      : styles.infoDash
                  }
                >
                  {record.callback_scheduled && record.callback_at
                    ? formatDate(record.callback_at)
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:information-outline" width={16} />
              Record Details
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Source</span>
                <span className={styles.infoValue}>{record.source || "Tele-Calling"}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Created At</span>
                <span className={styles.infoValue}>{formatDate(record.created_at)}</span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Last Updated</span>
                <span className={styles.infoValue}>{formatDate(record.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Actions & Activity */}
        <div className={styles.rightColumn}>
          {/* Notes */}
          <NotesSection
            telecallId={record.telecall_id}
            notes={record.notes}
            onNoteAdded={handleNoteAdded}
          />

          {/* Activity Timeline */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:timeline-clock-outline" width={16} />
              Activity Timeline
            </h3>
            {!record.activity || record.activity.length === 0 ? (
              <p className={styles.emptyTimeline}>No activity recorded.</p>
            ) : (
              <div className={styles.timeline}>
                {[...(record.activity || [])].reverse().map((act, i) => {
                  const actSc = getTelecallStatusConfig(act.status);
                  return (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineDot} style={{ backgroundColor: actSc.color }} />
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineAction}>
                          {formatTelecallActivityAction(act.action)}
                        </p>
                        <p className={styles.timelineTime}>{formatDate(act.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons (desktop) */}
          <div className={`${styles.card} ${styles.desktopActions}`}>
            <div className={styles.actionButtons}>
              <button
                className={styles.convertBtn}
                style={{ background: "var(--admin-accent)" }}
                onClick={() => setEditOpen(true)}
              >
                <Icon icon="mdi:pencil" width={18} />
                Edit Details
              </button>
              <button className={styles.deleteBtn} onClick={() => setDeleteDialogOpen(true)}>
                <Icon icon="mdi:delete-outline" width={18} />
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className={styles.mobileFooter}>
        <button
          className={styles.convertBtn}
          style={{ background: "var(--admin-accent)" }}
          onClick={() => setEditOpen(true)}
        >
          <Icon icon="mdi:pencil" width={18} />
          Edit
        </button>
        <button className={styles.deleteBtn} onClick={() => setDeleteDialogOpen(true)}>
          <Icon icon="mdi:delete-outline" width={18} />
          Delete
        </button>
      </div>

      {/* Edit Dialog */}
      <TelecallFormDialog
        open={editOpen}
        mode="edit"
        initial={record}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this lead? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ textTransform: "none" }}>
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

export default TeleCallDetail;
