import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/AuthContext";
import ThemeRegistry from "@/components/ThemeRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polyglot",
  description: "Manage your content in multiple languages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col font-sans bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeRegistry>
          <AuthProvider>
            <div className="flex-1 flex flex-col">{children}</div>
            <footer className="px-8 py-6 text-center">
              <p className="text-sm text-muted">
                &copy; {new Date().getFullYear()} Polyglot. All rights reserved.
              </p>
            </footer>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
