import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

/**
 * Billing audit events. A lightweight, append-only trail for support/debugging,
 * written to `BillingAuditLog` (introduced in Phase 11A). Extended in later
 * phases as more billing flows are implemented.
 */
export type BillingAuditEvent =
  | "checkout_initiated"
  | "checkout_created"
  | "checkout_failed"
  | "webhook_received"
  | "payment_completed"
  | "credits_granted"
  | "subscription_updated";

/**
 * Record a billing audit event. Best-effort: a logging failure must never break
 * the surrounding payment flow, so errors are swallowed (and console-logged).
 */
export async function logBillingEvent(params: {
  userId?: string | null;
  event: BillingAuditEvent;
  referenceId?: string | null;
  detail?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.billingAuditLog.create({
      data: {
        userId: params.userId ?? null,
        event: params.event,
        referenceId: params.referenceId ?? null,
        detail: params.detail,
      },
    });
  } catch (error) {
    console.error("[billing-audit] failed to write event:", params.event, error);
  }
}
