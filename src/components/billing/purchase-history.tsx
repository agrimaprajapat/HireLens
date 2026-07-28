"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Loader2, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBillingDate, formatMoney } from "@/lib/billing/format";
import type { PaymentRecord } from "@/lib/billing/types";
import { cn } from "@/lib/utils";

type State = "loading" | "loaded" | "error";

/** Subtle tone per payment status, using existing tokens. */
function statusClassName(status: string): string {
  if (status === "completed") return "border-brand/40 text-brand";
  if (status === "failed" || status === "refunded")
    return "border-destructive/30 text-destructive";
  return "border-border text-muted-foreground";
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Purchase history list. Fetches the signed-in user's payments and renders
 * loading, empty, and error states. Newest first (ordered server-side).
 */
function PurchaseHistory() {
  const [state, setState] = useState<State>("loading");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/billing/history");
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!active) return;
        setPayments(Array.isArray(data.payments) ? data.payments : []);
        setState("loaded");
      } catch {
        if (active) setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your payments…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-sm text-destructive">
        <CircleAlert className="size-4" />
        We couldn&rsquo;t load your payment history. Please try again.
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        <Receipt className="size-5" />
        No payments yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex flex-wrap items-center justify-between gap-3 p-4"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{payment.planLabel}</p>
            <p className="text-xs text-muted-foreground">
              {formatBillingDate(payment.date)} · {capitalize(payment.provider)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums">
              {formatMoney(payment.amountMinor, payment.currency)}
            </span>
            <Badge className={cn(statusClassName(payment.status))}>
              {capitalize(payment.status)}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

export { PurchaseHistory };
