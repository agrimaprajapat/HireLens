"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15; // ~30s before falling back to a "still finalising" note

interface Confirmed {
  planLabel: string;
  creditsGranted: number;
  credits: number;
}

type State = "finalising" | "confirmed" | "generic" | "timeout";

/**
 * Post-payment confirmation. Polls the server for the transaction's real status
 * (never trusts the URL for payment state — the id is only a lookup key). Shows
 * a "finalising" state while the webhook is still processing.
 */
function CheckoutSuccess({ transactionId }: { transactionId?: string }) {
  const [state, setState] = useState<State>(
    transactionId ? "finalising" : "generic"
  );
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (!transactionId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/billing/payment-status?transactionId=${encodeURIComponent(transactionId)}`
        );
        const data = await response.json();
        if (!active) return;
        if (response.ok && data.status === "completed") {
          setConfirmed({
            planLabel: data.planLabel,
            creditsGranted: data.creditsGranted,
            credits: data.credits,
          });
          setState("confirmed");
          return;
        }
      } catch {
        // transient — keep polling
      }
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        if (active) setState("timeout");
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [transactionId]);

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/#upload">Analyse Resume</Link>
      </Button>
    </div>
  );

  if (state === "confirmed" && confirmed) {
    return (
      <>
        <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Check className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Payment successful
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Your <span className="font-medium text-foreground">{confirmed.planLabel}</span>{" "}
            purchase added{" "}
            <span className="font-medium text-foreground">
              {confirmed.creditsGranted} credits
            </span>{" "}
            to your account. You now have{" "}
            <span className="font-medium text-foreground">
              {confirmed.credits} credits
            </span>
            .
          </p>
        </div>
        {actions}
      </>
    );
  }

  if (state === "generic") {
    return (
      <>
        <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Sparkles className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Payment received
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Thanks! Your credits will appear in your dashboard shortly.
          </p>
        </div>
        {actions}
      </>
    );
  }

  if (state === "timeout") {
    return (
      <>
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
          <Loader2 className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Still finalising your purchase
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            This is taking a little longer than usual. Your credits will be added
            automatically — check your dashboard in a moment.
          </p>
        </div>
        {actions}
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
          Finalising your purchase…
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          We&rsquo;re confirming your payment and adding your credits. This only
          takes a few seconds.
        </p>
      </div>
    </>
  );
}

export { CheckoutSuccess };
