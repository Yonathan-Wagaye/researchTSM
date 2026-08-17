"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PhraseUploadSummary } from "@/types/phraseTypes";

type PhraseUploadSummaryDialogProps = {
  open: boolean;
  summary: PhraseUploadSummary | null;
  languageNames: Record<string, string>;
  isConfirming: boolean;
  confirmError: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const formatLanguageLabel = (
  code: string,
  languageNames: Record<string, string>,
) => {
  const name = languageNames[code.toUpperCase()];
  return name ? `${code.toUpperCase()} (${name})` : code.toUpperCase();
};

const formatCacheExpiry = (seconds: number) => {
  const hours = Math.round(seconds / 3600);
  return hours === 1 ? "1 hour" : `${hours} hours`;
};

const estimateImportableCount = (summary: PhraseUploadSummary) =>
  Math.max(
    0,
    summary.phrase_count -
      summary.empty_key_count -
      summary.duplicate_keys.length -
      summary.existing_keys.length,
  );

const PhraseUploadSummaryDialog = ({
  open,
  summary,
  languageNames,
  isConfirming,
  confirmError,
  onCancel,
  onConfirm,
}: PhraseUploadSummaryDialogProps) => {
  if (!summary) return null;

  const importableCount = estimateImportableCount(summary);
  const hasWarnings =
    summary.unsupported_languages.length > 0 ||
    summary.duplicate_keys.length > 0 ||
    summary.empty_key_count > 0 ||
    summary.existing_keys.length > 0;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>Review phrase upload</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              File
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{summary.filename}</Typography>
          </Box>

          <Box className="grid gap-3 sm:grid-cols-2">
            <Box className="rounded-lg border border-foreground/10 p-4">
              <Typography variant="body2" color="text.secondary">
                Total rows
              </Typography>
              <Typography variant="h6">{summary.phrase_count}</Typography>
            </Box>
            <Box className="rounded-lg border border-foreground/10 p-4">
              <Typography variant="body2" color="text.secondary">
                Ready to import
              </Typography>
              <Typography variant="h6">{importableCount}</Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Languages included
            </Typography>
            <Typography>
              {summary.languages
                .map((language) => formatLanguageLabel(language, languageNames))
                .join(", ") || "None"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Translation coverage
            </Typography>
            <Stack spacing={0.5}>
              {summary.languages.map((language) => (
                <Typography key={language} variant="body2">
                  {formatLanguageLabel(language, languageNames)}:{" "}
                  {summary.translation_counts[language] ?? 0} of{" "}
                  {summary.phrase_count} phrases
                </Typography>
              ))}
            </Stack>
          </Box>

          {summary.preview.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Preview
              </Typography>
              <Box className="overflow-x-auto rounded-lg border border-foreground/10">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-foreground/5 text-xs tracking-wide text-foreground/55">
                    <tr>
                      <th className="px-4 py-3 font-medium">KEY</th>
                      {summary.languages.map((language) => (
                        <th key={language} className="px-4 py-3 font-medium">
                          {formatLanguageLabel(language, languageNames)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.preview.map((row, index) => (
                      <tr
                        key={`${row.key}-${index}`}
                        className="border-t border-foreground/10"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.key || "—"}
                        </td>
                        {summary.languages.map((language) => (
                          <td key={language} className="px-4 py-3">
                            {row.translations[language] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}

          {hasWarnings && (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Notes
              </Typography>
              {summary.unsupported_languages.length > 0 && (
                <Alert severity="warning" variant="outlined">
                  These language columns were ignored because they are not
                  supported:{" "}
                  {summary.unsupported_languages
                    .map((code) => formatLanguageLabel(code, languageNames))
                    .join(", ")}
                  .
                </Alert>
              )}
              {summary.duplicate_keys.length > 0 && (
                <Alert severity="warning" variant="outlined">
                  Duplicate keys will be skipped:{" "}
                  {summary.duplicate_keys.join(", ")}.
                </Alert>
              )}
              {summary.empty_key_count > 0 && (
                <Alert severity="warning" variant="outlined">
                  {summary.empty_key_count} row
                  {summary.empty_key_count === 1 ? "" : "s"} with an empty KEY
                  will be skipped.
                </Alert>
              )}
              {summary.existing_keys.length > 0 && (
                <Alert severity="warning" variant="outlined">
                  These keys already exist in the project and will be skipped:{" "}
                  {summary.existing_keys.join(", ")}.
                </Alert>
              )}
            </Stack>
          )}

          <Alert severity="info" variant="outlined">
            This upload is staged temporarily. Confirm within{" "}
            {formatCacheExpiry(summary.cache_expires_in_seconds)} or upload the
            file again.
          </Alert>

          {confirmError && (
            <Alert severity="error" variant="outlined">
              {confirmError}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isConfirming || importableCount === 0}
        >
          {isConfirming ? "Importing..." : "Finish upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhraseUploadSummaryDialog;
