import "server-only";

import { prisma } from "@/lib/db";
import { PAID_PLANS, type PaidPlanId } from "@/lib/plans";
import { isUniqueViolation } from "@/lib/prisma-errors";

/**
 * The webhook is the single source of truth for granting credits. This module
 * completes a Payment and grants the plan's credit allocation atomically and
 * idempotently.
 */

export type GrantOutcome = "granted" | "already_granted" | "already_processed";

export interface GrantInput {
  userId: string;
  planId: PaidPlanId;
  providerTransactionId: string;
  providerSubscriptionId: string | null;
  amountMinor: number;
  currency: string;
  providerEventId: string;
  eventType: string;
}

/**
 * Complete the payment for a transaction and grant its credits.
 *
 * Idempotency layers:
 *  - `WebhookEvent.providerEventId` (unique) dedupes the *same* event delivered
 *    twice (including a concurrent race, caught as a unique violation).
 *  - A completed `Payment` for the transaction short-circuits the grant, so the
 *    *same transaction* can never grant twice even across different event types.
 *
 * Everything runs in one DB transaction, so a failure leaves no partial state
 * (and the webhook returns non-2xx → Paddle retries → this reconciles).
 */
export async function completePaymentAndGrantCredits(
  input: GrantInput
): Promise<GrantOutcome> {
  const alreadySeen = await prisma.webhookEvent.findUnique({
    where: { providerEventId: input.providerEventId },
    select: { id: true },
  });
  if (alreadySeen) return "already_processed";

  const allocation = PAID_PLANS[input.planId].creditAllocation;

  try {
    return await prisma.$transaction(async (tx) => {
      // Record the event first; a unique violation means a concurrent delivery
      // already handled it (rolls back this transaction, caught below).
      await tx.webhookEvent.create({
        data: { providerEventId: input.providerEventId, eventType: input.eventType },
      });

      const existing = await tx.payment.findUnique({
        where: { providerTransactionId: input.providerTransactionId },
        select: { status: true },
      });
      if (existing?.status === "completed") {
        return "already_granted" as const;
      }

      await tx.payment.upsert({
        where: { providerTransactionId: input.providerTransactionId },
        create: {
          userId: input.userId,
          providerTransactionId: input.providerTransactionId,
          providerSubscriptionId: input.providerSubscriptionId,
          planId: input.planId,
          status: "completed",
          amountMinor: input.amountMinor,
          currency: input.currency,
          creditsGranted: allocation,
        },
        update: {
          status: "completed",
          providerSubscriptionId: input.providerSubscriptionId,
          amountMinor: input.amountMinor,
          currency: input.currency,
          creditsGranted: allocation,
        },
      });

      await tx.user.update({
        where: { id: input.userId },
        data: { credits: { increment: allocation } },
      });

      await tx.billingAuditLog.create({
        data: {
          userId: input.userId,
          event: "payment_completed",
          referenceId: input.providerTransactionId,
          detail: {
            planId: input.planId,
            amountMinor: input.amountMinor,
            currency: input.currency,
          },
        },
      });
      await tx.billingAuditLog.create({
        data: {
          userId: input.userId,
          event: "credits_granted",
          referenceId: input.providerTransactionId,
          detail: { planId: input.planId, credits: allocation },
        },
      });

      return "granted" as const;
    });
  } catch (error) {
    if (isUniqueViolation(error, "providerEventId")) return "already_processed";
    throw error;
  }
}
