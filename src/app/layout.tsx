import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CableGuard AI - Underwater Cable Monitoring Dashboard",
  description: "Advanced AI-powered monitoring system for underwater cable networks featuring real-time anomaly detection, intelligent alerting, and interactive visualization.",
  keywords: "underwater cables, monitoring, AI, anomaly detection, dashboard, CableGuard",
  authors: [{ name: "CableGuard AI Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body
        className={`${inter.className} antialiased bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen text-white overflow-x-hidden`}
      >
        <div className="relative min-h-screen">
          {/* Background Effects */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/20 to-slate-900 pointer-events-none" />
          <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none" />
          
          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
