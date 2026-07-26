"use client";

import { useCallback, useMemo, useState } from "react";

/** The job description a user supplies, resolved to a submittable value. */
export type JobDescriptionInputValue =
  | { kind: "text"; value: string }
  | { kind: "file"; value: File };

export type JobDescriptionMode = "paste" | "upload";

export interface JobDescriptionController {
  mode: JobDescriptionMode;
  setMode: (mode: JobDescriptionMode) => void;
  text: string;
  setText: (text: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  /** The current submittable value, or null when nothing is provided. */
  value: JobDescriptionInputValue | null;
  hasValue: boolean;
}

/**
 * Local state for a job-description input (pasted text or an uploaded PDF/DOCX).
 * Shared by the Job Match and Cover Letter sections so the input lives in one
 * place. The paired `<JobDescriptionInput>` renders this controller.
 */
export function useJobDescriptionInput(): JobDescriptionController {
  const [mode, setMode] = useState<JobDescriptionMode>("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const value = useMemo<JobDescriptionInputValue | null>(() => {
    if (mode === "paste") {
      return text.trim().length > 0 ? { kind: "text", value: text } : null;
    }
    return file ? { kind: "file", value: file } : null;
  }, [mode, text, file]);

  const setModeStable = useCallback((next: JobDescriptionMode) => setMode(next), []);

  return {
    mode,
    setMode: setModeStable,
    text,
    setText,
    file,
    setFile,
    value,
    hasValue: value !== null,
  };
}
