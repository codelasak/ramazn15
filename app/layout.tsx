import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const isMobile = process.env.BUILD_TARGET === "mobile";

export const metadata: Metadata = {
  title: isMobile ? "Pano15" : "15 Temmuz AİHL",
  description: isMobile
    ? "Pano15 — Okulun cebinde"
    : "Bahçelievler 15 Temmuz Şehitleri AİHL Öğrenci Uygulaması — Geleceğe Adım At",
  applicationName: isMobile ? "Pano15" : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#1A2F23" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexend.variable} font-display antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
