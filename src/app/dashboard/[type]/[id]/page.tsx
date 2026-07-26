import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AnalysisReport } from "@/components/sections/analysis-report";
import { CoverLetterViewer } from "@/components/sections/cover-letter-viewer";
import { JobMatchReport } from "@/components/sections/job-match-report";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import type { CoverLetter } from "@/lib/ai/cover-letter-schema";
import type { JobMatch } from "@/lib/ai/job-match-schema";
import type { ResumeAnalysis } from "@/lib/ai/schema";
import { getDbUser } from "@/lib/auth";
import { getSaved } from "@/lib/saved/service";
import { isSavedType, SAVED_TYPE_LABELS } from "@/lib/saved/types";

export default async function SavedItemPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!isSavedType(type)) notFound();

  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const item = await getSaved(user.id, type, id);
  if (!item) notFound();

  let report: React.ReactNode;
  if (type === "resume-analysis") {
    report = <AnalysisReport analysis={item.payload as ResumeAnalysis} />;
  } else if (type === "job-match") {
    report = <JobMatchReport match={item.payload as JobMatch} />;
  } else {
    report = <CoverLetterViewer coverLetter={item.payload as CoverLetter} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-3xl py-14">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>

          <div className="mt-6 mb-8">
            <span className="eyebrow">{SAVED_TYPE_LABELS[type]}</span>
            <h1 className="font-display mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
              {item.title}
            </h1>
            {item.resumeName && (
              <p className="mt-2 text-sm text-muted-foreground">
                From {item.resumeName}
              </p>
            )}
          </div>

          {report}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
