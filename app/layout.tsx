import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client & Project Manager",
  description: "Simple client, project, payment and marketing management"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}