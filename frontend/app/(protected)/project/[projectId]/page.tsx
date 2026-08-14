"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { getProject, uploadPhrases } from "@/api/project";
import Loading from "@/components/Loading";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { Project } from "@/types/projectTypes";

const ACCEPTED_PHRASE_FILES = ".csv,.xlsx,.xls";

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
  const [unsupportedLanguagesMessage, setUnsupportedLanguagesMessage] =
    useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

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
  }, [projectId, accessToken]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file || !accessToken) return;

    setSelectedFile(file);
    setUploadNotice(null);
    setUnsupportedLanguagesMessage(null);
    setIsUploading(true);

    try {
      const result = await uploadPhrases(projectId, file, accessToken);
      setUploadNotice(
        `Accepted ${result.phrase_count} phrases in ${result.languages.join(", ")}.`,
      );
      if (result.unsupported_languages.length > 0) {
        setUnsupportedLanguagesMessage(
          `These languages are not supported and were ignored: ${result.unsupported_languages.join(", ")}.`,
        );
      }
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

          <div className="mt-6 overflow-x-auto rounded-lg border border-foreground/10">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Example phrase file layout</caption>
              <thead className="bg-foreground/5 text-xs uppercase tracking-wide text-foreground/55">
                <tr>
                  <th className="px-4 py-3 font-medium">KEY</th>
                  <th className="px-4 py-3 font-medium">EN</th>
                  <th className="px-4 py-3 font-medium">AR</th>
                  <th className="px-4 py-3 font-medium">FA</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80">
                <tr className="border-t border-foreground/10">
                  <td className="px-4 py-3">GREETING</td>
                  <td className="px-4 py-3">Hello</td>
                  <td className="px-4 py-3">مرحبا</td>
                  <td className="px-4 py-3">سلام</td>
                </tr>
                <tr className="border-t border-foreground/10">
                  <td className="px-4 py-3">THANKS</td>
                  <td className="px-4 py-3">Thank you</td>
                  <td className="px-4 py-3">شكرا</td>
                  <td className="px-4 py-3">متشکرم</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-foreground/40">
            Accepted files: CSV or Excel (.csv, .xlsx, .xls). First column is
            the phrase KEY; every other column is a language code with phrases
            in the rows below.
          </p>
        </div>

        <div className="border-t border-foreground/10 px-5 py-10 text-center">
          <h3 className="font-semibold">No phrases</h3>
          <p className="mt-2 text-sm text-foreground/50">
            This project does not have any phrases yet. Upload a file to add
            them.
          </p>
        </div>
      </section>

      <Dialog
        open={Boolean(unsupportedLanguagesMessage)}
        onClose={() => setUnsupportedLanguagesMessage(null)}
      >
        <DialogTitle>Some languages were ignored</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {unsupportedLanguagesMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsupportedLanguagesMessage(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
