"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFFFFF",
      light: "#FFFFFF",
      dark: "#F0F0F0",
      contrastText: "#111111",
    },
    secondary: {
      main: "#B8B3AA",
    },
    background: {
      default: "#111111",
      paper: "#1A1A1A",
    },
    text: {
      primary: "#FAFAFA",
      secondary: "#B8B3AA",
    },
    error: {
      main: "#C9B8A6",
    },
    divider: "rgba(250, 250, 250, 0.12)",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  },
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            backgroundColor: "#FFFFFF",
            color: "#111111",
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
          },
        },
        {
          props: { variant: "outlined", color: "primary" },
          style: {
            borderColor: "#FFFFFF",
            color: "#FFFFFF",
            "&:hover": {
              borderColor: "#FFFFFF",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          },
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(250, 250, 250, 0.04)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(250, 250, 250, 0.15)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#FFFFFF",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(250, 250, 250, 0.7)",
          "&.Mui-focused": {
            color: "#FFFFFF",
          },
        },
      },
    },
  },
});

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
