"use client";

import Link from "next/link";
import Button from "@mui/material/Button";

import { useProject } from "./layout";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ProjectOverviewPage = () => {
  const { project } = useProject();
  const language = project.default_language;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {project.name}
          </h1>
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
          <p className="mt-3 text-xl font-semibold">{language.code.toUpperCase()}</p>
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

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`/project/${project.id}/phrases`}
          className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-elevated p-5 transition-colors hover:border-accent/40 hover:bg-accent/5"
        >
          <span className="text-foreground/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </span>
          <p className="font-semibold">Phrases</p>
          <p className="text-xs text-foreground/50">
            Manage and import phrase keys and translations
          </p>
        </Link>
        <Link
          href={`/project/${project.id}/translations`}
          className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-elevated p-5 transition-colors hover:border-accent/40 hover:bg-accent/5"
        >
          <span className="text-foreground/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
          </span>
          <p className="font-semibold">Translations</p>
          <p className="text-xs text-foreground/50">
            Review translations per target language
          </p>
        </Link>
        <Link
          href={`/project/${project.id}/versions`}
          className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-elevated p-5 transition-colors hover:border-accent/40 hover:bg-accent/5"
        >
          <span className="text-foreground/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
          </span>
          <p className="font-semibold">Versions</p>
          <p className="text-xs text-foreground/50">
            Track published snapshots of your translations
          </p>
        </Link>
      </section>
    </div>
  );
};

export default ProjectOverviewPage;
