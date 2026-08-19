"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";

import { getLanguages } from "@/api/language";
import { getProject } from "@/api/project";
import Loading from "@/components/ui/Loading";
import BoardShell from "@/components/layout/BoardShell";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { Language } from "@/types/langaugeTypes";
import { Project } from "@/types/projectTypes";

// ─── ProjectContext ────────────────────────────────────────────────────────────

type ProjectContextValue = {
  project: Project;
  languages: Language[];
  languageNames: Record<string, string>;
  defaultLanguage: Language;
  formatLanguageHeader: (code: string) => string;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside the project board layout");
  return ctx;
}

// ─── Board Layout ──────────────────────────────────────────────────────────────

const ProjectBoardLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const router = useRouter();
  const { accessToken, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const projectId = parseInt(params.projectId as string, 10);

  const [project, setProject] = useState<Project | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken || Number.isNaN(projectId)) return;
    setIsLoading(true);
    setError(null);
    try {
      const [proj, langs] = await Promise.all([
        getProject(projectId, accessToken),
        getLanguages(accessToken).catch(() => [] as Language[]),
      ]);
      setProject(proj);
      setLanguages(langs);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to load this project.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, projectId]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    void load();
  }, [isAuthLoading, isAuthenticated, load, router]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading message="Loading project..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <Alert severity="error" variant="outlined">
          {error ?? "Project not found."}
        </Alert>
      </div>
    );
  }

  const languageNames = Object.fromEntries(
    languages.map((l) => [l.code.toUpperCase(), l.name]),
  );

  const formatLanguageHeader = (code: string) => {
    const name = languageNames[code.toUpperCase()];
    return name ? `${code.toUpperCase()} (${name})` : code.toUpperCase();
  };

  return (
    <ProjectContext.Provider value={{ project, languages, languageNames, defaultLanguage: project.default_language, formatLanguageHeader }}>
      <BoardShell project={project}>{children}</BoardShell>
    </ProjectContext.Provider>
  );
};

export default ProjectBoardLayout;
