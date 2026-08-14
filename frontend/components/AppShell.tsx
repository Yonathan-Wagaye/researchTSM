"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "@mui/material/Button";

import PolyglotLogo from "@/components/PolyglotLogo";
import { useAuth } from "@/hooks/AuthContext";

const navigation = [
  { label: "Overview", href: "/dashboard" },
  { label: "Projects", href: "/project" },
  { label: "Translations", href: null },
  { label: "Review", href: null },
] as const;

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ");
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
      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-surface/90 backdrop-blur">
        <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
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
            <Button variant="outlined" size="small" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-foreground/10 px-4 py-8 pl-5 sm:pl-8 md:block">
          <nav aria-label="Workspace navigation" className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.href
                ? item.href === "/project"
                  ? pathname.startsWith("/project")
                  : pathname === item.href
                : false;

              const className = `block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-accent/15 font-medium text-accent"
                  : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground"
              }`;

              if (!item.href) {
                return (
                  <span key={item.label} className={`${className} cursor-default`}>
                    {item.label}
                  </span>
                );
              }

              return (
                <Link key={item.label} href={item.href} className={className}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-xl border border-cream/20 bg-cream/5 p-4">
            <p className="text-sm font-semibold">Need help?</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Read the quick-start guide to set up your first translation
              project.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-medium text-cream hover:underline"
            >
              View guide
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
