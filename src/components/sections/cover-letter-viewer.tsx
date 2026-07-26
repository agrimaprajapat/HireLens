"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Info,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CoverLetter } from "@/lib/ai/cover-letter-schema";
import {
  copyToClipboard,
  downloadPdf,
  downloadTxt,
} from "@/lib/cover-letter/export";

interface CoverLetterViewerProps {
  coverLetter: CoverLetter;
  /** Omit to hide the Regenerate action (e.g. when viewing a saved letter). */
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

/**
 * Displays a generated cover letter with word count, the strengths it drew on,
 * any honesty warnings, and export actions (copy, TXT, PDF) plus regenerate.
 */
function CoverLetterViewer({
  coverLetter,
  onRegenerate,
  canRegenerate,
}: CoverLetterViewerProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const toneLabel =
    coverLetter.tone.charAt(0).toUpperCase() + coverLetter.tone.slice(1);

  const handleCopy = async () => {
    const ok = await copyToClipboard(coverLetter.coverLetter);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePdf = async () => {
    setDownloadingPdf(true);
    try {
      await downloadPdf(coverLetter.coverLetter);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Card className="animate-fade-up gap-6 p-6 sm:p-8">
      {/* Header + meta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand">
            <FileText className="size-4.5" />
          </span>
          <h3 className="font-display text-xl font-medium tracking-tight">
            Your cover letter
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">{coverLetter.wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>{toneLabel} tone</span>
        </div>
      </div>

      {/* Letter body */}
      <div className="rounded-lg border border-border bg-secondary/30 p-5">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {coverLetter.coverLetter}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="size-4 text-brand" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadTxt(coverLetter.coverLetter)}
        >
          <Download className="size-4" />
          Download TXT
        </Button>
        <Button variant="outline" onClick={handlePdf} disabled={downloadingPdf}>
          <Download className="size-4" />
          {downloadingPdf ? "Preparing…" : "Download PDF"}
        </Button>
        {onRegenerate && (
          <Button onClick={onRegenerate} disabled={!canRegenerate}>
            <RefreshCw className="size-4" />
            Regenerate
          </Button>
        )}
      </div>

      {/* Strengths used */}
      {coverLetter.keyStrengthsUsed.length > 0 && (
        <div>
          <span className="eyebrow">Strengths Used</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {coverLetter.keyStrengthsUsed.map((strength) => (
              <Badge key={strength} withDot>
                {strength}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Honesty warnings */}
      {coverLetter.warnings.length > 0 && (
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Info className="size-4 text-muted-foreground" />
            A note on honesty
          </span>
          <ul className="mt-2 space-y-1.5">
            {coverLetter.warnings.map((warning, index) => (
              <li key={index} className="text-sm leading-relaxed text-muted-foreground">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export { CoverLetterViewer };
