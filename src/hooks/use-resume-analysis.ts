"use client";

import { useCallback, useRef, useState } from "react";

import type { AnalyseResult, ResumeAnalysis } from "@/lib/ai/schema";
import type { ExtractionResult } from "@/lib/pdf/types";

/** Lifecycle of a resume analysis request. */
export type AnalysisStatus = "idle" | "analysing" | "success" | "error";

/** A structured, user-facing error from either pipeline step. */
export interface AnalysisFlowError {
  code: string;
  message: string;
}

const EXTRACT_ENDPOINT = "/api/resume/extract";
const ANALYSE_ENDPOINT = "/api/resume/analyse";

const NETWORK_ERROR: AnalysisFlowError = {
  code: "network_error",
  message:
    "We couldn't reach the server. Please check your connection and try again.",
};

/**
 * Drives the two-step analysis flow and holds its result.
 *
 * Step 1 extracts text (`/api/resume/extract`), step 2 analyses it with Azure
 * OpenAI (`/api/resume/analyse`). Both run server-side; this hook only
 * orchestrates. It guards against duplicate submissions and ignores stale
 * responses if a newer request has started.
 */
export function useResumeAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<AnalysisFlowError | null>(null);

  const inFlight = useRef(false);
  const requestId = useRef(0);

  const analyse = useCallback(async (file: File) => {
    if (inFlight.current) return; // prevent duplicate submissions
    inFlight.current = true;
    const currentRequest = ++requestId.current;
    const isStale = () => currentRequest !== requestId.current;

    setStatus("analysing");
    setError(null);
    setResult(null);

    try {
      // Step 1 — extract text from the PDF.
      const form = new FormData();
      form.append("file", file);
      const extractRes = await fetch(EXTRACT_ENDPOINT, {
        method: "POST",
        body: form,
      });
      const extraction = (await extractRes.json()) as ExtractionResult;
      if (isStale()) return;
      if (!extraction.ok) {
        setError(extraction.error);
        setStatus("error");
        return;
      }

      // Step 2 — analyse the extracted text with Azure OpenAI.
      const analyseRes = await fetch(ANALYSE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: extraction.data.extractedText }),
      });
      const analysis = (await analyseRes.json()) as AnalyseResult;
      if (isStale()) return;
      if (!analysis.ok) {
        setError(analysis.error);
        setStatus("error");
        return;
      }

      setResult(analysis.data);
      setStatus("success");
    } catch {
      if (isStale()) return;
      setError(NETWORK_ERROR);
      setStatus("error");
    } finally {
      if (!isStale()) inFlight.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1; // invalidate any in-flight response
    inFlight.current = false;
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    analyse,
    reset,
    isAnalysing: status === "analysing",
  };
}
