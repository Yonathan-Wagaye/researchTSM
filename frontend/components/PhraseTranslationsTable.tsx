"use client";

import { useState } from "react";
import Button from "@mui/material/Button";

import { PhrasesResponse } from "@/types/phraseTypes";

export const SAMPLE_LANGUAGE_COLUMNS = ["EN", "AR", "FA"];

export const SAMPLE_PHRASES: PhrasesResponse = {
  phrases: [
    {
      key: "GREETING",
      translations: {
        EN: { text: "Hello", status: "approved" },
        AR: { text: "مرحبا", status: "pending" },
        FA: { text: "سلام", status: "rejected" },
      },
      created_at: "",
      updated_at: "",
    },
    {
      key: "THANKS",
      translations: {
        EN: { text: "Thank you", status: "approved" },
        AR: { text: "شكرا", status: "approved" },
        FA: { text: "متشکرم", status: "pending" },
      },
      created_at: "",
      updated_at: "",
    },
  ],
  total_count: 2,
  page: 1,
  page_size: 2,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

type TranslationStatusFilter = "approved" | "pending" | "rejected";

const STATUS_FILTERS: Array<{
  status: TranslationStatusFilter;
  label: string;
  description: string;
  swatch: string;
  highlight: string;
}> = [
  {
    status: "approved",
    label: "Approved",
    description: "successful translations",
    swatch: "bg-emerald-500",
    highlight: "bg-emerald-500/20",
  },
  {
    status: "pending",
    label: "Pending",
    description: "waiting for review",
    swatch: "bg-amber-400",
    highlight: "bg-amber-400/25",
  },
  {
    status: "rejected",
    label: "Failed",
    description: "failed or incorrect translations",
    swatch: "bg-red-500",
    highlight: "bg-red-500/20",
  },
];

type PhraseTranslationsTableProps = {
  phrases: PhrasesResponse;
  languageColumns: string[];
  formatLanguageHeader: (code: string) => string;
  isLoading?: boolean;
  pageSize?: number;
  offset?: number;
  onPageChange?: (offset: number) => void;
  showStatusFilter?: boolean;
};

const PhraseTranslationsTable = ({
  phrases,
  languageColumns,
  formatLanguageHeader,
  isLoading = false,
  pageSize = 25,
  offset = 0,
  onPageChange,
  showStatusFilter = true,
}: PhraseTranslationsTableProps) => {
  const [statusFilter, setStatusFilter] =
    useState<TranslationStatusFilter | null>(null);

  return (
    <div className="space-y-4">
      {showStatusFilter && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <p className="text-sm text-foreground/55">
          Showing {phrases.phrases.length} of {phrases.total_count} phrases
        </p>
        <div className="flex flex-col items-start gap-2">
          {isLoading && (
            <p className="text-xs text-foreground/40">Refreshing...</p>
          )}
          <p className="text-xs text-foreground/50">
            Click a color to highlight matching translations. Click again to
            clear.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.status;
              return (
                <button
                  key={filter.status}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`Highlight ${filter.description}`}
                  title={`Highlight ${filter.description}`}
                  onClick={() =>
                    setStatusFilter((current) =>
                      current === filter.status ? null : filter.status,
                    )
                  }
                  className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-xs ${
                    isActive ? "bg-foreground/5" : "hover:bg-foreground/5"
                  }`}
                >
                  <span
                    className={`h-3.5 w-5 rounded-sm border ${filter.swatch} ${
                      isActive
                        ? "border-foreground ring-2 ring-foreground/30"
                        : "border-foreground/20"
                    }`}
                  />
                  <span className="text-foreground/70">
                    {filter.label}
                    <span className="hidden text-foreground/45 sm:inline">
                      {" "}
                      — {filter.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-foreground/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-foreground/5 text-xs tracking-wide text-foreground/55">
            <tr>
              <th className="px-4 py-3 font-medium">Phrase Key</th>
              {languageColumns.map((code) => (
                <th key={code} className="px-4 py-3 font-medium">
                  {formatLanguageHeader(code)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-foreground/80">
            {phrases.phrases.map((phrase) => (
              <tr key={phrase.key} className="border-t border-foreground/10">
                <td className="px-4 py-3 font-medium">{phrase.key}</td>
                {languageColumns.map((code) => {
                  const cell = phrase.translations[code];
                  const isHighlighted =
                    Boolean(statusFilter) && cell?.status === statusFilter;
                  const highlightClass = isHighlighted
                    ? STATUS_FILTERS.find(
                        (filter) => filter.status === statusFilter,
                      )?.highlight
                    : "";
                  return (
                    <td
                      key={code}
                      className={`px-4 py-3 ${highlightClass ?? ""}`}
                    >
                      {cell?.text || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onPageChange && (phrases.has_previous || phrases.has_next) && (
        <div className="flex items-center justify-between">
          <Button
            variant="outlined"
            disabled={!phrases.has_previous || isLoading}
            onClick={() => onPageChange(Math.max(0, offset - pageSize))}
          >
            Previous
          </Button>
          <p className="text-xs text-foreground/50">
            Page {phrases.page} of {phrases.total_pages}
          </p>
          <Button
            variant="outlined"
            disabled={!phrases.has_next || isLoading}
            onClick={() => onPageChange(offset + pageSize)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhraseTranslationsTable;
