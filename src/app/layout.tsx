import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";

import { CreditsProvider } from "@/components/credits/credits-provider";
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
  // Google Analytics (GA4). Only loads when a measurement id is configured, so
  // it's a no-op in local/dev environments that don't set it.
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${fraunces.variable} font-sans`}>
          <CreditsProvider>{children}</CreditsProvider>
        </body>
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      </html>
    </ClerkProvider>
  );
}
