import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

/** Skeleton shown while the dashboard data loads. */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="py-14">
          <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-5 w-80 animate-pulse rounded-md bg-muted" />

          <div className="mt-12 space-y-14">
            {[0, 1].map((section) => (
              <div key={section}>
                <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((card) => (
                    <div
                      key={card}
                      className="h-40 animate-pulse rounded-xl border border-border bg-muted/40"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
