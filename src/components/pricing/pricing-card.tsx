import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  /** Ribbon badge at the top of the card, e.g. "⭐ Most Popular". */
  badge?: string;
  /** Small badge above the price, e.g. "Early Adopter Pricing". */
  priceBadge?: string;
  price: string;
  /** Cadence beside the price, e.g. "/month" or "Every 3 months". */
  priceSuffix?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  /** Highlights the plan with an accent border and a filled CTA. */
  featured?: boolean;
}

/**
 * A single pricing plan, built from the shared Card/Button/Badge primitives.
 * The featured plan gets an accent border and a filled CTA to stand out subtly.
 */
function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <Card
      className={cn(
        "h-full gap-6 p-8 transition-colors duration-200",
        plan.featured
          ? "border-brand ring-1 ring-brand/15"
          : "hover:border-foreground/20"
      )}
    >
      <div>
        {plan.badge ? (
          <Badge
            withDot={plan.featured}
            className="mb-4 w-fit"
          >
            {plan.badge}
          </Badge>
        ) : null}

        <h3 className="font-display text-xl font-medium tracking-tight">
          {plan.name}
        </h3>

        {plan.priceBadge ? (
          <Badge variant="solid" className="mt-3 w-fit">
            {plan.priceBadge}
          </Badge>
        ) : null}

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-medium tracking-tight">
            {plan.price}
          </span>
          {plan.priceSuffix ? (
            <span className="text-sm text-muted-foreground">
              {plan.priceSuffix}
            </span>
          ) : null}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
      </div>

      <ul className="flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" />
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.featured ? "default" : "outline"}
        className="w-full"
        asChild
      >
        <Link href={plan.cta.href}>{plan.cta.label}</Link>
      </Button>
    </Card>
  );
}

export { PricingCard };
