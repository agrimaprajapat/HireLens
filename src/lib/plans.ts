/**
 * Shared, stable identifiers for the paid plans. These IDs are the single source
 * of truth for checkout links, label lookups, and query-param validation — so
 * they are never scattered as unchecked magic strings.
 */

export const PAID_PLAN_IDS = ["student-pro", "placement-pass"] as const;

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

/** Display labels for each paid plan. */
export const PAID_PLAN_LABELS: Record<PaidPlanId, string> = {
  "student-pro": "Student Pro",
  "placement-pass": "Placement Pass",
};

/** Type guard for validating an untrusted plan id (e.g. a query param). */
export function isPaidPlanId(value: string | undefined): value is PaidPlanId {
  return (
    value !== undefined && (PAID_PLAN_IDS as readonly string[]).includes(value)
  );
}

/** Build the checkout link for a paid plan. */
export function checkoutHref(planId: PaidPlanId): string {
  return `/checkout?plan=${planId}`;
}

/** How a plan is billed by the provider. */
export type PlanBillingType = "subscription" | "one_time";

/**
 * Billing configuration for a paid plan — the single source of truth consumed by
 * the payment layer. Pure config (no runtime deps), so it stays client-safe:
 * the Paddle price id is referenced by env-var *name* and resolved server-side,
 * never hardcoded here.
 */
export interface PaidPlanConfig {
  id: PaidPlanId;
  label: string;
  billingType: PlanBillingType;
  /**
   * Credits granted per successful payment (per billing cycle for
   * subscriptions, once for one-time purchases). Configurable in one place.
   */
  creditAllocation: number;
  /** Name of the env var holding the Paddle price id (differs sandbox/prod). */
  priceIdEnvVar: string;
}

// NOTE: creditAllocation values below are working defaults pending final
// confirmation of the per-plan allocations. Change them here only.
export const PAID_PLANS: Record<PaidPlanId, PaidPlanConfig> = {
  "student-pro": {
    id: "student-pro",
    label: PAID_PLAN_LABELS["student-pro"],
    billingType: "subscription",
    creditAllocation: 100,
    priceIdEnvVar: "PADDLE_PRICE_STUDENT_PRO",
  },
  "placement-pass": {
    id: "placement-pass",
    label: PAID_PLAN_LABELS["placement-pass"],
    billingType: "one_time",
    creditAllocation: 300,
    priceIdEnvVar: "PADDLE_PRICE_PLACEMENT_PASS",
  },
};
