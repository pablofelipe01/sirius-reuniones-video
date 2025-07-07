import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@livekit/components-styles";
import { cn } from "@/lib/utils";
import { ClientBackground } from "@/components/layout/ClientBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sirius Regenerative - Video Conferencing Platform",
  description: "Advanced video conferencing platform with futuristic design and AI-powered features",
  keywords: ["video conferencing", "AI", "meetings", "transcription", "sirius regenerative"],
  authors: [{ name: "Sirius Regenerative Team" }],
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E90FF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900")}>
        <div className="relative min-h-screen">
          <ClientBackground />
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
