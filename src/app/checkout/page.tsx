import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";

import { CheckoutLauncher } from "@/components/billing/checkout-launcher";
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
  const paidPlan = isPaidPlanId(plan) ? plan : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-xl py-20">
          <Card className="items-center gap-5 p-10 text-center">
            {paidPlan ? (
              <CheckoutLauncher
                planId={paidPlan}
                planLabel={PAID_PLAN_LABELS[paidPlan]}
              />
            ) : (
              <>
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <CircleAlert className="size-6" />
                </span>
                <div>
                  <h1 className="font-display text-2xl font-medium tracking-tight">
                    Choose a plan
                  </h1>
                  <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    We couldn&rsquo;t find that plan. Head back to pricing to pick
                    one.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    <ArrowLeft className="size-4" />
                    Back to pricing
                  </Link>
                </Button>
              </>
            )}
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
