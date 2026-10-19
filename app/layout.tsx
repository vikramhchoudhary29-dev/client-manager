import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arvik Digital | Client Manager",
  description: "Premium client, project, payment and maintenance management for Arvik Digital"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}