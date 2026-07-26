"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { validateResumeFile } from "@/lib/resume";

/** Phases of the upload interaction. */
export type UploadStatus = "idle" | "reading" | "ready" | "error";

/** Delay before revealing the ready state — a considered "reading" affordance. */
const READING_DELAY_MS = 900;

/**
 * Owns the resume-upload state machine: selection, validation, the brief
 * "reading" transition, drag state, and cleanup. Kept separate from the view so
 * the component stays presentational and this stays the single seam where a
 * later phase can wire an actual analysis request.
 */
export function useResumeUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const selectFile = useCallback((selected: File | undefined) => {
    setError(null);

    if (!selected) return;

    const result = validateResumeFile(selected);
    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }

    setStatus("reading");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFile(selected);
      setStatus("ready");
    }, READING_DELAY_MS);
  }, []);

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  const removeFile = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFile(null);
    setStatus("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      selectFile(event.target.files?.[0]);
    },
    [selectFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(false);
      selectFile(event.dataTransfer.files?.[0]);
    },
    [selectFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  return {
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
  };
}
