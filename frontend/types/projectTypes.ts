import { Language } from '@/types/langaugeTypes';

interface Project {
    id: number;
    name: string;
    description: string | null;
    owner_id: number;
    default_language: Language;
    created_at: string;
    updated_at: string;
}

interface CreateProject {
    name: string;
    description: string | null;
    default_language_id: number;
}

interface UpdateProject {
    id: number;
    name: string;
    description: string | null;
    defaultLanguage: Language;
}

export type { Project, CreateProject, UpdateProject };