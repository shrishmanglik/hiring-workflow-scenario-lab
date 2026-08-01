import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Hiring Workflow Scenario Lab",
  description: "Read-only deterministic simulation for hiring workflow change decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
