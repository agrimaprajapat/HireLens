/**
 * Pure text helpers for the extraction pipeline.
 *
 * No IO and no PDF dependencies, so these can be reasoned about and tested in
 * isolation. Extraction (IO) stays in `extract.ts`; shaping the text lives here.
 */

/**
 * Normalize raw per-page text into clean, readable output:
 * - joins pages with a single blank line (a soft page/paragraph boundary),
 * - normalizes line endings,
 * - collapses runs of spaces and tabs to a single space,
 * - trims trailing whitespace on each line,
 * - collapses three-or-more newlines down to one blank line (no duplicated
 *   blank lines), preserving intentional paragraph breaks.
 */
export function normalizeExtractedText(pages: string[]): string {
  return pages
    .map((page) =>
      page
        .replace(/\r\n?/g, "\n") // normalize line endings
        .replace(/[ \t]+/g, " ") // collapse horizontal whitespace
        .replace(/ *\n */g, "\n") // trim spaces around line breaks
        .replace(/\n{3,}/g, "\n\n") // no duplicated blank lines
        .trim()
    )
    .filter((page) => page.length > 0)
    .join("\n\n")
    .trim();
}

/** Word and character counts for already-normalized text. */
export function computeTextStats(text: string): {
  wordCount: number;
  characterCount: number;
} {
  const trimmed = text.trim();
  return {
    wordCount: trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length,
    characterCount: text.length,
  };
}
