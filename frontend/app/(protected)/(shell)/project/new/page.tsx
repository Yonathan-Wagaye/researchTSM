"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { getLanguages } from "@/api/language";
import { createProject } from "@/api/project";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/AuthContext";
import { Language } from "@/types/langaugeTypes";

const CreateProjectPage = () => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const loadLanguages = async () => {
      try {
        setIsLoadingLanguages(true);
        setLanguages(await getLanguages(accessToken));
      } catch (loadError) {
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load languages.",
        );
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    void loadLanguages();
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken || !selectedLanguage) return;

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const descriptionValue = (formData.get("description") as string).trim();

    try {
      setIsSubmitting(true);
      setError(null);
      const project = await createProject(
        {
          name,
          description: descriptionValue.length > 0 ? descriptionValue : null,
          default_language_id: selectedLanguage.id,
        },
        accessToken,
      );
      router.replace(`/project/${project.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Unable to create the project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
        <p className="text-sm font-medium text-accent">New project</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Create a project
        </h1>
        <p className="mt-2 text-sm text-foreground/55">
          Name your project and choose the source language for its content.
        </p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="name"
            label="Project name"
            required
            placeholder="Field notes 2026"
            autoComplete="off"
          />

          <TextField
            fullWidth
            name="description"
            label="Description"
            placeholder="Optional context for collaborators"
            multiline
            minRows={3}
          />

          <Autocomplete
            options={languages}
            value={selectedLanguage}
            loading={isLoadingLanguages}
            onChange={(_event, language) => setSelectedLanguage(language)}
            getOptionLabel={(language) =>
              `${language.name} (${language.native_name})`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Source language"
                required
                placeholder="Search languages"
              />
            )}
          />

          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              size="large"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={
                isSubmitting || isLoadingLanguages || !selectedLanguage
              }
            >
              {isSubmitting ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
    </div>
  );
};

export default CreateProjectPage;
