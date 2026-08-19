"use client";

import { useTheme } from "@/hooks/ThemeContext";

const SettingsPage = () => {
  const { themeId, setThemeId } = useTheme();
  const isDark = themeId === "dark";

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="text-sm font-medium text-accent">Settings</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Appearance</h1>
        <p className="mt-2 text-sm text-foreground/55">
          Manage how Polyglot looks on your device.
        </p>
      </div>

      <div className="rounded-xl border border-foreground/10 bg-elevated">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-medium">Dark mode</p>
            <p className="mt-0.5 text-sm text-foreground/50">
              {isDark ? "Dark theme is on" : "Light theme is on"}
            </p>
          </div>

          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            onClick={() => setThemeId(isDark ? "light" : "dark")}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isDark ? "bg-accent" : "bg-foreground/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                isDark ? "translate-x-5" : "translate-x-0.5"
              } mt-px`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
