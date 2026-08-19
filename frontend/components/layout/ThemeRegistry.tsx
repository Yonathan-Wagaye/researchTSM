"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { ThemeContextProvider, useTheme } from "@/hooks/ThemeContext";
import { getTheme } from "@/lib/themes";

function InnerRegistry({ children }: { children: React.ReactNode }) {
  const { themeId } = useTheme();
  const theme = getTheme(themeId).build();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContextProvider>
      <InnerRegistry>{children}</InnerRegistry>
    </ThemeContextProvider>
  );
}
