import "server-only";

import { EventName } from "@paddle/paddle-node-sdk";
import type {
  SubscriptionNotification,
  TransactionNotification,
} from "@paddle/paddle-node-sdk";
import type { SubscriptionStatus } from "@prisma/client";

import { logBillingEvent } from "@/lib/billing/audit";
import { completePaymentAndGrantCredits } from "@/lib/billing/grant";
import { upsertSubscription } from "@/lib/billing/subscription";
import { prisma } from "@/lib/db";
import { getPaddle } from "@/lib/paddle/client";
import { isPaidPlanId, PAID_PLANS, type PaidPlanId } from "@/lib/plans";

/** Reject webhook signatures older than this to prevent replay. */
const REPLAY_WINDOW_SECONDS = 300;

export interface WebhookResult {
  ok: boolean;
  status: number;
  reason?: string;
}

/** Extract the `ts` unix seconds from a Paddle-Signature header. */
function parseSignatureTimestamp(signature: string): number | null {
  for (const part of signature.split(";")) {
    const [key, value] = part.split("=");
    if (key?.trim() === "ts") {
      const seconds = Number.parseInt(value ?? "", 10);
      return Number.isFinite(seconds) ? seconds : null;
    }
  }
  return null;
}

/** Safely read a string field from an untyped customData object. */
function readCustomString(customData: unknown, key: string): string | undefined {
  if (customData && typeof customData === "object") {
    const value = (customData as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return undefined;
}

/** Reverse-map a Paddle price id back to a plan id via the central config. */
function resolvePlanIdFromPriceId(
  priceId: string | null | undefined
): PaidPlanId | undefined {
  if (!priceId) return undefined;
  for (const plan of Object.values(PAID_PLANS)) {
    if (process.env[plan.priceIdEnvVar]?.trim() === priceId) return plan.id;
  }
  return undefined;
}

/** Map a Paddle subscription status onto our enum. */
function mapSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "past_due":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
      return "canceled";
    case "trialing":
    case "active":
    default:
      return "active";
  }
}

/**
 * Verify and process a Paddle webhook. Returns the HTTP status the route should
 * reply with: 2xx acks (including idempotent no-ops and ignored event types),
 * 400 for bad/stale/forged signatures (no retry), 5xx for transient failures
 * (Paddle retries — safe because processing is idempotent).
 */
export async function handlePaddleWebhook(
  rawBody: string,
  signature: string | null
): Promise<WebhookResult> {
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET is not set");
    return { ok: false, status: 503, reason: "not_configured" };
  }
  if (!signature) return { ok: false, status: 400, reason: "missing_signature" };

  // Replay protection: reject stale signatures before doing any work.
  const ts = parseSignatureTimestamp(signature);
  if (ts === null) return { ok: false, status: 400, reason: "malformed_signature" };
  if (Math.abs(Date.now() / 1000 - ts) > REPLAY_WINDOW_SECONDS) {
    return { ok: false, status: 400, reason: "stale_signature" };
  }

  let paddle: ReturnType<typeof getPaddle>;
  try {
    paddle = getPaddle();
  } catch (error) {
    console.error("[paddle-webhook] not configured:", error);
    return { ok: false, status: 503, reason: "not_configured" };
  }

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secret, signature);
  } catch (error) {
    console.error("[paddle-webhook] signature verification failed:", error);
    return { ok: false, status: 400, reason: "invalid_signature" };
  }
  if (!event) return { ok: false, status: 400, reason: "invalid_signature" };

  await logBillingEvent({
    event: "webhook_received",
    referenceId: event.eventId,
    detail: { type: event.eventType },
  });

  try {
    switch (event.eventType) {
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(
          event.data as TransactionNotification,
          event.eventId,
          event.eventType
        );
        break;
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated:
        await handleSubscription(
          event.data as SubscriptionNotification,
          event.eventId,
          event.eventType
        );
        break;
      default:
        // Unhandled event types are acknowledged and ignored.
        break;
    }
    return { ok: true, status: 200 };
  } catch (error) {
    console.error("[paddle-webhook] processing error:", error);
    return { ok: false, status: 500, reason: "processing_error" };
  }
}

async function handleTransactionCompleted(
  data: TransactionNotification,
  eventId: string,
  eventType: string
): Promise<void> {
  const planId = readCustomString(data.customData, "planId");
  if (!planId || !isPaidPlanId(planId)) {
    console.error("[paddle-webhook] transaction.completed: missing/invalid planId", eventId);
    return;
  }

  // Prefer the userId we set at checkout; fall back to the customer mapping.
  let userId = readCustomString(data.customData, "userId");
  if (!userId && data.customerId) {
    const user = await prisma.user.findUnique({
      where: { paddleCustomerId: data.customerId },
      select: { id: true },
    });
    userId = user?.id;
  }
  if (!userId) {
    console.error("[paddle-webhook] transaction.completed: cannot resolve user", eventId);
    return;
  }

  const totals = data.details?.totals;
  const amountMinor = totals ? Number.parseInt(totals.grandTotal, 10) || 0 : 0;
  const currency = totals?.currencyCode ?? data.currencyCode;

  await completePaymentAndGrantCredits({
    userId,
    planId,
    providerTransactionId: data.id,
    providerSubscriptionId: data.subscriptionId,
    amountMinor,
    currency,
    providerEventId: eventId,
    eventType,
  });
}

async function handleSubscription(
  data: SubscriptionNotification,
  eventId: string,
  eventType: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { paddleCustomerId: data.customerId },
    select: { id: true },
  });
  if (!user) {
    console.error("[paddle-webhook] subscription event: no user for customer", eventId);
    return;
  }

  const fromData = readCustomString(data.customData, "planId");
  const planId =
    fromData && isPaidPlanId(fromData)
      ? fromData
      : resolvePlanIdFromPriceId(data.items[0]?.price?.id ?? null);
  if (!planId) {
    console.error("[paddle-webhook] subscription event: cannot resolve planId", eventId);
    return;
  }

  const endsAt = data.currentBillingPeriod?.endsAt;
  if (!endsAt) {
    console.error("[paddle-webhook] subscription event: no current period end", eventId);
    return;
  }

  await upsertSubscription({
    userId: user.id,
    planId,
    providerSubscriptionId: data.id,
    status: mapSubscriptionStatus(data.status),
    currentPeriodEnd: new Date(endsAt),
    providerEventId: eventId,
    eventType,
  });
}
