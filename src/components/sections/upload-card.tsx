"use client";

import { Check, FileText, Loader2, ScanLine, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import type { useResumeUpload } from "@/hooks/use-resume-upload";
import { RESUME_UPLOAD } from "@/lib/constants";
import { formatFileSize } from "@/lib/resume";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  /** Upload state machine, owned by the parent workspace. */
  upload: ReturnType<typeof useResumeUpload>;
  /** Trigger extraction for the currently selected file. */
  onAnalyse: () => void;
  /** Whether an extraction request is currently in flight. */
  isAnalysing: boolean;
}

/**
 * Drag-and-drop upload experience (presentation only).
 *
 * All selection/validation/"reading" state lives in `useResumeUpload`, and the
 * extraction request is owned by the parent workspace. This component renders
 * that state and forwards intent — it never touches parsing or the network.
 */
function UploadCard({ upload, onAnalyse, isAnalysing }: UploadCardProps) {
  const {
    inputRef,
    file,
    status,
    error,
    isDragging,
    openFilePicker,
    removeFile,
    handleInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  } = upload;

  const isReading = status === "reading";
  const isReady = status === "ready" && file;
  const isBusy = isReading || isAnalysing;

  const openPicker = () => {
    if (!isBusy) openFilePicker();
  };

  return (
    <section id="upload" className="scroll-mt-24 py-16 sm:py-20">
      <Container className="max-w-3xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="eyebrow">Upload</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Drop in your resume
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Add your resume as a PDF and HireLens takes it from there.
          </p>
        </div>

        <Card className="p-2">
          {/* Dropzone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a PDF resume by dragging a file here or pressing Enter to browse"
            aria-busy={isBusy}
            aria-disabled={isBusy}
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPicker();
              }
            }}
            onDragOver={(event) => {
              if (isBusy) return;
              handleDragOver(event);
            }}
            onDragLeave={handleDragLeave}
            onDrop={(event) => {
              if (isBusy) {
                event.preventDefault();
                return;
              }
              handleDrop(event);
            }}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-lg border border-dashed px-6 py-14 text-center outline-none transition-colors duration-200",
              "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/50",
              isDragging
                ? "border-brand bg-brand-muted/50"
                : "border-input hover:border-foreground/25 hover:bg-secondary/50",
              isBusy && "cursor-progress"
            )}
          >
            {/* Scan-line sweep during the reading state */}
            {isReading && (
              <span
                aria-hidden="true"
                className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent"
              />
            )}

            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-xl border transition-all duration-300",
                isDragging
                  ? "scale-105 border-brand/30 bg-brand text-brand-foreground"
                  : "border-border bg-secondary text-foreground group-hover:border-foreground/20"
              )}
            >
              {isReading ? (
                <Loader2 className="size-6 animate-spin text-brand" />
              ) : (
                <ScanLine className="size-6" />
              )}
            </span>

            <div className="space-y-1">
              <p className="font-medium">
                {isReading ? (
                  "Reading your resume…"
                ) : (
                  <>
                    <span className="text-brand">Click to upload</span> or drag
                    and drop
                  </>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {isReading
                  ? "Just a moment"
                  : `PDF only, up to ${RESUME_UPLOAD.maxSizeMb}MB`}
              </p>
            </div>

            {!isReading && (
              <Badge variant="default" className="text-[0.6875rem]">
                PDF
              </Badge>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={RESUME_UPLOAD.acceptedMimeType}
              className="sr-only"
              onChange={handleInputChange}
            />
          </div>

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="mt-3 px-2 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}

          {/* Selected file — the ready state */}
          {isReady && (
            <div className="animate-fade-up mt-3 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3 text-brand" />
                  {formatFileSize(file.size)} · ready to review
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                disabled={isAnalysing}
                aria-label="Remove selected file"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            className="sm:flex-1"
            onClick={openPicker}
            disabled={isBusy}
          >
            <ScanLine className="size-4" />
            {isReady ? "Choose a different file" : "Browse files"}
          </Button>
          <Button
            size="lg"
            className="sm:flex-1"
            onClick={onAnalyse}
            disabled={!isReady || isBusy}
          >
            {isAnalysing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Analyse Resume
              </>
            )}
          </Button>
        </div>
      </Container>
    </section>
  );
}

export { UploadCard };
