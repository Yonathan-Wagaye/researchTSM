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
    {
      key: "FAREWELL",
      translations: {
        EN: { text: "Goodbye", status: "approved" },
        AR: { text: "", status: "pending" },
      },
      created_at: "",
      updated_at: "",
    },
  ],
  total_count: 3,
  page: 1,
  page_size: 3,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

type TranslationStatusFilter = "approved" | "pending" | "rejected" | "missing";

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
  {
    status: "missing",
    label: "Missing",
    description: "no translation exists yet",
    swatch: "bg-violet-500",
    highlight: "bg-violet-500/20",
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

type SortDirection = "asc" | "desc";

const SortIcon = ({ direction, active }: { direction: SortDirection; active: boolean }) => (
  <span
    className="ml-1.5 inline-flex flex-col gap-px align-middle"
    aria-hidden="true"
  >
    <svg
      width="8"
      height="5"
      viewBox="0 0 8 5"
      className={`transition-colors ${active && direction === "asc" ? "text-foreground" : "text-foreground/25"}`}
      fill="currentColor"
    >
      <path d="M4 0L8 5H0L4 0Z" />
    </svg>
    <svg
      width="8"
      height="5"
      viewBox="0 0 8 5"
      className={`transition-colors ${active && direction === "desc" ? "text-foreground" : "text-foreground/25"}`}
      fill="currentColor"
    >
      <path d="M4 5L0 0H8L4 5Z" />
    </svg>
  </span>
);

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
  const [activeFilters, setActiveFilters] = useState<Set<TranslationStatusFilter>>(new Set());
  const [colorAll, setColorAll] = useState(false);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const toggleFilter = (status: TranslationStatusFilter) => {
    setColorAll(false);
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  };

  const toggleColorAll = () => {
    setColorAll((prev) => {
      if (!prev) setActiveFilters(new Set());
      return !prev;
    });
  };

  const sortedPhrases = [...phrases.phrases].sort((a, b) =>
    sortDirection === "asc"
      ? a.key.localeCompare(b.key)
      : b.key.localeCompare(a.key),
  );

  const handleSortToggle = () =>
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <div className="space-y-4">
      {showStatusFilter && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <p className="text-sm text-foreground/55">
            Showing {phrases.phrases.length} of {phrases.total_count} phrases
          </p>
          <div className="flex flex-col items-end gap-2">
            {isLoading && (
              <p className="text-xs text-foreground/40">Refreshing...</p>
            )}
            <p className="text-xs text-foreground/50">
              Select one or more colours to highlight cells. Click again to deselect.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((filter) => {
                const isActive = !colorAll && activeFilters.has(filter.status);
                const isColorAllActive = colorAll;
                return (
                  <button
                    key={filter.status}
                    type="button"
                    aria-pressed={isActive || isColorAllActive}
                    aria-label={`Highlight ${filter.description}`}
                    title={`Highlight ${filter.description}`}
                    onClick={() => toggleFilter(filter.status)}
                    className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-xs transition-colors ${
                      isActive ? "bg-foreground/8" : "hover:bg-foreground/5"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-5 rounded-sm border ${filter.swatch} ${
                        isActive
                          ? "border-foreground/80 ring-2 ring-foreground/25"
                          : "border-foreground/20"
                      }`}
                    />
                    <span className="text-foreground/70">
                      {filter.label}
                      <span className="hidden text-foreground/45 sm:inline">
                        {" "}— {filter.description}
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* Divider */}
              <span className="h-4 w-px bg-foreground/15" />

              {/* Color all toggle */}
              <button
                type="button"
                aria-pressed={colorAll}
                onClick={toggleColorAll}
                title="Colour-code every cell by its status"
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  colorAll
                    ? "border-foreground/40 bg-foreground/10 text-foreground"
                    : "border-foreground/15 text-foreground/55 hover:border-foreground/30 hover:text-foreground/80"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                Colour all
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-foreground/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-foreground/5 text-xs tracking-wide text-foreground/55">
            <tr>
              <th className="px-4 py-3 font-medium">
                <button
                  type="button"
                  onClick={handleSortToggle}
                  className="group inline-flex items-center gap-0.5 rounded transition-colors hover:text-foreground"
                  aria-label={`Sort by phrase key ${sortDirection === "asc" ? "descending" : "ascending"}`}
                >
                  Phrase Key
                  <SortIcon direction={sortDirection} active />
                </button>
              </th>
              {languageColumns.map((code) => (
                <th key={code} className="px-4 py-3 font-medium">
                  {formatLanguageHeader(code)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-foreground/80">
            {sortedPhrases.map((phrase) => (
              <tr key={phrase.key} className="border-t border-foreground/10">
                <td className="px-4 py-3 font-medium">{phrase.key}</td>
                {languageColumns.map((code) => {
                  const cell = phrase.translations[code];
                  const effectiveStatus: TranslationStatusFilter =
                    !cell || !cell.text ? "missing" : cell.status;
                  const isHighlighted =
                    colorAll || activeFilters.has(effectiveStatus);
                  const highlightClass = isHighlighted
                    ? STATUS_FILTERS.find((f) => f.status === effectiveStatus)
                        ?.highlight
                    : "";
                  return (
                    <td
                      key={code}
                      className={`px-4 py-3 transition-colors ${highlightClass ?? ""}`}
                    >
                      {cell?.text || (
                        <span className="text-foreground/30 italic">—</span>
                      )}
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
