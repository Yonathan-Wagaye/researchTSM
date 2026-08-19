import { createTheme, Theme } from "@mui/material/styles";

export type ThemeId = "dark" | "light";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  mode: "dark" | "light";
  cssVars: Record<string, string>;
  build: () => Theme;
}

const buttonOverrides = (primary: string, primaryText: string) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none" as const,
        fontWeight: 600,
        transition:
          "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
        "&:hover": { transform: "translateY(-1px)" },
        "&:active": { transform: "translateY(0)" },
      },
    },
    variants: [
      {
        props: { variant: "contained" as const, color: "primary" as const },
        style: {
          backgroundColor: primary,
          color: primaryText,
          "&:hover": {
            backgroundColor: primary,
            filter: "brightness(0.9)",
            boxShadow: `0 4px 16px ${primary}44`,
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)", boxShadow: "none" },
        },
      },
      {
        props: { variant: "outlined" as const, color: "primary" as const },
        style: {
          borderColor: primary,
          color: primary,
          "&:hover": {
            backgroundColor: `${primary}12`,
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
      },
    ],
  },
});

// ─── Dark — Charcoal + warm white ────────────────────────────────────────────
// Neutral near-black surface, warm off-white text, no colour cast on accents.

const DARK: ThemeDef = {
  id: "dark",
  label: "Dark",
  mode: "dark",
  cssVars: {
    "--background": "#111111",
    "--surface": "#191919",
    "--elevated": "#222222",
    "--foreground": "#f5f5f5",
    "--muted": "#888888",
    "--accent": "#f5f5f5",
    "--accent-foreground": "#111111",
    "--cream": "#aaaaaa",
  },
  build: () =>
    createTheme({
      palette: {
        mode: "dark",
        primary: { main: "#f5f5f5", contrastText: "#111111" },
        secondary: { main: "#888888" },
        background: { default: "#111111", paper: "#222222" },
        text: { primary: "#f5f5f5", secondary: "#888888" },
        error: { main: "#ff6b6b" },
        success: { main: "#69db7c" },
        divider: "rgba(245,245,245,0.1)",
      },
      shape: { borderRadius: 10 },
      typography: { fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: "#111111",
              backgroundImage:
                "radial-gradient(ellipse 90% 55% at 50% -10%, #2a2a2a 0%, transparent 55%), linear-gradient(180deg, #161616 0%, #111111 45%, #0d0d0d 100%)",
            },
          },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: "rgba(245,245,245,0.04)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(245,245,245,0.15)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(245,245,245,0.45)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#f5f5f5",
              },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: "rgba(245,245,245,0.55)",
              "&.Mui-focused": { color: "#f5f5f5" },
            },
          },
        },
        ...buttonOverrides("#f5f5f5", "#111111"),
      },
    }),
};

// ─── Light — Soft grey + slate ────────────────────────────────────────────────
// Warm off-white background, dark slate text, slate-700 primary.

const LIGHT: ThemeDef = {
  id: "light",
  label: "Light",
  mode: "light",
  cssVars: {
    "--background": "#f7f7f7",
    "--surface": "#ffffff",
    "--elevated": "#ffffff",
    "--foreground": "#1a1a1a",
    "--muted": "#6b7280",
    "--accent": "#334155",
    "--accent-foreground": "#ffffff",
    "--cream": "#475569",
  },
  build: () =>
    createTheme({
      palette: {
        mode: "light",
        primary: { main: "#334155", contrastText: "#ffffff" },
        secondary: { main: "#6b7280" },
        background: { default: "#f7f7f7", paper: "#ffffff" },
        text: { primary: "#1a1a1a", secondary: "#6b7280" },
        error: { main: "#dc2626" },
        success: { main: "#16a34a" },
        divider: "rgba(26,26,26,0.1)",
      },
      shape: { borderRadius: 10 },
      typography: { fontFamily: "var(--font-geist-sans), Arial, sans-serif" },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: "#f7f7f7",
              backgroundImage: "none",
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: "rgba(26,26,26,0.03)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(26,26,26,0.18)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#334155",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#334155",
              },
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: "rgba(26,26,26,0.55)",
              "&.Mui-focused": { color: "#334155" },
            },
          },
        },
        ...buttonOverrides("#334155", "#ffffff"),
      },
    }),
};

export const THEMES: ThemeDef[] = [DARK, LIGHT];
export const DEFAULT_THEME_ID: ThemeId = "dark";

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? DARK;
}
