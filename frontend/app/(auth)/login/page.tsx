"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import PasswordInput from "@/components/auth/PasswordInput";
import PolyglotLogo from "@/components/layout/PolyglotLogo";
import { useAuth } from "@/hooks/AuthContext";

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch {
      // The context exposes the backend error for the form to display.
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center items-center px-8 py-10">
      <Link
        href="/"
        className="flex items-center gap-3 text-3xl font-bold tracking-tight hover:text-accent transition-colors"
      >
        <PolyglotLogo size={40} />
        Polyglot
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Login to your account
      </h1>

      <form
        className="mt-8 w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSubmit}
        onChange={clearError}
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

        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="current-password"
        />

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
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
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-foreground/60">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
};

export default LoginPage;
