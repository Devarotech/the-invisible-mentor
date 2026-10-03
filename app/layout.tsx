import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Invisible Mentor",
  description: "Your personal AI study mentor for WAEC, NECO and JAMB.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}