import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Optical serif used for display headlines — the handcrafted, editorial voice. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "HireLens — See Your Resume Through a Recruiter's Lens",
  description:
    "HireLens reviews your resume the way a recruiter would — scoring content, checking ATS compatibility, and showing exactly what to refine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${fraunces.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
