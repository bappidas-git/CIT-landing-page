/* ============================================
   Tele-Calling Form Dialog
   Shared add/edit form for tele-calling records.
   - mode="create": captures every field a telecaller
     records after a call (Notes mandatory here).
   - mode="edit": lets a telecaller fix a wrongly
     entered field (Notes are added separately via the
     detail page's Notes section, so omitted here).
   ============================================ */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Box,
} from "@mui/material";
import { Icon } from "@iconify/react";
import {
  TELECALL_STATUS_OPTIONS,
  NURTURED_BY_OPTIONS,
  TELECALL_STATE_OPTIONS,
} from "../utils/telecallStatus";

const EMPTY = {
  name: "",
  mobile: "",
  address: "",
  state: "",
  notes: "",
  status: "hot",
  nurtured_by: "",
  callback_scheduled: "no",
  callback_at: "",
};

const accentFocus = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--admin-accent)",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--admin-accent)" },
};

const TelecallFormDialog = ({ open, mode = "create", initial, onClose, onSave }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const isCreate = mode === "create";

  // Hydrate the form whenever the dialog opens (or the target record changes).
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name || "",
        mobile: initial.mobile || "",
        address: initial.address || "",
        state: initial.state || "",
        notes: "",
        status: initial.status || "hot",
        nurtured_by: initial.nurtured_by || "",
        callback_scheduled: initial.callback_scheduled ? "yes" : "no",
        callback_at: initial.callback_at || "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [open, initial]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^[+\d][\d\s-]{6,}$/.test(form.mobile.trim()))
      e.mobile = "Enter a valid mobile number";
    if (isCreate && !form.notes.trim()) e.notes = "Notes are required";
    if (!form.status) e.status = "Status is required";
    if (!form.nurtured_by) e.nurtured_by = "Please select who nurtured this lead";
    if (form.callback_scheduled === "yes" && !form.callback_at)
      e.callback_at = "Pick the callback date & time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      address: form.address.trim(),
      state: form.state,
      notes: form.notes,
      status: form.status,
      nurtured_by: form.nurtured_by,
      callback_scheduled: form.callback_scheduled === "yes",
      callback_at: form.callback_scheduled === "yes" ? form.callback_at : "",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
        <Icon
          icon={isCreate ? "mdi:phone-plus" : "mdi:pencil"}
          width={22}
          style={{ color: "var(--admin-accent)" }}
        />
        {isCreate ? "Add Tele-Calling Lead" : "Edit Lead Details"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name *"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            size="small"
            sx={accentFocus}
          />
          <TextField
            label="Mobile Number *"
            value={form.mobile}
            onChange={(e) => setField("mobile", e.target.value)}
            error={!!errors.mobile}
            helperText={errors.mobile}
            fullWidth
            size="small"
            inputMode="tel"
            sx={accentFocus}
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={1}
            sx={accentFocus}
          />
          <TextField
            label="State"
            value={form.state}
            onChange={(e) => setField("state", e.target.value)}
            select
            fullWidth
            size="small"
            sx={accentFocus}
          >
            <MenuItem value="">
              <em>Not specified</em>
            </MenuItem>
            {TELECALL_STATE_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Status *"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
            select
            fullWidth
            size="small"
            error={!!errors.status}
            helperText={errors.status}
            sx={accentFocus}
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
          </TextField>
          <TextField
            label="Lead Nurtured By *"
            value={form.nurtured_by}
            onChange={(e) => setField("nurtured_by", e.target.value)}
            select
            fullWidth
            size="small"
            error={!!errors.nurtured_by}
            helperText={errors.nurtured_by}
            sx={accentFocus}
          >
            {NURTURED_BY_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>

          {isCreate && (
            <TextField
              label="Notes *"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              error={!!errors.notes}
              helperText={errors.notes || "Summarise what was discussed on the call"}
              fullWidth
              size="small"
              multiline
              minRows={3}
              sx={accentFocus}
            />
          )}

          <FormControl>
            <FormLabel
              sx={{ fontSize: "0.8125rem", "&.Mui-focused": { color: "var(--admin-accent)" } }}
            >
              Next Call Back Scheduled?
            </FormLabel>
            <RadioGroup
              row
              value={form.callback_scheduled}
              onChange={(e) => setField("callback_scheduled", e.target.value)}
            >
              <FormControlLabel
                value="no"
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: "var(--admin-accent)" } }} />}
                label="No"
              />
              <FormControlLabel
                value="yes"
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: "var(--admin-accent)" } }} />}
                label="Yes"
              />
            </RadioGroup>
          </FormControl>

          {form.callback_scheduled === "yes" && (
            <TextField
              label="Callback Date & Time"
              type="datetime-local"
              value={form.callback_at}
              onChange={(e) => setField("callback_at", e.target.value)}
              error={!!errors.callback_at}
              helperText={errors.callback_at}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={accentFocus}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "var(--admin-text-secondary)" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Icon icon={isCreate ? "mdi:check" : "mdi:content-save"} width={18} />}
          sx={{
            textTransform: "none",
            bgcolor: "var(--admin-accent)",
            "&:hover": { bgcolor: "var(--admin-accent-light)" },
          }}
        >
          {isCreate ? "Add Lead" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TelecallFormDialog;
