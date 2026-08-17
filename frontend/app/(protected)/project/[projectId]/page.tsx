"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { getLanguages } from "@/api/language";
import { getPhraseTranslations } from "@/api/phrase";
import {
  confirmPhraseUpload,
  getProject,
  uploadPhrases,
} from "@/api/project";
import Loading from "@/components/Loading";
import PhraseTranslationsTable, {
  SAMPLE_LANGUAGE_COLUMNS,
  SAMPLE_PHRASES,
} from "@/components/PhraseTranslationsTable";
import PhraseUploadSummaryDialog from "@/components/PhraseUploadSummaryDialog";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { PhraseUploadSummary, PhrasesResponse } from "@/types/phraseTypes";
import { Project } from "@/types/projectTypes";
import { Language } from "@/types/langaugeTypes";

const ACCEPTED_PHRASE_FILES = ".csv,.xlsx,.xls";
const PHRASE_PAGE_SIZE = 25;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ProjectPage = () => {
  const params = useParams();
  const { accessToken } = useAuth();
  const projectId = parseInt(params.projectId as string, 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<PhraseUploadSummary | null>(
    null,
  );
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [phrases, setPhrases] = useState<PhrasesResponse | null>(null);
  const [phrasesError, setPhrasesError] = useState<string | null>(null);
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(false);
  const [phraseOffset, setPhraseOffset] = useState(0);
  const [languages, setLanguages] = useState<Language[]>([]);

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
      } catch (loadError) {
        setPhrasesError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load phrases.",
        );
      } finally {
        setIsLoadingPhrases(false);
      }
    },
    [accessToken, projectId],
  );

  useEffect(() => {
    if (!accessToken || Number.isNaN(projectId)) return;

    const fetchProject = async () => {
      try {
        setError(null);
        setProject(await getProject(projectId, accessToken));
      } catch (loadError) {
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load this project.",
        );
      }
    };

    void fetchProject();
    void loadPhrases(0);
    void getLanguages(accessToken)
      .then(setLanguages)
      .catch(() => setLanguages([]));
  }, [projectId, accessToken, loadPhrases]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file || !accessToken) return;

    setSelectedFile(file);
    setUploadNotice(null);
    setConfirmError(null);
    setIsUploading(true);

    try {
      const result = await uploadPhrases(projectId, file, accessToken);
      setUploadSummary(result);
      setIsSummaryOpen(true);
    } catch (uploadError) {
      setUploadNotice(
        uploadError instanceof ApiError
          ? uploadError.message
          : "Unable to upload the phrase file.",
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
    } catch (confirmUploadError) {
      setConfirmError(
        confirmUploadError instanceof ApiError
          ? confirmUploadError.message
          : "Unable to finish the phrase upload.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  if (error) {
    return (
      <Alert severity="error" variant="outlined">
        {error}
      </Alert>
    );
  }

  if (!project) {
    return <Loading message="Loading project..." />;
  }

  const language = project.default_language;
  const defaultLanguageCode = language.code.toUpperCase();
  const languageColumns = Array.from(
    new Set([
      defaultLanguageCode,
      ...(phrases?.phrases.flatMap((phrase) =>
        Object.keys(phrase.translations),
      ) ?? []),
    ]),
  );
  const languageNames = Object.fromEntries(
    languages.map((item) => [item.code.toUpperCase(), item.name]),
  );
  const formatLanguageHeader = (code: string) => {
    const name = languageNames[code.toUpperCase()];
    return name ? `${code.toUpperCase()} (${name})` : code.toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Project</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/55">
            {project.description || "No description yet."}
          </p>
        </div>
        <Button
          component={Link}
          href={`/project/${project.id}/edit`}
          variant="outlined"
        >
          Edit project
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-foreground/10 bg-elevated p-5">
          <p className="text-sm text-foreground/55">Source language</p>
          <p className="mt-3 text-xl font-semibold">{language.name}</p>
          <p className="mt-1 text-xs text-foreground/40">
            {language.native_name} · {language.code.toUpperCase()} ·{" "}
            {language.direction.toUpperCase()}
          </p>
        </article>
        <article className="rounded-xl border border-foreground/10 bg-elevated p-5">
          <p className="text-sm text-foreground/55">Language code</p>
          <p className="mt-3 text-xl font-semibold">{language.code}</p>
          <p className="mt-1 text-xs text-foreground/40">
            Use this as a column header in phrase files
          </p>
        </article>
        <article className="rounded-xl border border-foreground/10 bg-elevated p-5">
          <p className="text-sm text-foreground/55">Created</p>
          <p className="mt-3 text-xl font-semibold">
            {formatDate(project.created_at)}
          </p>
        </article>
        <article className="rounded-xl border border-foreground/10 bg-elevated p-5">
          <p className="text-sm text-foreground/55">Last updated</p>
          <p className="mt-3 text-xl font-semibold">
            {formatDate(project.updated_at)}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-foreground/10 bg-elevated">
        <div className="flex flex-col gap-4 border-b border-foreground/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Phrases</h2>
            <p className="mt-0.5 text-xs text-muted">
              Import a spreadsheet of source and translated phrases
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_PHRASE_FILES}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload CSV / XLSX"}
            </Button>
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
              <span className="font-medium">FA</span>
              ). Each row is one phrase: its name, then the text in each language.
              Polyglot fills in English name, native name, and text direction —
              you do not need those metadata rows.
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
              the phrase KEY; every other column is a language code with phrases
              in the rows below.
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
              <h3 className="font-semibold">No phrases</h3>
              <p className="mt-2 text-sm text-foreground/50">
                This project does not have any phrases yet. Upload a file to add
                them.
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
    </div>
  );
};

export default ProjectPage;
