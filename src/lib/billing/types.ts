/**
 * Client-safe billing DTOs. No runtime deps, so both server (the billing lib and
 * API routes) and client (billing components) can import them.
 */

export interface BillingSummary {
  /** Live credit balance (User.credits) — the single source of truth. */
  credits: number;
  /** Active recurring plan, or null when on the free tier. */
  plan: { id: string; label: string } | null;
  /** Recurring subscription details, or null when there is none. */
  subscription: {
    planId: string;
    planLabel: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface PaymentRecord {
  id: string;
  date: string;
  planLabel: string;
  amountMinor: number;
  currency: string;
  status: string;
  provider: string;
}

export type PaymentStatusResult =
  | { status: "not_found" }
  | {
      status: "pending" | "completed" | "failed" | "refunded";
      planLabel: string;
      creditsGranted: number;
      credits: number;
    };
