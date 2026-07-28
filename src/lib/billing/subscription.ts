import "server-only";

import type { SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { PaidPlanId } from "@/lib/plans";
import { isUniqueViolation } from "@/lib/prisma-errors";

/**
 * Records recurring-plan state from subscription webhooks. `Subscription` is the
 * source of truth for plan state; credits are granted separately by the
 * `transaction.completed` handler. No cancellation handling here (out of scope).
 */

export type SubscriptionOutcome = "processed" | "already_processed";

export interface SubscriptionInput {
  userId: string;
  planId: PaidPlanId;
  providerSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  providerEventId: string;
  eventType: string;
}

export async function upsertSubscription(
  input: SubscriptionInput
): Promise<SubscriptionOutcome> {
  const alreadySeen = await prisma.webhookEvent.findUnique({
    where: { providerEventId: input.providerEventId },
    select: { id: true },
  });
  if (alreadySeen) return "already_processed";

  try {
    await prisma.$transaction(async (tx) => {
      await tx.webhookEvent.create({
        data: { providerEventId: input.providerEventId, eventType: input.eventType },
      });

      await tx.subscription.upsert({
        where: { providerSubscriptionId: input.providerSubscriptionId },
        create: {
          userId: input.userId,
          providerSubscriptionId: input.providerSubscriptionId,
          planId: input.planId,
          status: input.status,
          currentPeriodEnd: input.currentPeriodEnd,
        },
        update: {
          status: input.status,
          currentPeriodEnd: input.currentPeriodEnd,
          planId: input.planId,
        },
      });

      await tx.billingAuditLog.create({
        data: {
          userId: input.userId,
          event: "subscription_updated",
          referenceId: input.providerSubscriptionId,
          detail: { planId: input.planId, status: input.status },
        },
      });
    });
    return "processed";
  } catch (error) {
    if (isUniqueViolation(error, "providerEventId")) return "already_processed";
    throw error;
  }
}
