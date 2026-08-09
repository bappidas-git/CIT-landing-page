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
  updateLeadConversion,
  deleteLead,
  syncLeadsFromServer,
  onLeadsChanged,
} from "../utils/leadService";
import {
  STATUS_OPTIONS,
  getStatusConfig,
  formatActivityAction,
} from "../utils/leadStatus";
import {
  ADMISSION_TIMELINE_LABELS,
  AFFORDABILITY_LONG_LABELS,
  BEST_TIME_LABELS,
  BOARD_LABELS,
  COUNSELLING_MODE_LABELS,
  EXPECTED_BAND_LABELS,
  FILLED_BY_LABELS,
  FUNDING_PLAN_LABELS,
  INTAKE_YEAR_LABELS,
  PARTIAL_BANNER,
  TEST_SUBJECT_MAX_SCORE,
  TWELFTH_STATUS_LABELS,
  computeQualityScore,
  describeSlotTiming,
  formatScore,
  formatSlot,
  getEligibilitySummary,
  getLeadTier,
  getQualityConfig,
  getTestStatus,
  getTestStatusConfig,
  getTierConfig,
  hasAcademicDetails,
  hasFamilyFunding,
  hasLogistics,
  hasQualitySignal,
  hasSelectionData,
  labelFor,
} from "../utils/leadQuality";
import { sendConversionEvent } from "../../utils/metaCAPI";
import { generateEventId } from "../../utils/eventDedup";
import styles from "./LeadDetail.module.css";

const CONVERSION_TYPES = [
  "Application Submitted",
  "Counselling Done",
  "Admission Confirmed",
  "Hostel Booked",
  "Referral",
  "Other",
];

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
   Info Field — label + value pair
   Renders nothing when the lead never answered
   the question, so a legacy enquiry lead never
   shows a card full of dashes for fields the
   application form introduced.
   ============================================ */
const InfoField = ({ label, value, full = false, children }) => {
  const isEmpty =
    !children && (value === undefined || value === null || value === "");
  if (isEmpty) return null;
  return (
    <div className={full ? styles.infoFieldFull : styles.infoField}>
      <span className={styles.infoLabel}>{label}</span>
      {children || <span className={styles.infoValue}>{value}</span>}
    </div>
  );
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

  // Keep this lead in sync with the shared server store so status/note changes
  // made on another browser or device show up here without a manual reload.
  // We sync on mount, poll while the tab is visible, re-sync when the tab
  // regains focus, and react to cross-tab localStorage writes. The merge in
  // syncLeadsFromServer is last-write-wins, so an open detail view converges
  // to whatever the most recent edit was, wherever it was made.
  useEffect(() => {
    let cancelled = false;
    const POLL_MS = 15000;
    let intervalId = null;

    const syncAndReload = () => {
      if (document.visibilityState !== "visible") return;
      syncLeadsFromServer().then((result) => {
        if (cancelled || result.error) return;
        if (result.added > 0 || result.updated > 0 || result.removed > 0)
          loadLead();
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

    // Reload instantly when this lead is mutated in another tab/window of the
    // same browser (BroadcastChannel / storage / same-tab event).
    const unsubscribe = onLeadsChanged(() => loadLead());

    // Initial sync on mount (independent of visibility-change events).
    syncLeadsFromServer().then((result) => {
      if (cancelled || result.error) return;
      if (result.added > 0 || result.updated > 0 || result.removed > 0)
        loadLead();
    });

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribe();
    };
  }, [loadLead]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleStatusChange = (newStatus) => {
    updateLeadStatus(leadId, newStatus);
    loadLead();
    showSnackbar(`Status updated to "${getStatusConfig(newStatus).label}"`);
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

      // Store conversion details on the lead (for Google Ads export) and
      // mirror them to the shared server store so other devices see them too.
      updateLeadConversion(lead.lead_id, {
        conversion_value: parseFloat(conversionValue),
        conversion_type: conversionType,
        converted_at: new Date().toISOString(),
      });

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
        <h2 className={styles.notFoundTitle}>Lead not found</h2>
        <p className={styles.notFoundText}>
          The admission lead you're looking for doesn't exist or has been deleted.
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

  // Tier + quality are derived on read (leadQuality.js) — never stored.
  const tier = getLeadTier(lead);
  const tc = getTierConfig(tier);
  const isPartial = tier === "partial";
  const quality = computeQualityScore(lead);
  const qc = getQualityConfig(quality.band);
  const scored = hasQualitySignal(lead);

  const subjects = Array.isArray(lead.twelfth_subjects)
    ? lead.twelfth_subjects
    : [];
  const eligibility = getEligibilitySummary(lead);
  const eligibilityToneClass = {
    met: styles.eligibilityMet,
    relaxation: styles.eligibilityRelaxation,
    review: styles.eligibilityReview,
  }[eligibility?.tone];
  const hasTenth = !!(lead.tenth_school || lead.tenth_year || lead.tenth_percent);

  /* ---- Merit test & selection ----
     Every value below is written server-side (test.php via patch_lead, or
     leads.php when it issues the key) and none of them are in the public
     create whitelist, so unlike the quality score these numbers can be read
     as fact. */
  const testStatus = getTestStatus(lead);
  const testConfig = getTestStatusConfig(testStatus);
  const testCompleted = testStatus === "completed";
  const slotTiming = describeSlotTiming(lead.counselling_slot);
  const branchPrefs = [lead.branch_pref_1, lead.branch_pref_2].filter(Boolean);

  // A stored 0 is a real answer (a blank paper scores zero), so presence is
  // tested rather than truthiness.
  const numberText = (value) =>
    value === undefined || value === null || value === "" || !Number.isFinite(Number(value))
      ? null
      : String(value);

  const subjectScoreLine = [
    numberText(lead.test_maths_score) &&
      `Maths ${lead.test_maths_score}/${TEST_SUBJECT_MAX_SCORE}`,
    numberText(lead.test_physics_score) &&
      `Physics ${lead.test_physics_score}/${TEST_SUBJECT_MAX_SCORE}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const answerCountLine = [
    numberText(lead.test_correct_count) && `Correct ${lead.test_correct_count}`,
    numberText(lead.test_wrong_count) && `Wrong ${lead.test_wrong_count}`,
    numberText(lead.test_blank_count) && `Blank ${lead.test_blank_count}`,
  ]
    .filter(Boolean)
    .join(" · ");

  // fbclid/fbp/fbc only exist on leads captured after Meta attribution
  // landed, so they join the UTM grid only when the lead actually carries them.
  const utmItems = [
    { label: "UTM Source", value: lead.utm_source },
    { label: "UTM Medium", value: lead.utm_medium },
    { label: "UTM Campaign", value: lead.utm_campaign },
    { label: "UTM Term", value: lead.utm_term },
    { label: "UTM Content", value: lead.utm_content },
    // Meta identifiers are long opaque strings — truncated with the full
    // value on hover so they cannot blow the grid out.
    ...(lead.fbclid
      ? [{ label: "FBCLID", value: lead.fbclid, truncate: true }]
      : []),
    ...(lead.fbp ? [{ label: "FBP", value: lead.fbp, truncate: true }] : []),
    ...(lead.fbc ? [{ label: "FBC", value: lead.fbc, truncate: true }] : []),
  ];

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
            <h1 className={styles.leadName}>{lead.name || "Unknown Lead"}</h1>
            <p className={styles.leadId}>ID: {lead.lead_id}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* Chips sit on the page background rather than a white card, so
              they carry a tinted border to stay legible. */}
          <Chip
            label={tc.label}
            size="small"
            sx={{
              bgcolor: tc.bg,
              color: tc.color,
              fontWeight: 600,
              border: `1px solid ${tc.color}55`,
            }}
          />
          {scored && (
            <Chip
              label={`${qc.label} · ${quality.score}`}
              size="small"
              title={`Quality score ${quality.score}/100${
                quality.capped
                  ? " — capped at Warm until the application is completed"
                  : ""
              }`}
              sx={{
                bgcolor: qc.bg,
                color: qc.color,
                fontWeight: 600,
                border: `1px solid ${qc.color}55`,
              }}
            />
          )}
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
      </div>

      {/* Partial application — recoverable by phone */}
      {isPartial && (
        <div className={styles.partialBanner} role="status">
          <Icon icon="mdi:progress-alert" width={20} />
          <span>{PARTIAL_BANNER}</span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className={styles.columns}>
        {/* Left Column — Lead Information */}
        <div className={styles.leftColumn}>
          {/* Contact Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:account-circle-outline" width={16} />
              Applicant Details
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

          {/* Admission Interest */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Icon icon="mdi:school-outline" width={16} />
              Admission Interest
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Course Interested</span>
                <span className={lead.service_interest ? styles.infoValue : styles.infoDash}>
                  {lead.service_interest || "\u2014"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>State</span>
                <span className={lead.state ? styles.infoValue : styles.infoDash}>
                  {lead.state || "\u2014"}
                </span>
              </div>
              {/* The applicant's own words \u2014 worth reading before the call. */}
              <InfoField label="Message" value={lead.message} full />
            </div>
          </div>

          {/* Merit Test & Selection — merit-program leads only. A lead that
              never reached this stage (legacy enquiry, CSV import) carries none
              of these fields and the whole card stays out of the page. */}
          {hasSelectionData(lead) && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Icon icon="mdi:clipboard-check-outline" width={16} />
                Merit Test &amp; Selection
              </h3>

              {/* The counselling hour the applicant chose, first and loudest —
                  it is the only thing on this card with a deadline attached. */}
              {lead.counselling_slot ? (
                <div
                  className={`${styles.slotBox} ${
                    slotTiming === "overdue" ? styles.slotBoxOverdue : ""
                  }`}
                >
                  <Icon icon="mdi:phone-clock" width={18} />
                  <div>
                    <span className={styles.slotLabel}>Tele-Counselling Slot</span>
                    <span className={styles.slotValue}>
                      {formatSlot(lead.counselling_slot)}
                      {slotTiming && (
                        <span className={styles.slotTiming}> — {slotTiming}</span>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                testCompleted && (
                  <div className={`${styles.slotBox} ${styles.slotBoxEmpty}`}>
                    <Icon icon="mdi:phone-alert-outline" width={18} />
                    <div>
                      <span className={styles.slotLabel}>Tele-Counselling Slot</span>
                      <span className={styles.slotValue}>
                        No slot chosen — fix a time on the call
                      </span>
                    </div>
                  </div>
                )
              )}

              <div className={styles.infoGrid}>
                {lead.login_key && (
                  <InfoField label="Login Key">
                    <span className={styles.keyValue}>
                      {lead.login_key}
                      <button
                        className={styles.copyBtn}
                        onClick={() => handleCopy(lead.login_key, "login_key")}
                      >
                        <Icon
                          icon={
                            copiedField === "login_key"
                              ? "mdi:check"
                              : "mdi:content-copy"
                          }
                          width={12}
                        />
                        {copiedField === "login_key" ? "Copied" : "Copy"}
                      </button>
                    </span>
                  </InfoField>
                )}
                {testStatus && (
                  <InfoField label="Test Status">
                    <span
                      className={styles.flagChip}
                      style={{ background: testConfig.bg, color: testConfig.color }}
                    >
                      {testConfig.label}
                    </span>
                  </InfoField>
                )}
                {testCompleted && (
                  <InfoField label="Score" full>
                    <span className={styles.scoreValue}>{formatScore(lead)}</span>
                    {subjectScoreLine && (
                      <span className={styles.scoreBreakdown}>
                        {subjectScoreLine}
                      </span>
                    )}
                    {answerCountLine && (
                      <span className={styles.scoreBreakdown}>
                        {answerCountLine}
                      </span>
                    )}
                  </InfoField>
                )}
                {/* Only ever present when the operator has set a cutoff in
                    config.php; absent means "not decided", not "rejected". */}
                {typeof lead.test_qualified === "boolean" && (
                  <InfoField label="Cutoff Verdict">
                    <span
                      className={`${styles.flagChip} ${
                        lead.test_qualified ? styles.flagChipOn : styles.flagChipOff
                      }`}
                    >
                      <Icon
                        icon={
                          lead.test_qualified
                            ? "mdi:check-circle-outline"
                            : "mdi:minus-circle-outline"
                        }
                        width={14}
                      />
                      {lead.test_qualified ? "Qualified" : "Below cutoff"}
                    </span>
                  </InfoField>
                )}
                <InfoField
                  label="Test Started"
                  value={lead.test_started_at ? formatDate(lead.test_started_at) : ""}
                />
                <InfoField
                  label="Test Completed"
                  value={
                    lead.test_completed_at ? formatDate(lead.test_completed_at) : ""
                  }
                />
                <InfoField
                  label="Can Afford the Fees"
                  value={labelFor(AFFORDABILITY_LONG_LABELS, lead.fee_affordability)}
                  full
                />
                {branchPrefs.length > 0 && (
                  <InfoField label="Branch Preferences" full>
                    <ol className={styles.prefList}>
                      {branchPrefs.map((course, i) => (
                        <li key={`${course}-${i}`}>{course}</li>
                      ))}
                    </ol>
                  </InfoField>
                )}
              </div>
            </div>
          )}

          {/* Academic Details — application form only */}
          {hasAcademicDetails(lead) && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Icon icon="mdi:book-education-outline" width={16} />
                Academic Details
              </h3>
              <div className={styles.infoGrid}>
                <InfoField
                  label="12th Status"
                  value={labelFor(TWELFTH_STATUS_LABELS, lead.twelfth_status)}
                />
                <InfoField
                  label="12th Board"
                  value={labelFor(BOARD_LABELS, lead.twelfth_board)}
                />
                <InfoField
                  label="12th School"
                  value={lead.twelfth_school}
                  full
                />
                <InfoField
                  label="Expected Result"
                  value={labelFor(EXPECTED_BAND_LABELS, lead.expected_band)}
                />
              </div>

              {subjects.length > 0 && (
                <div className={styles.subjectsBlock}>
                  <span className={styles.infoLabel}>12th Subject Marks</span>
                  <table className={styles.subjectsTable}>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((row, i) => (
                        <tr key={`${row.subject}-${i}`}>
                          <td>{row.subject}</td>
                          <td>{row.marks} / 100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {eligibility && (
                <div className={`${styles.eligibilityNote} ${eligibilityToneClass}`}>
                  <Icon
                    icon={
                      eligibility.met
                        ? "mdi:check-circle-outline"
                        : "mdi:alert-outline"
                    }
                    width={16}
                  />
                  <span>
                    Eligibility aggregate{" "}
                    <strong>{eligibility.percent.toFixed(1)}%</strong> —{" "}
                    {eligibility.message}
                  </span>
                </div>
              )}

              {hasTenth && (
                <>
                  <p className={styles.subGroupTitle}>Class 10</p>
                  <div className={styles.infoGrid}>
                    <InfoField label="10th School" value={lead.tenth_school} full />
                    <InfoField label="Year of Passing" value={lead.tenth_year} />
                    <InfoField
                      label="Percentage"
                      value={
                        lead.tenth_percent || lead.tenth_percent === 0
                          ? `${lead.tenth_percent}%`
                          : ""
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Family & Funding — application form only */}
          {hasFamilyFunding(lead) && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Icon icon="mdi:account-group-outline" width={16} />
                Family & Funding
              </h3>
              <div className={styles.infoGrid}>
                <InfoField
                  label="Form Filled By"
                  value={labelFor(FILLED_BY_LABELS, lead.filled_by)}
                />
                <InfoField label="Parent / Guardian" value={lead.parent_name} />
                {lead.parent_mobile && (
                  <InfoField label="Parent's Mobile">
                    <a
                      href={`tel:${lead.parent_mobile}`}
                      className={styles.infoLink}
                    >
                      {lead.parent_mobile}
                    </a>
                  </InfoField>
                )}
                <InfoField
                  label="Funding Plan"
                  value={labelFor(FUNDING_PLAN_LABELS, lead.funding_plan)}
                  full
                />
                {typeof lead.whatsapp_confirmed === "boolean" && (
                  <InfoField label="WhatsApp" full>
                    <span
                      className={`${styles.flagChip} ${
                        lead.whatsapp_confirmed
                          ? styles.flagChipOn
                          : styles.flagChipOff
                      }`}
                    >
                      <Icon
                        icon={
                          lead.whatsapp_confirmed
                            ? "mdi:whatsapp"
                            : "mdi:close-circle-outline"
                        }
                        width={14}
                      />
                      {lead.whatsapp_confirmed
                        ? "Student's number is on WhatsApp"
                        : "Not confirmed on WhatsApp"}
                    </span>
                  </InfoField>
                )}
              </div>
            </div>
          )}

          {/* Logistics — application form only */}
          {hasLogistics(lead) && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <Icon icon="mdi:map-marker-radius-outline" width={16} />
                Logistics
              </h3>
              <div className={styles.infoGrid}>
                <InfoField label="State" value={lead.state} />
                <InfoField label="District" value={lead.district} />
                <InfoField
                  label="Counselling Mode"
                  value={labelFor(COUNSELLING_MODE_LABELS, lead.counselling_mode)}
                />
                <InfoField
                  label="Admission Timeline"
                  value={labelFor(
                    ADMISSION_TIMELINE_LABELS,
                    lead.admission_timeline
                  )}
                />
                <InfoField
                  label="Best Time to Call"
                  value={labelFor(BEST_TIME_LABELS, lead.best_time)}
                />
                <InfoField
                  label="Intake Year"
                  value={labelFor(INTAKE_YEAR_LABELS, lead.intake_year)}
                />
              </div>
            </div>
          )}

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
              {utmItems.map((item) => (
                <div key={item.label} className={styles.utmItem}>
                  <span className={styles.infoLabel}>{item.label}</span>
                  <span
                    className={item.value ? styles.infoValue : styles.infoDash}
                    title={item.value || undefined}
                  >
                    {item.value
                      ? item.truncate && item.value.length > 24
                        ? item.value.slice(0, 24) + "..."
                        : item.value
                      : "\u2014"}
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
                        <p className={styles.timelineAction}>{formatActivityAction(act.action)}</p>
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
            Are you sure you want to delete this lead? This action cannot be undone.
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
            <strong>{lead.name || "this lead"}</strong>. This will send a conversion
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
