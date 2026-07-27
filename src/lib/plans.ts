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
