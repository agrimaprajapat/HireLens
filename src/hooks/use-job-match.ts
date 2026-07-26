"use client";

import { useCallback, useRef, useState } from "react";

import type { JobMatch, JobMatchResult } from "@/lib/ai/job-match-schema";
import type { AnalysisFlowError } from "@/hooks/use-resume-analysis";
import type { JobDescriptionInputValue } from "@/hooks/use-job-description-input";

/** Lifecycle of a job-match request. */
export type JobMatchStatus = "idle" | "matching" | "success" | "error";

/** The job description supplied by the user. */
export type JobDescriptionInput = JobDescriptionInputValue;

const MATCH_ENDPOINT = "/api/job-match";

const NETWORK_ERROR: AnalysisFlowError = {
  code: "network_error",
  message:
    "We couldn't reach the server. Please check your connection and try again.",
};

/**
 * Drives the job-match request lifecycle and holds its result.
 *
 * Sends the resume file plus the job description (pasted text or PDF/DOCX) to
 * `/api/job-match`. All extraction and the AI call happen server-side. Guards
 * against duplicate submissions and ignores stale responses.
 */
export function useJobMatch() {
  const [status, setStatus] = useState<JobMatchStatus>("idle");
  const [result, setResult] = useState<JobMatch | null>(null);
  const [error, setError] = useState<AnalysisFlowError | null>(null);

  const inFlight = useRef(false);
  const requestId = useRef(0);

  const match = useCallback(
    async (resume: File, job: JobDescriptionInput) => {
      if (inFlight.current) return; // prevent duplicate submissions
      inFlight.current = true;
      const currentRequest = ++requestId.current;
      const isStale = () => currentRequest !== requestId.current;

      setStatus("matching");
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

        const response = await fetch(MATCH_ENDPOINT, {
          method: "POST",
          body: form,
        });
        const payload = (await response.json()) as JobMatchResult;
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
    match,
    reset,
    isMatching: status === "matching",
  };
}
