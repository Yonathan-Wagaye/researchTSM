"use client";

import Loading from "@/components/ui/Loading";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Bare auth guard — no shell here. AppShell is applied by the (shell) group
// layout; board pages use BoardShell via their own [projectId] layout.
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedLayout;
