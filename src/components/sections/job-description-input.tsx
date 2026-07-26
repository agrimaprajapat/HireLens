"use client";

import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { JobDescriptionController } from "@/hooks/use-job-description-input";
import { JOB_DESCRIPTION_UPLOAD } from "@/lib/constants";
import { formatFileSize } from "@/lib/resume";
import { cn } from "@/lib/utils";

interface JobDescriptionInputProps {
  controller: JobDescriptionController;
  disabled?: boolean;
}

/**
 * Reusable job-description input: a paste/upload toggle with a textarea or a
 * PDF/DOCX file picker. Purely presentational — state lives in the controller
 * from `useJobDescriptionInput`. Shared by the Job Match and Cover Letter flows.
 */
function JobDescriptionInput({
  controller,
  disabled = false,
}: JobDescriptionInputProps) {
  const { mode, setMode, text, setText, file, setFile } = controller;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="inline-flex w-fit rounded-lg border border-border bg-secondary/50 p-1">
        {(["paste", "upload"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            disabled={disabled}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              mode === value
                ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {value === "paste" ? "Paste text" : "Upload file"}
          </button>
        ))}
      </div>

      {/* Input */}
      {mode === "paste" ? (
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={disabled}
          placeholder="Paste the full job description here…"
          aria-label="Job description text"
        />
      ) : (
        <div>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="size-4" />
            {file ? "Choose a different file" : "Choose PDF or DOCX"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={JOB_DESCRIPTION_UPLOAD.acceptAttribute}
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />

          {file && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={disabled}
                aria-label="Remove job description file"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { JobDescriptionInput };
