import { LegalLayout, type LegalSection } from "@/components/legal/legal-layout";
import { LEGAL } from "@/lib/legal/config";
import { legalMetadata } from "@/lib/legal/metadata";

export const metadata = legalMetadata({
  title: "Refund Policy",
  description:
    "How HireLens handles refunds for digital products and subscriptions, including duplicate payments, technical issues, and how to request a review.",
});

const contact = (
  <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
);

const sections: LegalSection[] = [
  {
    id: "digital-products",
    heading: "1. Digital Products",
    body: (
      <>
        <p>
          HireLens sells digital products and services that are delivered
          electronically and made available immediately — including AI credits
          and access to paid features. Because access is granted right away,
          purchases are generally non-refundable except as described in this
          policy or as required by law.
        </p>
        <p>
          Payments are processed by <strong>Paddle</strong>, our merchant of
          record. Refunds, where approved, are issued through Paddle to the
          original payment method.
        </p>
      </>
    ),
  },
  {
    id: "subscription-refunds",
    heading: "2. Subscription Refunds",
    body: (
      <>
        <p>
          Subscription plans renew automatically for each billing period. You can
          cancel at any time to prevent future renewals; cancellation stops the
          next charge but does not automatically refund the current period.
        </p>
        <p>
          If you were charged for a renewal you intended to cancel, contact us
          promptly and we will review your request. Refunds for subscription
          charges are considered on a case-by-case basis and are not guaranteed.
        </p>
      </>
    ),
  },
  {
    id: "duplicate-payments",
    heading: "3. Duplicate Payments",
    body: (
      <p>
        If you were accidentally charged more than once for the same purchase,
        we will refund the duplicate charge once verified. Please contact us with
        your transaction details so we can confirm the duplicate with Paddle and
        process the refund.
      </p>
    ),
  },
  {
    id: "failed-payments",
    heading: "4. Failed Payments",
    body: (
      <p>
        If a payment fails or is declined, no plan or credits are granted and you
        should not be charged. If you see a pending charge for a failed payment,
        it is typically an authorisation hold released by your bank. If a
        completed charge did not result in access, contact us and we will
        investigate.
      </p>
    ),
  },
  {
    id: "technical-issues",
    heading: "5. Technical Issues",
    body: (
      <p>
        If a technical fault on our side prevented you from receiving the credits
        or access you paid for, and we are unable to resolve it, you may be
        eligible for a refund of the affected purchase. Please give us the
        opportunity to fix the issue first by contacting support with a
        description of the problem.
      </p>
    ),
  },
  {
    id: "chargebacks",
    heading: "6. Chargebacks",
    body: (
      <p>
        If you believe a charge is incorrect, please contact us before initiating
        a chargeback with your bank — we can usually resolve billing issues faster
        and directly. Initiating a chargeback may result in suspension of your
        account while the dispute is reviewed by Paddle and your payment provider.
      </p>
    ),
  },
  {
    id: "how-to-request",
    heading: "7. How to Request a Refund",
    body: (
      <>
        <p>
          To request a refund or raise a billing concern, contact us at {contact}{" "}
          and include:
        </p>
        <ul>
          <li>The email associated with your account;</li>
          <li>The transaction or order reference from your receipt;</li>
          <li>The date and amount of the charge; and</li>
          <li>A brief description of the reason for your request.</li>
        </ul>
        <p>
          Providing this information helps us verify the purchase and respond
          quickly.
        </p>
      </>
    ),
  },
  {
    id: "timeline",
    heading: "8. Refund Request Timeline",
    body: (
      <>
        <p>
          We aim to acknowledge refund requests within a few business days and to
          review each request fairly. If a refund is approved, it is processed
          through Paddle to your original payment method. The time for the funds
          to appear depends on your bank or card provider and is outside our
          control.
        </p>
        <p>
          This policy does not limit any statutory rights you may have under the
          consumer-protection laws that apply to you.
        </p>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      intro="This policy explains how refunds work for HireLens purchases, when a refund may be available, and how to request a review. We handle every request fairly and in line with our payment provider, Paddle."
      updated={LEGAL.lastUpdated}
      sections={sections}
    />
  );
}
