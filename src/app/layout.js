"use client" // This MUST be the very first line in the file

import { useEmailMonitoring } from "@/hooks/useEmailMonitoring";
import "./globals.css";

export default function RootLayout({ children }) {
  useEmailMonitoring();
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        {children}
      </body>
    </html>
  );
}