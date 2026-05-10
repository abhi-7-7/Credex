import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AI Spend Audit — Find out how much you're overpaying",
    template: "%s | Credex Audit",
  },
  description:
    "Free audit tool for startups. Enter your AI tool subscriptions and get a personalised savings report in 60 seconds.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "AI Spend Audit",
    description: "See how much your startup is overpaying on AI tools.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
