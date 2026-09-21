import type { Metadata } from "next";
import "./globals.css";
import { getServerTranslations } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Luxe Estate — Premium Real Estate & Sanctuary Homes",
  description: "Curated luxury properties, villas, penthouses, and sanctuary homes for the discerning eye.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dictionary } = await getServerTranslations();

  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background-light text-nordic-dark selection:bg-mosque selection:text-white">
        <LanguageProvider initialLocale={locale} initialDictionary={dictionary}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
