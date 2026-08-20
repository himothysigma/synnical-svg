import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Synnical OS",
  description: "Synnical Operating System - Your Digital Universe",
  keywords: ["Synnical", "OS", "Web OS", "Desktop", "Gaming", "Streaming"],
  authors: [{ name: "Synnical" }],
  icons: {
    icon: "/synnical-logo.svg",
    apple: "/synnical-logo.svg",
  },
  openGraph: {
    title: "Synnical OS",
    description: "Your Digital Universe - Synnical Operating System",
    siteName: "Synnical",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground overflow-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
