import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PricingCard, type PricingPlan } from "@/components/pricing/pricing-card";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { FREE_PLAN_CREDITS } from "@/lib/constants";
import { checkoutHref } from "@/lib/plans";

export const metadata = {
  title: "Pricing — HireLens",
};

const PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying HireLens.",
    features: [
      `${FREE_PLAN_CREDITS} AI Credits`,
      "Resume Analysis",
      "Job Match",
      "AI Cover Letter",
      "Personal Dashboard",
      "Save Results",
    ],
    cta: { label: "Start Free", href: "/sign-up" },
  },
  {
    name: "Student Pro",
    badge: "⭐ Most Popular",
    priceBadge: "Early Adopter Pricing",
    price: "$4.99",
    priceSuffix: "/month",
    description:
      "Unlimited AI tools for students actively applying for internships and jobs.",
    features: [
      "Unlimited Resume Analysis",
      "Unlimited Job Matches",
      "Unlimited Cover Letters",
      "Unlimited Dashboard History",
      "Priority AI Processing",
      "Future Premium Features",
    ],
    cta: {
      label: "Upgrade to Student Pro",
      href: checkoutHref("student-pro"),
    },
    featured: true,
  },
  {
    name: "Placement Pass",
    badge: "🎓 Best Value",
    price: "$9.99",
    priceSuffix: "Every 3 months",
    description: "Ideal for placement season and internship applications.",
    features: [
      "Everything in Student Pro",
      "Unlimited AI Usage",
      "Best value for short-term intensive job searching",
    ],
    cta: {
      label: "Get Placement Pass",
      href: checkoutHref("placement-pass"),
    },
  },
];

const FAQS = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Paid plans are flexible — cancel whenever you like and you'll keep access until the end of the period you've paid for.",
  },
  {
    question: "Do I need a credit card for the free plan?",
    answer:
      `No. The free plan gives you ${FREE_PLAN_CREDITS} AI credits with no card required — just sign up and start.`,
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Absolutely. Start free and upgrade to Student Pro or the Placement Pass whenever you need unlimited usage.",
  },
  {
    question: "Will I lose my saved analyses?",
    answer:
      "No. Your saved resume analyses, job matches, and cover letters stay in your dashboard across every plan.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-5xl py-20">
          {/* Header */}
          <div className="animate-fade-up mx-auto max-w-2xl text-center">
            <span className="eyebrow">Pricing</span>
            <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              Choose the plan that&rsquo;s right for your job search
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
              Start free, then upgrade whenever you need unlimited AI-powered job
              application tools.
            </p>
          </div>

          {/* Plans */}
          <h2 className="sr-only">Plans</h2>
          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          {/* Trust section */}
          <Card className="mt-14 items-center gap-3 p-10 text-center">
            <h2 className="eyebrow">Why HireLens is Affordable</h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground text-balance">
              HireLens was built for students and fresh graduates. Our goal is to
              make AI-powered job applications accessible without expensive
              enterprise pricing.
            </p>
          </Card>

          {/* FAQ */}
          <div className="mx-auto mt-20 max-w-3xl">
            <div className="text-center">
              <span className="eyebrow">FAQ</span>
              <h2 className="font-display mt-3 text-3xl font-medium tracking-tight">
                Questions, answered
              </h2>
            </div>
            <Accordion type="single" collapsible className="mt-10 w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
