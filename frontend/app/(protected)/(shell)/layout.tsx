import AppShell from "@/components/layout/AppShell";

// Applies the global AppShell sidebar/header to all non-board pages:
// /project, /project/new, /settings, /account, /dashboard
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
