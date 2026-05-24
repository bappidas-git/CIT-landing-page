/* ============================================
   Lead Detail Page
   Dedicated full-page lead detail view
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
  getLeadById,
  updateLeadStatus,
  addLeadNote,
  deleteLead,
} from "../utils/leadService";
import { sendConversionEvent } from "../../utils/metaCAPI";
import { generateEventId } from "../../utils/eventDedup";
import styles from "./LeadDetail.module.css";

// Status config
const STATUS_OPTIONS = [
  { value: "new", label: "New", color: "#2B7BD5", bg: "#EBF5FF" },
  { value: "contacted", label: "Contacted", color: "#F59E0B", bg: "#FFF7ED" },
  { value: "consultation_booked", label: "Consultation Booked", color: "#8B5CF6", bg: "#F3E8FF" },
  { value: "procedure_scheduled", label: "Procedure Scheduled", color: "#0097A7", bg: "#E0F7FA" },
  { value: "completed", label: "Completed", color: "#10B981", bg: "#ECFDF5" },
  { value: "not_interested", label: "Not Interested", color: "#EF4444", bg: "#FEF2F2" },
];

const CONVERSION_TYPES = [
  "Consultation Completed",
  "Procedure Booked",
  "Procedure Completed",
  "Follow-up Visit",
  "Referral",
  "Other",
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

const formatDate = (dateStr) => {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ============================================
   Notes Section — Isolated component
   Manages its own noteText state to prevent
   full-page re-renders on each keystroke
   ============================================ */
const NotesSection = ({ leadId, notes, onNoteAdded }) => {
  const [noteText, setNoteText] = useState("");

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const updated = addLeadNote(leadId, noteText.trim());
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
      <button
        className={styles.addNoteBtn}
        onClick={handleAddNote}
        disabled={!noteText.trim()}
      >
        <Icon icon="mdi:plus" width={16} />
        Add Note
      </button>
      <div className={styles.notesList}>
        {(!notes || notes.length === 0) ? (
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

/* ============================================
   Lead Detail Page
   ============================================ */
const LeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [conversionValue, setConversionValue] = useState("");
  const [conversionType, setConversionType] = useState("");
  const [conversionSending, setConversionSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [copiedField, setCopiedField] = useState(null);

  const loadLead = useCallback(() => {
    const data = getLeadById(leadId);
    if (!data) {
      setNotFound(true);
    } else {
      setLead(data);
      setNotFound(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStatusChange = (newStatus) => {
    updateLeadStatus(leadId, newStatus);
    loadLead();
    showSnackbar(`Status updated to "${newStatus}"`);
  };

  const handleNoteAdded = (updatedLead) => {
    setLead(updatedLead);
    showSnackbar("Note added");
  };

  const handleDelete = () => {
    deleteLead(leadId);
    showSnackbar("Lead deleted");
    navigate("/admin/lms");
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSendConversion = async () => {
    if (!lead || !conversionValue || !conversionType) return;
    setConversionSending(true);

    try {
      const eventId = generateEventId();
      const result = await sendConversionEvent(
        {
          name: lead.name,
          email: lead.email,
          mobile: lead.mobile,
        },
        {
          value: parseFloat(conversionValue),
          currency: "INR",
          conversion_type: conversionType,
          event_id: eventId,
        }
      );

      // Update lead status to completed
      updateLeadStatus(lead.lead_id, "completed");

      // Store conversion value on the lead for Google Ads export
      const allLeads = JSON.parse(localStorage.getItem("lp_submitted_leads") || "[]");
      const targetLead = allLeads.find((l) => l.lead_id === lead.lead_id);
      if (targetLead) {
        targetLead.conversion_value = parseFloat(conversionValue);
        targetLead.conversion_type = conversionType;
        targetLead.converted_at = new Date().toISOString();
        localStorage.setItem("lp_submitted_leads", JSON.stringify(allLeads));
      }

      // Add activity notes about conversion
      addLeadNote(
        lead.lead_id,
        `Conversion sent to Meta CAPI: ${conversionType} - \u20B9${parseFloat(conversionValue).toLocaleString("en-IN")} (Event ID: ${eventId})`
      );

      if (lead.gclid) {
        addLeadNote(
          lead.lead_id,
          `Google Ads offline conversion ready for export (GCLID: ${lead.gclid.slice(0, 12)}...)`
        );
      }

      loadLead();
      setConversionModalOpen(false);
      showSnackbar(
        result.success
          ? "Conversion event sent to Meta successfully"
          : "Conversion recorded locally (CAPI endpoint not available)",
        result.success ? "success" : "warning"
      );
    } catch (error) {
      console.error("Conversion error:", error);
      showSnackbar("Failed to send conversion event", "error");
    } finally {
      setConversionSending(false);
    }
  };

  // Not found state
  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>
          <Icon icon="mdi:account-search-outline" width={64} />
        </div>
        <h2 className={styles.notFoundTitle}>Patient record not found</h2>
        <p className={styles.notFoundText}>
          The patient record you're looking for doesn't exist or has been deleted.
        </p>
        <button className={styles.backBtn} onClick={() => navigate("/admin/lms")}>
          <Icon icon="mdi:arrow-left" width={16} />
          Back to Leads
        </button>
      </div>
    );
  }

  // Loading state
  if (!lead) return null;

  const sc = getStatusConfig(lead.status);

  const googleAdsStatus = lead.gclid
    ? lead.status === "completed"
      ? { label: "Ready for export", style: "trackingChipGreen" }
      : { label: "GCLID captured", style: "trackingChipBlue" }
    : { label: "No GCLID", style: "trackingChipMuted" };

  const metaStatus = (lead.notes || []).some((n) => n.text?.includes("Meta CAPI"))
    ? { label: "Conversion sent", style: "trackingChipGreen" }
    : { label: "Pending", style: "trackingChipOrange" };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate("/admin/lms")}>
            <Icon icon="mdi:arrow-left" width={16} />
            Back to Leads
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.leadName}>{lead.name || "Unknown Patient"}</h1>
            <p className={styles.leadId}>ID: {lead.lead_id}</p>
          </div>
        </div>
        <Select
          value={lead.status || "new"}
          size="small"
          onChange={(e) => handleStatusChange(e.target.value)}
          sx={{
            fontWeight: 600,
            bgcolor: sc.bg,
            color: sc.color,
            minWidth: 140,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: sc.color + "44" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: sc.color + "88" },
          }}
        >
          {STATUS_OPTIONS.map((s) => (
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
              Patient Details
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Full Name</span>
                <span className={lead.name ? styles.infoValue : styles.infoDash}>
                  {lead.name || "\u2014"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Mobile</span>
                {lead.mobile ? (
                  <a href={`tel:${lead.mobile}`} className={styles.infoLink}>
                    {lead.mobile}
                  </a>
                ) : (
                  <span className={styles.infoDash}>{"\u2014"}</span>
                )}
              </div>
              <div className={styles.infoFieldFull}>
                <span className={styles.infoLabel}>Email</span>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className={styles.infoLink}>
                    {lead.email}
                  </a>
                ) : (
                  <span className={styles.infoDash}>{"\u2014"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Interest Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:medical-bag" width={16} />
              Service Interest
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Service Interest</span>
                <span className={lead.service_interest ? styles.infoValue : styles.infoDash}>
                  {lead.service_interest || "\u2014"}
                </span>
              </div>
            </div>
          </div>

          {/* Source & UTM Data */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:web" width={16} />
              Source & UTM Data
            </h3>
            <div style={{ marginBottom: 10 }}>
              <span className={styles.infoLabel}>Source</span>
              <div style={{ marginTop: 4 }}>
                {lead.source ? (
                  <span className={styles.sourceChip}>{lead.source}</span>
                ) : (
                  <span className={styles.infoDash}>{"\u2014"}</span>
                )}
              </div>
            </div>
            <div className={styles.utmGrid}>
              {[
                { label: "UTM Source", value: lead.utm_source },
                { label: "UTM Medium", value: lead.utm_medium },
                { label: "UTM Campaign", value: lead.utm_campaign },
                { label: "UTM Term", value: lead.utm_term },
                { label: "UTM Content", value: lead.utm_content },
              ].map((item) => (
                <div key={item.label} className={styles.utmItem}>
                  <span className={styles.infoLabel}>{item.label}</span>
                  <span className={item.value ? styles.infoValue : styles.infoDash}>
                    {item.value || "\u2014"}
                  </span>
                </div>
              ))}
              <div className={styles.utmItemFull}>
                <span className={styles.infoLabel}>GCLID</span>
                <span className={lead.gclid ? styles.infoValue : styles.infoDash}>
                  {lead.gclid ? (
                    <>
                      {lead.gclid.length > 24 ? lead.gclid.slice(0, 24) + "..." : lead.gclid}
                      <button
                        className={styles.copyBtn}
                        onClick={() => handleCopy(lead.gclid, "gclid")}
                      >
                        <Icon icon={copiedField === "gclid" ? "mdi:check" : "mdi:content-copy"} width={12} />
                        {copiedField === "gclid" ? "Copied" : "Copy"}
                      </button>
                    </>
                  ) : (
                    "\u2014"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:information-outline" width={16} />
              Submission Details
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Submitted At</span>
                <span className={styles.infoValue}>{formatDate(lead.submitted_at)}</span>
              </div>
              <div className={styles.infoFieldFull}>
                <span className={styles.infoLabel}>Page URL</span>
                <span
                  className={lead.page_url ? styles.infoValue : styles.infoDash}
                  title={lead.page_url}
                >
                  {lead.page_url
                    ? lead.page_url.length > 60
                      ? lead.page_url.slice(0, 60) + "..."
                      : lead.page_url
                    : "\u2014"}
                </span>
              </div>
              <div className={styles.infoFieldFull}>
                <span className={styles.infoLabel}>User Agent</span>
                <span
                  className={lead.user_agent ? styles.infoValue : styles.infoDash}
                  title={lead.user_agent}
                  style={{ fontSize: "0.8rem" }}
                >
                  {lead.user_agent
                    ? lead.user_agent.length > 80
                      ? lead.user_agent.slice(0, 80) + "..."
                      : lead.user_agent
                    : "\u2014"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Actions & Activity */}
        <div className={styles.rightColumn}>
          {/* Notes Section (isolated component) */}
          <NotesSection
            leadId={lead.lead_id}
            notes={lead.notes}
            onNoteAdded={handleNoteAdded}
          />

          {/* Activity Timeline */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:timeline-clock-outline" width={16} />
              Activity Timeline
            </h3>
            {(!lead.activity || lead.activity.length === 0) ? (
              <p className={styles.emptyTimeline}>No activity recorded.</p>
            ) : (
              <div className={styles.timeline}>
                {[...(lead.activity || [])].reverse().map((act, i) => {
                  const actSc = getStatusConfig(act.status);
                  return (
                    <div key={i} className={styles.timelineItem}>
                      <div
                        className={styles.timelineDot}
                        style={{ backgroundColor: actSc.color }}
                      />
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineAction}>{act.action}</p>
                        <p className={styles.timelineTime}>{formatDate(act.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conversion Tracking */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:chart-timeline-variant-shimmer" width={16} />
              Conversion Tracking
            </h3>
            <div className={styles.trackingGrid}>
              <div className={styles.trackingRow}>
                <span className={styles.trackingLabel}>Google Ads</span>
                <span className={`${styles.trackingChip} ${styles[googleAdsStatus.style]}`}>
                  {googleAdsStatus.label}
                </span>
              </div>
              <div className={styles.trackingRow}>
                <span className={styles.trackingLabel}>Meta CAPI</span>
                <span className={`${styles.trackingChip} ${styles[metaStatus.style]}`}>
                  {metaStatus.label}
                </span>
              </div>
              {lead.conversion_value && (
                <div className={styles.trackingRow}>
                  <span className={styles.trackingLabel}>Conversion Value</span>
                  <span className={styles.trackingValue}>
                    {"\u20B9"}{parseFloat(lead.conversion_value).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {lead.conversion_type && (
                <div className={styles.trackingRow}>
                  <span className={styles.trackingLabel}>Conversion Type</span>
                  <span className={styles.trackingValue}>{lead.conversion_type}</span>
                </div>
              )}
              {lead.converted_at && (
                <div className={styles.trackingRow}>
                  <span className={styles.trackingLabel}>Converted At</span>
                  <span className={styles.trackingValue}>{formatDate(lead.converted_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (desktop) */}
          <div className={`${styles.card} ${styles.desktopActions}`}>
            <div className={styles.actionButtons}>
              <button
                className={styles.convertBtn}
                onClick={() => {
                  setConversionValue("");
                  setConversionType("");
                  setConversionModalOpen(true);
                }}
              >
                <Icon icon="mdi:send-check" width={18} />
                Mark as Converted
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => setDeleteDialogOpen(true)}
              >
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
          onClick={() => {
            setConversionValue("");
            setConversionType("");
            setConversionModalOpen(true);
          }}
        >
          <Icon icon="mdi:send-check" width={18} />
          Convert
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Icon icon="mdi:delete-outline" width={18} />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this patient record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conversion Modal */}
      <Dialog
        open={conversionModalOpen}
        onClose={() => setConversionModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon="mdi:send-check" width={22} style={{ color: "#4CAF50" }} />
          Record Conversion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Record a conversion for{" "}
            <strong>{lead.name || "this patient"}</strong>. This will send a conversion
            event to Meta CAPI and{lead.gclid
              ? " mark it for Google Ads offline conversion export"
              : " record it locally"}.
          </DialogContentText>
          <TextField
            fullWidth
            label="Conversion Value"
            type="number"
            value={conversionValue}
            onChange={(e) => setConversionValue(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">{"\u20B9"}</InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Conversion Type</InputLabel>
            <Select
              value={conversionType}
              label="Conversion Type"
              onChange={(e) => setConversionType(e.target.value)}
            >
              {CONVERSION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConversionModalOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendConversion}
            variant="contained"
            disabled={!conversionValue || !conversionType || conversionSending}
            startIcon={
              conversionSending ? (
                <Icon icon="mdi:loading" width={18} className="spin" />
              ) : (
                <Icon icon="mdi:send" width={18} />
              )
            }
            sx={{
              textTransform: "none",
              bgcolor: "#4CAF50",
              "&:hover": { bgcolor: "#388E3C" },
            }}
          >
            {conversionSending ? "Sending..." : "Send Conversion"}
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

export default LeadDetail;
