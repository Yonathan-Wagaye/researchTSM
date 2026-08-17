"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { getPaginatedProjects } from "@/api/project";
import Loading from "@/components/Loading";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { Project } from "@/types/projectTypes";

const PAGE_SIZE = 12;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ProjectsPage = () => {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const loadProjects = useCallback(
    async (nextOffset: number) => {
      if (!accessToken) return;

      setIsLoading(true);
      setError(null);
      try {
        const result = await getPaginatedProjects(
          PAGE_SIZE,
          nextOffset,
          accessToken,
        );
        setProjects(result);
        setOffset(nextOffset);
        setHasNext(result.length === PAGE_SIZE);
      } catch (loadError) {
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load your projects.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadProjects(0);
  }, [loadProjects]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm text-foreground/55">
            Open a project to manage phrases and translations.
          </p>
        </div>
        <Button component={Link} href="/project/new" variant="contained">
          + New project
        </Button>
      </div>

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      {isLoading && projects.length === 0 ? (
        <Loading message="Loading projects..." />
      ) : projects.length === 0 ? (
        <section className="rounded-xl border border-foreground/10 bg-elevated">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
            <h3 className="font-semibold">No projects yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/50">
              Create a project to start importing phrases and tracking
              translations.
            </p>
            <Button
              component={Link}
              href="/project/new"
              variant="outlined"
              className="mt-5"
            >
              Create project
            </Button>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const language = project.default_language;
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="rounded-xl border border-foreground/10 bg-elevated p-5 transition-colors hover:border-accent/40 hover:bg-accent/5"
                >
                  <h2 className="font-semibold">{project.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/55">
                    {project.description || "No description yet."}
                  </p>
                  <p className="mt-4 text-xs text-foreground/40">
                    {language.name} ({language.code.toUpperCase()}) · Updated{" "}
                    {formatDate(project.updated_at)}
                  </p>
                </Link>
              );
            })}
          </div>
          {(offset > 0 || hasNext) && (
            <div className="flex items-center justify-between">
              <Button
                variant="outlined"
                disabled={offset === 0 || isLoading}
                onClick={() => void loadProjects(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                disabled={!hasNext || isLoading}
                onClick={() => void loadProjects(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
