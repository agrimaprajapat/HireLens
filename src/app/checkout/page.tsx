import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { isPaidPlanId, PAID_PLAN_LABELS } from "@/lib/plans";

export const metadata = {
  title: "Checkout — HireLens",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planLabel = isPaidPlanId(plan) ? PAID_PLAN_LABELS[plan] : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-xl py-20">
          <Card className="items-center gap-5 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
              <Clock className="size-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-medium tracking-tight">
                Checkout is coming soon
              </h1>
              <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                {planLabel
                  ? `Payments for ${planLabel} aren't live yet — they're arriving in the next update. Thanks for your interest!`
                  : "Payments aren't live yet — they're arriving in the next update."}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                <ArrowLeft className="size-4" />
                Back to pricing
              </Link>
            </Button>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
