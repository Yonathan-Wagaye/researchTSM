export interface PhraseUploadPreviewRow {
  key: string;
  translations: Record<string, string>;
}

export interface PhraseUploadSummary {
  phrase_count: number;
  languages: string[];
  unsupported_languages: string[];
  filename: string;
  preview: PhraseUploadPreviewRow[];
  duplicate_keys: string[];
  empty_key_count: number;
  existing_keys: string[];
  translation_counts: Record<string, number>;
  cache_expires_in_seconds: number;
}

export interface PhraseUploadConfirmResult {
  phrases_created: number;
  translations_created: number;
  skipped_empty_keys: number;
  skipped_duplicate_keys: number;
  skipped_existing_keys: number;
}

export interface PhraseTranslationCell {
  text: string;
  status: "pending" | "approved" | "rejected";
}

export interface PhraseTranslation {
  key: string;
  translations: Record<string, PhraseTranslationCell>;
  created_at: string;
  updated_at: string;
}

export interface PhrasesResponse {
  phrases: PhraseTranslation[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PhraseCreateResponse {
  id: number;
  project_id: number;
  key: string;
  source_text: string;
  context: string | null;
  usage: string | null;
  created_at: string;
  updated_at: string;
}