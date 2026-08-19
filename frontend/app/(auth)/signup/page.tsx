"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import PasswordInput from "@/components/auth/PasswordInput";
import PolyglotLogo from "@/components/layout/PolyglotLogo";
import { useAuth } from "@/hooks/AuthContext";

const SignupPage = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const [clientError, setClientError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get(
      "password_confirmation",
    ) as string;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;

    if (password !== passwordConfirmation) {
      setClientError("Passwords do not match.");
      return;
    }

    try {
      await register({ email, password, first_name, last_name });
      router.replace("/login");
    } catch {
      // The context exposes the backend error for the form to display.
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center px-8 py-10">
      <Link
        href="/"
        className="flex items-center gap-3 text-3xl font-bold tracking-tight hover:text-accent transition-colors"
      >
        <PolyglotLogo size={40} />
        Polyglot
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Create an account
      </h1>
      <p className="mt-2 text-foreground/60 text-sm">
        Start managing multilingual content for your research
      </p>

      <form
        className="mt-8 w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSubmit}
        onChange={() => {
          clearError();
          setClientError(null);
        }}
      >
        <TextField
          fullWidth
          type="email"
          name="email"
          label="Email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <TextField
            fullWidth
            type="text"
            name="first_name"
            label="First name"
            required
            placeholder="Jane"
            autoComplete="given-name"
          />
          <TextField
            fullWidth
            type="text"
            name="last_name"
            label="Last name"
            required
            placeholder="Doe"
            autoComplete="family-name"
          />
        </div>

        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="new-password"
        />

        <PasswordInput
          name="password_confirmation"
          label="Confirm password"
          required
          autoComplete="new-password"
        />

        {(clientError || error) && (
          <Alert severity="error" variant="outlined">
            {clientError ?? error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          fullWidth
          sx={{ mt: 1 }}
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
};

export default SignupPage;
