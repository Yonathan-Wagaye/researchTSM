"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { getPaginatedProjects } from "@/api/project";
import Loading from "@/components/ui/Loading";
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

const timeAgo = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};


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
              const lang = project.default_language;
              const initials = project.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group flex flex-col rounded-xl border border-foreground/10 bg-elevated transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-black/20"
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3.5 p-5">
                    {/* Avatar */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground/8 text-sm font-bold text-foreground/50">
                      {initials || "#"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold leading-tight group-hover:text-accent transition-colors">
                        {project.name}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-foreground/50">
                        {project.description || "No description."}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-5 border-t border-foreground/8" />

                  {/* Language info */}
                  <div className="flex flex-wrap items-center gap-2 px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-foreground/8 px-2.5 py-1 text-xs font-medium">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-foreground/50">
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                      </svg>
                      {lang.code.toUpperCase()} — {lang.name}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-foreground/8 px-2.5 py-1 text-xs font-medium text-foreground/60">
                      {lang.direction.toUpperCase()}
                    </span>
                    {lang.native_name && (
                      <span className="text-xs text-foreground/35">
                        {lang.native_name}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-foreground/8 px-5 py-3 text-xs text-foreground/40">
                    <span>Created {formatDate(project.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
                      </svg>
                      {timeAgo(project.updated_at)}
                    </span>
                  </div>
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
