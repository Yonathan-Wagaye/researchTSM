"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import { addPhrase, getPhraseTranslations } from "@/api/phrase";
import { confirmPhraseUpload, uploadPhrases } from "@/api/project";
import Loading from "@/components/ui/Loading";
import PhraseTranslationsTable, {
  SAMPLE_LANGUAGE_COLUMNS,
  SAMPLE_PHRASES,
} from "@/components/phrase/PhraseTranslationsTable";
import PhraseUploadSummaryDialog from "@/components/phrase/PhraseUploadSummaryDialog";
import AddPhraseDialog from "@/components/phrase/AddPhraseDialog";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { PhraseUploadSummary, PhrasesResponse } from "@/types/phraseTypes";
import { useProject } from "../layout";

const ACCEPTED_PHRASE_FILES = ".csv,.xlsx,.xls";
const PHRASE_PAGE_SIZE = 25;

const PhrasesPage = () => {
  const params = useParams();
  const { accessToken } = useAuth();
  const { project, languageNames, formatLanguageHeader } = useProject();
  const projectId = parseInt(params.projectId as string, 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phrases, setPhrases] = useState<PhrasesResponse | null>(null);
  const [phrasesError, setPhrasesError] = useState<string | null>(null);
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(false);
  const [phraseOffset, setPhraseOffset] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<PhraseUploadSummary | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [isAddPhraseDialogOpen, setIsAddPhraseDialogOpen] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  const loadPhrases = useCallback(
    async (offset: number) => {
      if (!accessToken || Number.isNaN(projectId)) return;
      setIsLoadingPhrases(true);
      setPhrasesError(null);
      try {
        const result = await getPhraseTranslations(
          projectId,
          accessToken,
          PHRASE_PAGE_SIZE,
          offset,
        );
        setPhrases(result);
        setPhraseOffset(offset);
      } catch (err) {
        setPhrasesError(
          err instanceof ApiError ? err.message : "Unable to load phrases.",
        );
      } finally {
        setIsLoadingPhrases(false);
      }
    },
    [accessToken, projectId],
  );

  useEffect(() => {
    void loadPhrases(0);
  }, [loadPhrases]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file || !accessToken) return;

    setSelectedFile(file);
    setUploadNotice(null);
    setConfirmError(null);
    setIsUploading(true);
    try {
      const result = await uploadPhrases(projectId, file, accessToken);
      setUploadSummary(result);
      setIsSummaryOpen(true);
    } catch (err) {
      setUploadNotice(
        err instanceof ApiError ? err.message : "Unable to upload the phrase file.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setIsSummaryOpen(false);
    setUploadSummary(null);
    setConfirmError(null);
    setSelectedFile(null);
  };

  const handleConfirmUpload = async () => {
    if (!accessToken) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const result = await confirmPhraseUpload(projectId, accessToken);
      setIsSummaryOpen(false);
      setUploadSummary(null);
      setSelectedFile(null);
      setUploadNotice(
        `Imported ${result.phrases_created} phrase${result.phrases_created === 1 ? "" : "s"} with ${result.translations_created} translation${result.translations_created === 1 ? "" : "s"}.`,
      );
      await loadPhrases(0);
    } catch (err) {
      setConfirmError(
        err instanceof ApiError ? err.message : "Unable to finish the phrase upload.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const defaultLanguageCode = project.default_language.code.toUpperCase();
  const languageColumns = Array.from(
    new Set([
      defaultLanguageCode,
      ...(phrases?.phrases.flatMap((p) => Object.keys(p.translations)) ?? []),
    ]),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-accent">Phrases</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {project.name}
        </h1>
        <p className="mt-1 text-sm text-foreground/55">
          Manage phrase keys and their translations across all languages.
        </p>
      </div>

      <section className="rounded-xl border border-foreground/10 bg-elevated">
        <div className="flex flex-col gap-4 border-b border-foreground/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All phrases</h2>
            <p className="mt-0.5 text-xs text-muted">
              Import a spreadsheet or add a phrase manually
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_PHRASE_FILES}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              aria-controls={addMenuAnchor ? "add-phrases-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(addMenuAnchor)}
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
              disabled={isUploading}
              variant="contained"
              startIcon={
                <span style={{ fontSize: "1.1rem", lineHeight: 1, marginRight: -2 }}>
                  +
                </span>
              }
            >
              Add phrases
            </Button>

            <Menu
              id="add-phrases-menu"
              anchorEl={addMenuAnchor}
              open={Boolean(addMenuAnchor)}
              onClose={() => setAddMenuAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 210,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundImage: "none",
                    backgroundColor: "#1A1A1A",
                    borderRadius: "10px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setAddMenuAnchor(null);
                  fileInputRef.current?.click();
                }}
                sx={{ py: 1.5, px: 2, gap: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: "auto", color: "text.primary" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM12 18v-3H9v-2h3v-3l4 4-4 4z" />
                  </svg>
                </ListItemIcon>
                <ListItemText
                  primary="Upload CSV / XLSX"
                  secondary="Import phrases from a file"
                  slotProps={{
                    primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } },
                    secondary: { sx: { fontSize: "0.72rem" } },
                  }}
                />
              </MenuItem>
              <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.08)" }} />
              <MenuItem
                onClick={() => {
                  setAddMenuAnchor(null);
                  setIsAddPhraseDialogOpen(true);
                }}
                sx={{ py: 1.5, px: 2, gap: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: "auto", color: "text.primary" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </ListItemIcon>
                <ListItemText
                  primary="Add phrase"
                  secondary="Enter a phrase manually"
                  slotProps={{
                    primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } },
                    secondary: { sx: { fontSize: "0.72rem" } },
                  }}
                />
              </MenuItem>
            </Menu>

            {selectedFile && (
              <p className="text-xs text-foreground/50">{selectedFile.name}</p>
            )}
            {uploadNotice && (
              <p className="max-w-xs text-right text-xs text-foreground/50">
                {uploadNotice}
              </p>
            )}
          </div>
        </div>

        {phrases && phrases.total_count === 0 && (
          <div className="px-5 py-8">
            <Alert severity="info" variant="outlined" className="mb-6">
              The first column header is{" "}
              <span className="font-medium">KEY</span> — the name of each phrase.
              The remaining headers are language codes (
              <span className="font-medium">EN</span>,{" "}
              <span className="font-medium">AR</span>,{" "}
              <span className="font-medium">FA</span>). Each row is one phrase:
              its key, then the text in each language.
            </Alert>
            <div className="mt-6">
              <PhraseTranslationsTable
                phrases={SAMPLE_PHRASES}
                languageColumns={SAMPLE_LANGUAGE_COLUMNS}
                formatLanguageHeader={formatLanguageHeader}
                showStatusFilter={false}
              />
            </div>
            <p className="mt-3 text-xs text-foreground/40">
              Accepted files: CSV or Excel (.csv, .xlsx, .xls). First column is
              the phrase KEY; every other column is a language code.
            </p>
          </div>
        )}

        <div className="border-t border-foreground/10 px-5 py-8">
          {isLoadingPhrases && !phrases ? (
            <Loading message="Loading phrases..." />
          ) : phrasesError ? (
            <Alert severity="error" variant="outlined">
              {phrasesError}
            </Alert>
          ) : !phrases || phrases.total_count === 0 ? (
            <div className="py-6 text-center">
              <h3 className="font-semibold">No phrases yet</h3>
              <p className="mt-2 text-sm text-foreground/50">
                Upload a file or add a phrase manually to get started.
              </p>
            </div>
          ) : (
            <PhraseTranslationsTable
              phrases={phrases}
              languageColumns={languageColumns}
              formatLanguageHeader={formatLanguageHeader}
              isLoading={isLoadingPhrases}
              pageSize={PHRASE_PAGE_SIZE}
              offset={phraseOffset}
              onPageChange={(nextOffset) => void loadPhrases(nextOffset)}
            />
          )}
        </div>
      </section>

      <PhraseUploadSummaryDialog
        open={isSummaryOpen}
        summary={uploadSummary}
        languageNames={languageNames}
        isConfirming={isConfirming}
        confirmError={confirmError}
        onCancel={handleCancelUpload}
        onConfirm={handleConfirmUpload}
      />

      <AddPhraseDialog
        open={isAddPhraseDialogOpen}
        onClose={() => setIsAddPhraseDialogOpen(false)}
        onAdd={async (data) => {
          if (!accessToken) throw new Error("Not authenticated.");
          await addPhrase(projectId, accessToken, data);
          await loadPhrases(0);
        }}
      />
    </div>
  );
};

export default PhrasesPage;
