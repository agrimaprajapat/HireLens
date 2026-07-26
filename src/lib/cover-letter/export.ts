/**
 * Client-side export helpers for the generated cover letter.
 *
 * Kept framework-free so the viewer stays presentational. The PDF library is
 * imported dynamically so it only loads when a user actually downloads a PDF.
 */

/** Trigger a browser download of a Blob under the given filename. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Download the cover letter as a plain-text file. */
export function downloadTxt(text: string, filename = "cover-letter.txt"): void {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

/**
 * Download the cover letter as a PDF, preserving paragraph structure with
 * wrapped lines, margins, and consistent line spacing across pages.
 */
export async function downloadPdf(
  text: string,
  filename = "cover-letter.pdf"
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 64;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  const paragraphGap = 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = margin;
  const paragraphs = text.replace(/\r\n?/g, "\n").split(/\n{2,}/);

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph.trim(), maxWidth) as string[];
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += paragraphGap;
  }

  doc.save(filename);
}

/** Copy text to the clipboard; resolves to whether it succeeded. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
