import "server-only";

import type { Paddle } from "@paddle/paddle-node-sdk";

import { logBillingEvent } from "@/lib/billing/audit";
import { prisma } from "@/lib/db";
import { getPaddle } from "@/lib/paddle/client";
import { PAID_PLANS, type PaidPlanId } from "@/lib/plans";

/** Minimal shape of the current user needed to create a checkout. */
interface CheckoutUser {
  id: string;
  email: string;
  paddleCustomerId: string | null;
}

export type CheckoutErrorCode = "paddle_not_configured" | "checkout_failed";

export type CheckoutResult =
  | { ok: true; transactionId: string }
  | { ok: false; error: { code: CheckoutErrorCode; message: string } };

/** Resolve a plan's Paddle price id from the environment (never hardcoded). */
function resolvePriceId(planId: PaidPlanId): string {
  const envVar = PAID_PLANS[planId].priceIdEnvVar;
  const priceId = process.env[envVar]?.trim();
  if (!priceId) {
    throw new Error(`Missing ${envVar}. Add the Paddle price id to .env.local.`);
  }
  return priceId;
}

/** Find an existing Paddle customer id by email (recovery path). */
async function findCustomerIdByEmail(
  paddle: Paddle,
  email: string
): Promise<string | null> {
  const page = await paddle.customers.list({ email: [email] }).next();
  return page[0]?.id ?? null;
}

/** Reuse the stored Paddle customer, or create one and persist its id. */
async function resolveCustomerId(
  paddle: Paddle,
  user: CheckoutUser
): Promise<string> {
  if (user.paddleCustomerId) return user.paddleCustomerId;

  let customerId: string;
  try {
    const customer = await paddle.customers.create({ email: user.email });
    customerId = customer.id;
  } catch (error) {
    // If the email already exists in Paddle, recover instead of failing.
    const existingId = await findCustomerIdByEmail(paddle, user.email);
    if (!existingId) throw error;
    customerId = existingId;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { paddleCustomerId: customerId },
  });
  return customerId;
}

/**
 * Create a Paddle checkout transaction for a paid plan and record a pending
 * Payment. Never grants credits and never marks anything completed — the webhook
 * (a later phase) remains the sole source of truth for successful payments.
 */
export async function createPaddleCheckout(
  user: CheckoutUser,
  planId: PaidPlanId
): Promise<CheckoutResult> {
  await logBillingEvent({
    userId: user.id,
    event: "checkout_initiated",
    detail: { planId },
  });

  // Configuration errors are distinct from provider/runtime failures.
  let paddle: Paddle;
  let priceId: string;
  try {
    paddle = getPaddle();
    priceId = resolvePriceId(planId);
  } catch (error) {
    console.error("[createPaddleCheckout] not configured:", error);
    await logBillingEvent({
      userId: user.id,
      event: "checkout_failed",
      detail: { planId, reason: "not_configured" },
    });
    return {
      ok: false,
      error: {
        code: "paddle_not_configured",
        message: "Checkout isn't available right now. Please try again later.",
      },
    };
  }

  try {
    const customerId = await resolveCustomerId(paddle, user);

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerId,
      customData: { userId: user.id, planId },
    });

    const totals = transaction.details?.totals;
    const amountMinor = totals
      ? Number.parseInt(totals.grandTotal, 10) || 0
      : 0;
    const currency = totals?.currencyCode ?? transaction.currencyCode;

    // `providerTransactionId` is unique, so a given transaction can only ever
    // produce one pending Payment (idempotency at the DB layer).
    await prisma.payment.create({
      data: {
        userId: user.id,
        providerTransactionId: transaction.id,
        providerSubscriptionId: transaction.subscriptionId,
        planId,
        status: "pending",
        amountMinor,
        currency,
      },
    });

    await logBillingEvent({
      userId: user.id,
      event: "checkout_created",
      referenceId: transaction.id,
      detail: { planId, amountMinor, currency },
    });

    return { ok: true, transactionId: transaction.id };
  } catch (error) {
    console.error("[createPaddleCheckout] provider error:", error);
    await logBillingEvent({
      userId: user.id,
      event: "checkout_failed",
      detail: { planId, reason: "provider_error" },
    });
    return {
      ok: false,
      error: {
        code: "checkout_failed",
        message: "We couldn't start checkout. Please try again.",
      },
    };
  }
}
