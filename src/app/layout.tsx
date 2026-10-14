import type { Metadata } from "next";
import { PostMutationsProvider } from "@/components/post-mutations-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nativ",
  description: "A healthy social platform built around community, privacy, and intentional connection."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PostMutationsProvider>{children}</PostMutationsProvider>
      </body>
    </html>
  );
}
