"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

import Loading from "@/components/Loading";
import PolyglotLogo from "@/components/PolyglotLogo";
import { useAuth } from "@/hooks/AuthContext";

export default function Home() {
  const router = useRouter();
  const { sessionStatus, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || sessionStatus === "loading") return;

    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
      return;
    }

    if (sessionStatus === "expired") {
      router.replace("/login");
    }
  }, [isLoading, sessionStatus, router]);

  if (isLoading || sessionStatus === "loading" || sessionStatus === "authenticated" || sessionStatus === "expired") {
    return (
      <Loading
        message={
          sessionStatus === "expired"
            ? "Your session expired. Redirecting to login..."
            : "Checking your session..."
        }
      />
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-8 py-10">
        <div className="flex items-center gap-4">
          <PolyglotLogo size={72} />
          <span className="text-5xl font-bold tracking-tight sm:text-6xl">
            Polyglot
          </span>
        </div>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 px-8 pt-4 pb-12 lg:pt-6 lg:pb-16">
        <section className="lg:w-1/2 flex flex-col">
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            Localized Translation Management System Built For Research
          </h1>
          <p className="mt-4 text-base lg:text-lg text-muted max-w-lg leading-relaxed">
            Manage multilingual phrases, media, and translation workflows in one
            place — for researchers, translators, and developers.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </Button>
          </div>

          <div className="mt-12 flex divide-x divide-foreground/15">
            <div className="pr-6">
              <p className="text-2xl font-bold">CSV / Excel</p>
              <p className="mt-1 text-sm text-muted">import &amp; export</p>
            </div>
            <div className="px-6">
              <p className="text-2xl font-bold">Multi-lang</p>
              <p className="mt-1 text-sm text-muted">project support</p>
            </div>
            <div className="pl-6">
              <p className="text-2xl font-bold">Review</p>
              <p className="mt-1 text-sm text-muted">&amp; publish flow</p>
            </div>
          </div>
        </section>

        <section className="lg:w-1/2">
          <h2 className="text-xl font-semibold mb-6">How it works</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 rounded-xl bg-elevated p-4">
              <div className="size-10 shrink-0 rounded-lg bg-cream/15 flex items-center justify-center text-cream font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Create a project</p>
                <p className="mt-1 text-sm text-muted">
                  Set a source language and add the languages you need to support
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-elevated p-4">
              <div className="size-10 shrink-0 rounded-lg bg-cream/15 flex items-center justify-center text-cream font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Add phrases &amp; translations</p>
                <p className="mt-1 text-sm text-muted">
                  Organize keys, collaborate on translations, and track status
                  per language
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-elevated p-4">
              <div className="size-10 shrink-0 rounded-lg bg-cream/15 flex items-center justify-center text-cream font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Review and export</p>
                <p className="mt-1 text-sm text-muted">
                  Approve changes and export to CSV, Excel, or JSON when ready
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
