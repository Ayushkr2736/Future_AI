import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Oracle AI — Interview Intelligence Platform",
  description:
    "AI-powered interview analysis with real-time confidence scoring, voice analysis, and face emotion detection. Elevate your interview preparation.",
  keywords: [
    "AI interview",
    "confidence analysis",
    "voice analysis",
    "face detection",
    "interview preparation",
  ],
  openGraph: {
    title: "Oracle AI — Interview Intelligence Platform",
    description:
      "AI-powered interview analysis with real-time confidence scoring.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
