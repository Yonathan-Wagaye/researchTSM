"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";

import { getPaginatedProjects } from "@/api/project";
import Loading from "@/components/Loading";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { Project } from "@/types/projectTypes";

const RECENT_PROJECT_LIMIT = 6;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const DashboardPage = () => {
  const { user, accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!accessToken) return;

    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProjects(
          await getPaginatedProjects(RECENT_PROJECT_LIMIT, 0, accessToken),
        );
      } catch (loadError) {
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load recent projects.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, [accessToken]);

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Workspace overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Welcome back{fullName ? `, ${fullName}` : ""}
          </h1>
          <p className="mt-2 text-sm text-foreground/55">
            Continue where you left off.
          </p>
        </div>
        <Link
          href="/project/new"
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          + New project
        </Link>
      </div>

      <section className="mt-8 rounded-xl border border-foreground/10 bg-elevated">
        <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
          <div>
            <h2 className="font-semibold">Recent projects</h2>
            <p className="mt-0.5 text-xs text-muted">
              Your most recently updated work
            </p>
          </div>
          <Link
            href="/project"
            className="text-xs font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>

        {error ? (
          <div className="px-5 py-6">
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="px-5 py-10">
            <Loading message="Loading recent projects..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
            <h3 className="font-semibold">Create your first project</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/50">
              Choose a source language and start organizing your translations.
            </p>
            <Link
              href="/project/new"
              className="mt-5 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              Create project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const language = project.default_language;
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="rounded-xl border border-foreground/10 bg-background/40 p-5 transition-colors hover:border-accent/40 hover:bg-accent/5"
                >
                  <h3 className="font-semibold">{project.name}</h3>
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
        )}
      </section>
    </>
  );
};

export default DashboardPage;
