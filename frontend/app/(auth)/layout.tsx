"use client";

import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading message="Checking your session..." />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthLayout;
