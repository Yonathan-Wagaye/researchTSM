"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

type AddPhraseDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { key: string; sourceText: string; context: string; usage: string }) => Promise<void>;
};

const AddPhraseDialog = ({ open, onClose, onAdd }: AddPhraseDialogProps) => {
  const [key, setKey] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [context, setContext] = useState("");
  const [usage, setUsage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setKey("");
    setSourceText("");
    setContext("");
    setUsage("");
    setError(null);
    onClose();
  };

  const handleAdd = async () => {
    if (!key.trim()) {
      setError("Phrase key is required.");
      return;
    }
    if (!sourceText.trim()) {
      setError("Source text is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onAdd({ key: key.trim(), sourceText: sourceText.trim(), context: context.trim(), usage: usage.trim() });
      handleClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add phrase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add phrase</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
          <TextField
            label="Key"
            placeholder="e.g. GREETING"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            fullWidth
            required
            helperText="Unique identifier for this phrase — uppercase, no spaces."
          />
          <TextField
            label="Source text"
            placeholder="e.g. Hello"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            fullWidth
            required
            multiline
            minRows={2}
            helperText="The original text in the project's source language."
          />
          <TextField
            label="Context"
            placeholder="e.g. Button label on the login screen"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            helperText="Optional — helps translators understand where this phrase appears."
          />
          <TextField
            label="Usage notes"
            placeholder="e.g. Keep it short — max 20 characters"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            helperText="Optional — any constraints or notes for translators."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleAdd} disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add phrase"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPhraseDialog;
