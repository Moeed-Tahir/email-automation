"use client"

import { useEmailMonitoring } from "@/hooks/useEmailMonitoring";
import { useZeffyMonitoring } from "@/hooks/useZeffyMonitoring";

import "./globals.css";

export default function RootLayout({ children }) {
  useEmailMonitoring();
  useZeffyMonitoring();
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {children}
      </body>
    </html>
  );
}