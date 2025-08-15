// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css"; // Ant Design reset
import StoreProvider from "@/lib/StoreProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { SharedThemeProvider } from "@/contexts/ThemeContext"; // Add this

// Geist font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Kanban Board",
  description: "A modern kanban board application",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${inter.variable} antialiased`}>
        <StoreProvider>
          <I18nProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              storageKey="kanban-theme"
              disableTransitionOnChange={false}
            >
              <SharedThemeProvider>
                {children}
              </SharedThemeProvider>
            </ThemeProvider>
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}