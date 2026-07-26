import Link from "next/link";
import { redirect } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { LensMark } from "@/components/layout/logo";
import { Navbar } from "@/components/layout/navbar";
import { SavedItemCard } from "@/components/dashboard/saved-item-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getDbUser } from "@/lib/auth";
import { listSaved } from "@/lib/saved/service";
import type { SavedItemSummary, SavedType } from "@/lib/saved/types";

export const metadata = {
  title: "Dashboard — HireLens",
};

/** A dashboard section with its cards, or a quiet empty state. */
function DashboardSection({
  title,
  type,
  items,
}: {
  title: string;
  type: SavedType;
  items: SavedItemSummary[];
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-medium tracking-tight">
          {title}
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing saved here yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <SavedItemCard key={item.id} type={type} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) redirect("/sign-in");

  const [analyses, jobMatches, coverLetters] = await Promise.all([
    listSaved(user.id, "resume-analysis"),
    listSaved(user.id, "job-match"),
    listSaved(user.id, "cover-letter"),
  ]);

  const total = analyses.length + jobMatches.length + coverLetters.length;
  const firstName = user.name?.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="py-14">
          <header>
            <span className="eyebrow">Dashboard</span>
            <h1 className="font-display mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              {firstName ? `Welcome back, ${firstName}` : "Your workspace"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your saved resume analyses, job matches, and cover letters.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-sm font-medium tabular-nums text-muted-foreground">
                {user.credits} {user.credits === 1 ? "credit" : "credits"}{" "}
                remaining
              </span>
              {user.credits === 0 && (
                <Button size="sm" asChild>
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              )}
            </div>
          </header>

          {total === 0 ? (
            <div className="mt-12 rounded-xl border border-border bg-secondary/30 p-10 text-center">
              <LensMark className="mx-auto size-10" />
              <h2 className="font-display mt-4 text-xl font-medium tracking-tight">
                Nothing saved yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Analyse a resume, match it to a job, or generate a cover letter —
                then save it here to build your personal career workspace.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/#upload">Analyse a resume</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-12 space-y-14">
              <DashboardSection
                title="Recent Resume Analyses"
                type="resume-analysis"
                items={analyses}
              />
              <DashboardSection
                title="Recent Job Matches"
                type="job-match"
                items={jobMatches}
              />
              <DashboardSection
                title="Recent Cover Letters"
                type="cover-letter"
                items={coverLetters}
              />
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
