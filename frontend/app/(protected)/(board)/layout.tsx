// Board route group — no AppShell here; board pages use BoardShell via their
// own [projectId] layout.
export default function BoardGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
