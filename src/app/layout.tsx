import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui";
import { Web3Provider, SessionProvider, QueryProvider } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "V2K - Invest in Music Royalties",
  description: "The stock market for music. Buy tokens of songs, earn monthly royalties, trade 24/7.",
  keywords: ["music", "investment", "royalties", "tokens", "blockchain", "trading"],
  manifest: "/manifest.json",
  themeColor: "#00D9FF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "V2K Music",
  },
  openGraph: {
    title: "V2K - Invest in Music Royalties",
    description: "The stock market for music. Buy tokens of songs, earn monthly royalties, trade 24/7.",
    type: "website",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} antialiased min-h-screen bg-bg-primary text-text-primary`}
      >
        <SessionProvider>
          <QueryProvider>
            <Web3Provider>
              {children}
              <Toaster />
            </Web3Provider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
