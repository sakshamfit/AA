import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#070709"};

export const metadata: Metadata = {
  title: "Allu Arjun — Beyond the Frame",
  description: "A cinematic journey through the world of Allu Arjun. Discover RAAKA, iconic films, and the AA signature. An independent fan tribute.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
