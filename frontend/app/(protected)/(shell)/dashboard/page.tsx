"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";

const DashboardPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/project");
  }, [router]);

  return <Loading message="Redirecting..." />;
};

export default DashboardPage;
