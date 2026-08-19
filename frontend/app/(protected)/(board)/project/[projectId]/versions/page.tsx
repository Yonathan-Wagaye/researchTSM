"use client";

import { useProject } from "../layout";

const VersionsPage = () => {
  const { project } = useProject();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-accent">Versions</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {project.name}
        </h1>
        <p className="mt-1 text-sm text-foreground/55">
          Track and restore published snapshots of your translations.
        </p>
      </div>

      <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-foreground/10 bg-elevated px-6 py-16 text-center">
        <span className="text-foreground/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
          </svg>
        </span>
        <h2 className="mt-4 font-semibold">Versioning coming soon</h2>
        <p className="mt-2 max-w-sm text-sm text-foreground/50">
          Publish named snapshots of your project translations and roll back to
          any previous version when needed.
        </p>
      </section>
    </div>
  );
};

export default VersionsPage;
