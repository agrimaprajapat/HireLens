"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert, Loader2 } from "lucide-react";
import { CheckoutEventNames, initializePaddle } from "@paddle/paddle-js";

import { Button } from "@/components/ui/button";
import type { PaidPlanId } from "@/lib/plans";

const PADDLE_ENV =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";
const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

type LaunchStatus = "preparing" | "opened" | "error";

/**
 * Client-side checkout launcher. On mount it asks the server to create a Paddle
 * transaction (`/api/paddle/checkout`) and opens the Paddle overlay for it.
 * It never grants anything — success is confirmed later by the webhook.
 */
function CheckoutLauncher({
  planId,
  planLabel,
}: {
  planId: PaidPlanId;
  planLabel: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<LaunchStatus>("preparing");
  const [message, setMessage] = useState<string | null>(null);
  const started = useRef(false);
  const completed = useRef(false);

  useEffect(() => {
    if (started.current) return; // guard React strict-mode double invocation
    started.current = true;

    const fail = (msg: string) => {
      setStatus("error");
      setMessage(msg);
    };

    void (async () => {
      if (!PADDLE_TOKEN) {
        fail("Checkout isn't configured yet. Please try again later.");
        return;
      }
      try {
        const paddle = await initializePaddle({
          environment: PADDLE_ENV,
          token: PADDLE_TOKEN,
          eventCallback: (event) => {
            // Route to the post-payment pages. Payment is still confirmed only
            // by the webhook; the success page verifies server-side.
            if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
              completed.current = true;
              const txn = event.data?.transaction_id;
              router.push(
                `/checkout/success${txn ? `?_ptxn=${encodeURIComponent(txn)}` : ""}`
              );
            } else if (event.name === CheckoutEventNames.CHECKOUT_CLOSED) {
              if (!completed.current) router.push("/checkout/cancelled");
            }
          },
        });
        if (!paddle) {
          fail("We couldn't start checkout. Please try again.");
          return;
        }

        const response = await fetch("/api/paddle/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        const data = await response.json();
        if (!response.ok || !data?.ok) {
          fail(data?.error?.message ?? "We couldn't start checkout. Please try again.");
          return;
        }

        paddle.Checkout.open({ transactionId: data.transactionId });
        setStatus("opened");
      } catch {
        fail("We couldn't start checkout. Please try again.");
      }
    })();
  }, [planId, router]);

  if (status === "error") {
    return (
      <>
        <span className="flex size-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/5 text-destructive">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Checkout unavailable
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/pricing">
            <ArrowLeft className="size-4" />
            Back to pricing
          </Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
        <Loader2 className="size-6 animate-spin" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight">
          {status === "opened"
            ? "Complete your purchase"
            : "Preparing your checkout…"}
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {status === "opened"
            ? `Finish your ${planLabel} purchase in the Paddle window.`
            : `Setting up ${planLabel}. This only takes a moment.`}
        </p>
      </div>
    </>
  );
}

export { CheckoutLauncher };
