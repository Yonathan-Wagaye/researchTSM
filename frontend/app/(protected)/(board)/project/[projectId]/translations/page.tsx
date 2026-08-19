"use client";

import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { useProject } from "../layout";

const TranslationsPage = () => {
  const { project, languages, defaultLanguage, formatLanguageHeader } = useProject();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const targetLanguages = languages.filter(
    (lang) => lang.code !== defaultLanguage.code,
  );

  const selectedLanguage =
    targetLanguages.find((l) => l.code === selectedLanguageCode) ??
    targetLanguages[0] ??
    null;

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (code: string) => {
    setSelectedLanguageCode(code);
    handleClose();
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <p className="text-sm font-medium text-accent">Translations</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Review and compare phrase translations per target language.
        </p>
      </div>

      {/* ── Language selector bar ── */}
      <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-elevated px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
          Source
        </span>
        <span className="rounded-md bg-accent/10 px-2.5 py-1 text-sm font-medium text-accent">
          {formatLanguageHeader(defaultLanguage.code)}
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-foreground/25"
        >
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
        </svg>

        <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
          Target
        </span>

        {targetLanguages.length === 0 ? (
          <span className="text-sm text-foreground/35 italic">
            No target languages configured
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="flex items-center gap-1.5 rounded-md border border-foreground/15 bg-surface px-2.5 py-1 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-foreground/5"
            >
              {selectedLanguage
                ? formatLanguageHeader(selectedLanguage.code)
                : "Select language"}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-foreground/40"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.5,
                    minWidth: 200,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundImage: "none",
                    backgroundColor: "#1A1A1A",
                    borderRadius: "10px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  },
                },
              }}
            >
              {targetLanguages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  selected={lang.code === selectedLanguage?.code}
                  onClick={() => handleSelect(lang.code)}
                  sx={{
                    py: 1.2,
                    px: 2,
                    fontSize: "0.875rem",
                    fontWeight: lang.code === selectedLanguage?.code ? 600 : 400,
                  }}
                >
                  {formatLanguageHeader(lang.code)}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </div>

      {/* ── Content area ── */}
      {selectedLanguage ? (
        <section className="rounded-xl border border-foreground/10 bg-elevated">
          {/* Table header */}
          <div className="grid grid-cols-2 border-b border-foreground/10 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
              {formatLanguageHeader(defaultLanguage.code)}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
              {formatLanguageHeader(selectedLanguage.code)}
            </span>
          </div>

          {/* Empty state — replace with real rows when data is available */}
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-foreground/5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-foreground/30"
              >
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No translations yet</p>
            <p className="mt-1 text-xs text-foreground/40">
              Translations for{" "}
              <span className="font-medium text-foreground/60">
                {selectedLanguage.name}
              </span>{" "}
              will appear here.
            </p>
          </div>
        </section>
      ) : (
        <section className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-foreground/15 px-6 py-16 text-center">
          <p className="text-sm text-foreground/40">
            Select a target language above to view translations.
          </p>
        </section>
      )}
    </div>
  );
};

export default TranslationsPage;
