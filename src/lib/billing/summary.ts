import "server-only";

import type {
  BillingSummary,
  PaymentRecord,
  PaymentStatusResult,
} from "@/lib/billing/types";
import { prisma } from "@/lib/db";
import { isPaidPlanId, PAID_PLAN_LABELS } from "@/lib/plans";

/** Human label for a stored plan id (falls back to the raw id). */
function labelFor(planId: string): string {
  return isPaidPlanId(planId) ? PAID_PLAN_LABELS[planId] : planId;
}

/**
 * Current billing summary: live credit balance, active plan (from the most
 * recent subscription), and subscription details. Read-only. Credits are read
 * straight from `User.credits` — no duplicated calculation.
 */
export async function getBillingSummary(userId: string): Promise<BillingSummary> {
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { credits: true } }),
    prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const credits = user?.credits ?? 0;

  const plan =
    subscription &&
    (subscription.status === "active" || subscription.status === "past_due")
      ? { id: subscription.planId, label: labelFor(subscription.planId) }
      : null;

  const sub = subscription
    ? {
        planId: subscription.planId,
        planLabel: labelFor(subscription.planId),
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      }
    : null;

  return { credits, plan, subscription: sub };
}

/** A user's payments, newest first. */
export async function getPaymentHistory(
  userId: string
): Promise<PaymentRecord[]> {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((payment) => ({
    id: payment.id,
    date: payment.createdAt.toISOString(),
    planLabel: labelFor(payment.planId),
    amountMinor: payment.amountMinor,
    currency: payment.currency,
    status: payment.status,
    provider: payment.provider,
  }));
}

/**
 * Status of a specific transaction, scoped to the owning user. Used by the
 * success page to poll until the webhook confirms the payment. The status comes
 * from the DB (set only by the verified webhook), never from a query parameter.
 */
export async function getPaymentStatus(
  userId: string,
  transactionId: string
): Promise<PaymentStatusResult> {
  const payment = await prisma.payment.findFirst({
    where: { providerTransactionId: transactionId, userId },
  });
  if (!payment) return { status: "not_found" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return {
    status: payment.status,
    planLabel: labelFor(payment.planId),
    creditsGranted: payment.creditsGranted,
    credits: user?.credits ?? 0,
  };
}
