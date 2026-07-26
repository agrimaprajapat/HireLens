import Link from "next/link";
import { Check } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Pricing — HireLens",
};

interface Plan {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: { label: string; href?: string };
  comingSoon?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    priceNote: "to start",
    description: "Everything a student needs to sharpen their first applications.",
    features: [
      "3 AI credits",
      "Resume analysis",
      "Job match analysis",
      "Cover letter generation",
      "Save results to your dashboard",
    ],
    cta: { label: "Get started", href: "/sign-up" },
  },
  {
    name: "Pro",
    price: "$—",
    priceNote: "coming soon",
    description: "For applicants going all-in on their search.",
    features: [
      "Unlimited AI generations",
      "Priority processing",
      "Future premium features",
    ],
    cta: { label: "Coming soon" },
    comingSoon: true,
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        "gap-6 p-8",
        plan.comingSoon && "border-dashed bg-secondary/30"
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-medium tracking-tight">
            {plan.name}
          </h2>
          {plan.comingSoon && <Badge>Coming soon</Badge>}
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-medium tracking-tight">
            {plan.price}
          </span>
          <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
      </div>

      <ul className="space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" />
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>

      {plan.comingSoon || !plan.cta.href ? (
        <Button variant="outline" disabled className="w-full">
          {plan.cta.label}
        </Button>
      ) : (
        <Button asChild className="w-full">
          <Link href={plan.cta.href}>{plan.cta.label}</Link>
        </Button>
      )}
    </Card>
  );
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-4xl py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Pricing</span>
            <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              Start free, upgrade when you&rsquo;re ready
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
              Every account starts with 3 free AI credits. Paid plans are on the
              way.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
