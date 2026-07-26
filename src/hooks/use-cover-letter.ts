"use client";

import { useCallback, useRef, useState } from "react";

import type {
  CoverLetter,
  CoverLetterResult,
  CoverLetterTone,
} from "@/lib/ai/cover-letter-schema";
import type { AnalysisFlowError } from "@/hooks/use-resume-analysis";
import type { JobDescriptionInputValue } from "@/hooks/use-job-description-input";

/** Lifecycle of a cover-letter request. */
export type CoverLetterStatus = "idle" | "generating" | "success" | "error";

/** Optional personalization fields. */
export interface CoverLetterOptions {
  tone: CoverLetterTone;
  hiringManagerName?: string;
  companyName?: string;
  additionalNotes?: string;
}

const COVER_LETTER_ENDPOINT = "/api/cover-letter";

const NETWORK_ERROR: AnalysisFlowError = {
  code: "network_error",
  message:
    "We couldn't reach the server. Please check your connection and try again.",
};

/**
 * Drives cover-letter generation and holds the result.
 *
 * Sends the resume file, job description (text or PDF/DOCX), tone, and optional
 * fields to `/api/cover-letter`. Extraction and the AI call happen server-side.
 * Guards duplicate submissions and ignores stale responses.
 */
export function useCoverLetter() {
  const [status, setStatus] = useState<CoverLetterStatus>("idle");
  const [result, setResult] = useState<CoverLetter | null>(null);
  const [error, setError] = useState<AnalysisFlowError | null>(null);

  const inFlight = useRef(false);
  const requestId = useRef(0);

  const generate = useCallback(
    async (
      resume: File,
      job: JobDescriptionInputValue,
      options: CoverLetterOptions
    ) => {
      if (inFlight.current) return; // prevent duplicate submissions
      inFlight.current = true;
      const currentRequest = ++requestId.current;
      const isStale = () => currentRequest !== requestId.current;

      setStatus("generating");
      setError(null);
      setResult(null);

      try {
        const form = new FormData();
        form.append("resume", resume);
        if (job.kind === "text") {
          form.append("jobDescriptionText", job.value);
        } else {
          form.append("jobDescriptionFile", job.value);
        }
        form.append("tone", options.tone);
        if (options.hiringManagerName) {
          form.append("hiringManagerName", options.hiringManagerName);
        }
        if (options.companyName) {
          form.append("companyName", options.companyName);
        }
        if (options.additionalNotes) {
          form.append("additionalNotes", options.additionalNotes);
        }

        const response = await fetch(COVER_LETTER_ENDPOINT, {
          method: "POST",
          body: form,
        });
        const payload = (await response.json()) as CoverLetterResult;
        if (isStale()) return;

        if (payload.ok) {
          setResult(payload.data);
          setStatus("success");
        } else {
          setError(payload.error);
          setStatus("error");
        }
      } catch {
        if (isStale()) return;
        setError(NETWORK_ERROR);
        setStatus("error");
      } finally {
        if (!isStale()) inFlight.current = false;
      }
    },
    []
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    inFlight.current = false;
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    generate,
    reset,
    isGenerating: status === "generating",
  };
}
