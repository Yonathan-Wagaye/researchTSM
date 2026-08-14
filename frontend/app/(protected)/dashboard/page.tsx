"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/AuthContext";

const summaryCards = [
  {
    label: "Projects",
    value: "0",
    detail: "Create your first project",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9.75h16.5m-15-4.5h5.25l1.5 1.5h6.75a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-10.5a1.5 1.5 0 0 1 1.5-1.5Z"
      />
    ),
  },
  {
    label: "Languages",
    value: "0",
    detail: "Across all projects",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.5 21 5.25-11.25L21 21m-8.75-6h7M3 5.25h8.25M7.125 3v2.25m1.83 0c-.63 3.41-2.81 6.1-5.955 7.5m1.5-4.5c1.14 2.02 2.75 3.54 4.875 4.5"
      />
    ),
  },
  {
    label: "Translation keys",
    value: "0",
    detail: "Ready to translate",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M6.75 3.75h10.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5-1.5H6.75a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z"
      />
    ),
  },
  {
    label: "Pending review",
    value: "0",
    detail: "Nothing waiting",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
];

const DashboardPage = () => {
  const { user } = useAuth();

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Workspace overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Welcome back{fullName ? `, ${fullName}` : ""}
          </h1>
          <p className="mt-2 text-sm text-foreground/55">
            Track your localization work and continue where you left off.
          </p>
        </div>
        <Link
          href="/project/new"
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          + New project
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-foreground/10 bg-elevated p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-foreground/55">{card.label}</p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="size-5"
                  aria-hidden="true"
                >
                  {card.icon}
                </svg>
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-foreground/40">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-foreground/10 bg-elevated">
          <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent projects</h2>
              <p className="mt-0.5 text-xs text-muted">
                Your most recently updated work
              </p>
            </div>
          </div>

          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-7"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold">Create your first project</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/50">
              Choose a source language, add target languages, and start
              organizing your translations.
            </p>
            <Link
              href="/project/new"
              className="mt-5 rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              Create project
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-foreground/10 bg-elevated p-5">
          <h2 className="font-semibold">Getting started</h2>
          <p className="mt-1 text-xs text-muted">
            Complete these steps to set up your workspace
          </p>

          <ol className="mt-6 space-y-5">
            {[
              [
                "Create a project",
                "Name your project and select its source language.",
              ],
              [
                "Add target languages",
                "Choose the languages your content supports.",
              ],
              [
                "Import translation keys",
                "Upload CSV, Excel, or add phrases manually.",
              ],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/40 text-xs font-semibold text-accent">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/45">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
};

export default DashboardPage;
