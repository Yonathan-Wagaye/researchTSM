"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

import PolyglotLogo from "@/components/layout/PolyglotLogo";
import { useAuth } from "@/hooks/AuthContext";
import { getPaginatedProjects } from "@/api/project";
import { Project } from "@/types/projectTypes";

// ─── Nav items ────────────────────────────────────────────────────────────────

const projectNav = (id: number) => [
  {
    label: "Overview",
    href: `/project/${id}`,
    exact: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    label: "Phrases",
    href: `/project/${id}/phrases`,
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
      </svg>
    ),
  },
  {
    label: "Translations",
    href: `/project/${id}/translations`,
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
      </svg>
    ),
  },
  {
    label: "Versions",
    href: `/project/${id}/versions`,
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
] as const;

// ─── BoardShell ───────────────────────────────────────────────────────────────

type BoardShellProps = {
  project: Project;
  children: React.ReactNode;
};

const BoardShell = ({ project, children }: BoardShellProps) => {
  const { user, logout, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Project switcher state
  const [switcherAnchor, setSwitcherAnchor] = useState<null | HTMLElement>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const openSwitcher = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setSwitcherAnchor(e.currentTarget);
    if (!accessToken || allProjects.length > 0) return;
    setLoadingProjects(true);
    try {
      const projects = await getPaginatedProjects(50, 0, accessToken);
      setAllProjects(projects);
    } catch {
      // silently fail — user can still navigate via /project
    } finally {
      setLoadingProjects(false);
    }
  };

  const nav = projectNav(project.id);

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-surface/90 backdrop-blur">
        <div className="flex w-full items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <PolyglotLogo size={34} />
            <span className="text-base font-bold tracking-tight">Polyglot</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{fullName || "Researcher"}</p>
              <p className="text-xs text-foreground/45">
                {user?.email ?? "Workspace member"}
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {initials || "R"}
            </div>
            <Button variant="outlined" size="small" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1">
        {/* ── Sidebar ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-foreground/10 md:flex">
          {/* Project switcher */}
          <div className="border-b border-foreground/10 px-3 py-3">
            <button
              type="button"
              onClick={openSwitcher}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-foreground/5"
              aria-haspopup="true"
              aria-expanded={Boolean(switcherAnchor)}
            >
              <span className="truncate">{project.name}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0 text-foreground/40"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            <Menu
              anchorEl={switcherAnchor}
              open={Boolean(switcherAnchor)}
              onClose={() => setSwitcherAnchor(null)}
              transformOrigin={{ horizontal: "left", vertical: "top" }}
              anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.5,
                    minWidth: 200,
                    maxWidth: 240,
                    maxHeight: 320,
                    overflowY: "auto",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundImage: "none",
                    backgroundColor: "#1A1A1A",
                    borderRadius: "10px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  },
                },
              }}
            >
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                  Switch board
                </p>
              </div>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
              {loadingProjects ? (
                <MenuItem disabled sx={{ fontSize: "0.8rem" }}>
                  Loading…
                </MenuItem>
              ) : allProjects.length === 0 ? (
                <MenuItem disabled sx={{ fontSize: "0.8rem" }}>
                  No other projects
                </MenuItem>
              ) : (
                allProjects.map((p) => (
                  <MenuItem
                    key={p.id}
                    selected={p.id === project.id}
                    onClick={() => {
                      setSwitcherAnchor(null);
                      router.push(`/project/${p.id}`);
                    }}
                    sx={{
                      py: 1.2,
                      px: 2,
                      fontSize: "0.875rem",
                      fontWeight: p.id === project.id ? 600 : 400,
                    }}
                  >
                    <span className="truncate">{p.name}</span>
                  </MenuItem>
                ))
              )}
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mt: 0.5 }} />
              <MenuItem
                onClick={() => {
                  setSwitcherAnchor(null);
                  router.push("/project");
                }}
                sx={{ py: 1.2, px: 2, fontSize: "0.8rem", color: "text.secondary" }}
              >
                View all projects →
              </MenuItem>
            </Menu>
          </div>

          {/* Project nav */}
          <nav aria-label="Project navigation" className="flex-1 space-y-0.5 px-3 py-4">
            {nav.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-accent/15 font-medium text-accent"
                      : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <span className={active ? "text-accent" : "text-foreground/40"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom links: Settings, Account, All projects */}
          <div className="border-t border-foreground/10 px-3 py-4 space-y-0.5">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
              Settings
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/45 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Account
            </Link>
            <Link
              href="/project"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground/35 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              All projects
            </Link>
          </div>
        </aside>

        {/* ── Page content ── */}
        <div className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BoardShell;
