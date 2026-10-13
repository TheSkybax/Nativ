import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nativ",
  description: "A healthy social platform built around community, privacy, and intentional connection."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
