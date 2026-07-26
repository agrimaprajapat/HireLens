"use client";

import { useEffect } from "react";

import { CoverLetterSection } from "@/components/sections/cover-letter-section";
import { JobMatchSection } from "@/components/sections/job-match-section";
import { ResultsSection } from "@/components/sections/results-section";
import { UploadCard } from "@/components/sections/upload-card";
import { useCredits, useGenerationGate } from "@/components/credits/credits-provider";
import { useCoverLetter } from "@/hooks/use-cover-letter";
import { useJobMatch } from "@/hooks/use-job-match";
import { useResumeAnalysis } from "@/hooks/use-resume-analysis";
import { useResumeUpload } from "@/hooks/use-resume-upload";

/**
 * Client container that connects the upload, results, and job-match sections.
 *
 * It owns the shared state — the selected file (`useResumeUpload`), the
 * extraction/analysis lifecycle (`useResumeAnalysis`), and the job-match
 * lifecycle (`useJobMatch`) — and passes it down, keeping the sections
 * presentational. Selecting or removing a file clears any prior results.
 */
function ResumeWorkspace() {
  const upload = useResumeUpload();
  const analysis = useResumeAnalysis();
  const jobMatch = useJobMatch();
  const coverLetter = useCoverLetter();
  const gate = useGenerationGate();
  const { refresh: refreshCredits } = useCredits();

  const { file } = upload;
  const resetAnalysis = analysis.reset;
  const resetJobMatch = jobMatch.reset;
  const resetCoverLetter = coverLetter.reset;

  // A change in the selected file invalidates any previous results.
  useEffect(() => {
    resetAnalysis();
    resetJobMatch();
    resetCoverLetter();
  }, [file, resetAnalysis, resetJobMatch, resetCoverLetter]);

  // A successful generation deducts a credit server-side; refresh the balance.
  const analysisStatus = analysis.status;
  const jobMatchStatus = jobMatch.status;
  const coverLetterStatus = coverLetter.status;
  useEffect(() => {
    if (
      analysisStatus === "success" ||
      jobMatchStatus === "success" ||
      coverLetterStatus === "success"
    ) {
      refreshCredits();
    }
  }, [analysisStatus, jobMatchStatus, coverLetterStatus, refreshCredits]);

  const handleAnalyse = () => {
    if (upload.file) analysis.analyse(upload.file);
  };

  const isReady = upload.status === "ready" && upload.file !== null;

  return (
    <>
      <UploadCard
        upload={upload}
        onAnalyse={handleAnalyse}
        isAnalysing={analysis.isAnalysing}
        gate={gate}
      />
      <ResultsSection
        status={analysis.status}
        result={analysis.result}
        error={analysis.error}
        resumeName={upload.file?.name ?? ""}
      />
      <JobMatchSection
        resumeFile={upload.file}
        resumeReady={isReady}
        jobMatch={jobMatch}
        gate={gate}
      />
      <CoverLetterSection
        resumeFile={upload.file}
        resumeReady={isReady}
        coverLetter={coverLetter}
        gate={gate}
      />
    </>
  );
}

export { ResumeWorkspace };
