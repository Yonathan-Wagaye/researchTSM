"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@mui/material/Button";

import PolyglotLogo from "@/components/layout/PolyglotLogo";
import { useAuth } from "@/hooks/AuthContext";

const NAV = [
  {
    label: "Projects",
    href: "/project",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
      </svg>
    ),
    active: (pathname: string) => pathname.startsWith("/project"),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.47.47 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
    active: (pathname: string) => pathname.startsWith("/settings"),
  },
  {
    label: "Account",
    href: "/account",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
    active: (pathname: string) => pathname.startsWith("/account"),
  },
] as const;

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-surface/90 backdrop-blur">
        <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/project" className="flex items-center gap-3">
            <PolyglotLogo size={40} />
            <span className="text-xl font-bold tracking-tight">Polyglot</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{fullName || "Researcher"}</p>
              <p className="text-xs text-foreground/45">
                {user?.email ?? "Workspace member"}
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
              {initials || "R"}
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1">
        {/* ── Sidebar ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-foreground/10 md:flex">
          <nav aria-label="Main navigation" className="flex-1 space-y-0.5 px-3 py-6">
            {NAV.map((item) => {
              const isActive = item.active(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-accent/15 font-medium text-accent"
                      : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <span className={isActive ? "text-accent" : "text-foreground/35"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + logout at the bottom */}
          <div className="border-t border-foreground/10 px-4 py-4">
            <div className="mb-3 flex items-center gap-2.5 px-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                {initials || "R"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-tight">
                  {fullName || "Researcher"}
                </p>
                <p className="truncate text-xs text-foreground/40">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleLogout}
            >
              Log out
            </Button>
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

export default AppShell;
