import type { Metadata } from "next";

import { LEGAL } from "@/lib/legal/config";

/**
 * Build page metadata for a legal page, mirroring the project's existing
 * `title` convention ("<Page> — HireLens") and adding a description plus
 * lightweight Open Graph tags. No images/URLs are set, so this needs no
 * `metadataBase` and produces no build warnings.
 */
export function legalMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  const fullTitle = `${title} — ${LEGAL.company}`;
  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      siteName: LEGAL.company,
    },
  };
}
