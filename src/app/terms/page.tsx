import { LegalLayout, type LegalSection } from "@/components/legal/legal-layout";
import { LEGAL } from "@/lib/legal/config";
import { legalMetadata } from "@/lib/legal/metadata";

export const metadata = legalMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern your use of HireLens, including accounts, acceptable use, AI-generated content, payments, and liability.",
});

const contact = (
  <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
);

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "1. Acceptance of Terms",
    body: (
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of HireLens (the &ldquo;service&rdquo;). By creating an account or
        using the service, you agree to these Terms. If you do not agree, please
        do not use HireLens.
      </p>
    ),
  },
  {
    id: "eligibility",
    heading: "2. Eligibility",
    body: (
      <p>
        You must be able to form a legally binding contract to use HireLens. If
        you are using the service on behalf of an organisation, you represent
        that you are authorised to accept these Terms on its behalf. You are
        responsible for ensuring your use complies with the laws that apply to
        you.
      </p>
    ),
  },
  {
    id: "user-accounts",
    heading: "3. User Accounts",
    body: (
      <>
        <p>
          Accounts are created and managed through <strong>Clerk</strong>. You
          are responsible for the activity that occurs under your account and for
          keeping your login credentials secure. You agree to provide accurate
          information and to notify us of any unauthorised use of your account.
        </p>
        <p>
          You may not share your account or use another person&rsquo;s account
          without permission.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "4. Acceptable Use",
    body: (
      <>
        <p>You agree not to use HireLens to:</p>
        <ul>
          <li>Violate any law or the rights of others;</li>
          <li>
            Upload content you do not have the right to submit, or that contains
            another person&rsquo;s information without their consent;
          </li>
          <li>
            Attempt to disrupt, reverse-engineer, overload, or gain unauthorised
            access to the service or its providers;
          </li>
          <li>
            Misuse the AI tools to generate unlawful, deceptive, or harmful
            content; or
          </li>
          <li>Resell or redistribute the service without our permission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-content-disclaimer",
    heading: "5. AI-Generated Content Disclaimer",
    body: (
      <>
        <p>
          HireLens uses AI (<strong>Azure OpenAI</strong>) to produce analysis,
          matches, and cover letters. AI-generated output may contain errors,
          omissions, or content that is not suitable for your specific
          situation. Output is provided for your assistance only and does not
          constitute professional, legal, career, or employment advice.
        </p>
        <p>
          You are responsible for reviewing, editing, and verifying any content
          before you rely on or submit it. You retain ownership of the resume and
          job content you provide.
        </p>
      </>
    ),
  },
  {
    id: "resume-analysis-limitations",
    heading: "6. Resume Analysis Limitations",
    body: (
      <p>
        Resume analysis and job-match scores are automated estimates intended to
        help you improve your materials. They reflect how an AI model interprets
        your content and do not guarantee any outcome, including passing an
        applicant tracking system, receiving an interview, or securing
        employment. Results may vary and should be treated as guidance, not a
        guarantee.
      </p>
    ),
  },
  {
    id: "cover-letter-limitations",
    heading: "7. Cover Letter Limitations",
    body: (
      <p>
        Generated cover letters are drafts based on the information you provide.
        They may require editing for accuracy, tone, and relevance, and you are
        responsible for ensuring the final content is truthful and appropriate
        for the role to which you are applying.
      </p>
    ),
  },
  {
    id: "payment-terms",
    heading: "8. Payment Terms",
    body: (
      <p>
        Paid plans are billed through <strong>Paddle</strong>, our merchant of
        record. Prices, currencies, and applicable taxes are shown at checkout.
        By purchasing a plan, you authorise Paddle to charge your selected
        payment method for the amount presented. All purchases are subject to
        these Terms and to Paddle&rsquo;s buyer terms.
      </p>
    ),
  },
  {
    id: "subscription-terms",
    heading: "9. Subscription Terms",
    body: (
      <p>
        Subscription plans renew automatically for the applicable billing period
        until cancelled. You may cancel at any time, and cancellation takes
        effect at the end of the current paid period; you will retain access to
        paid features until then. We may change plan features or pricing on a
        going-forward basis, with notice where required.
      </p>
    ),
  },
  {
    id: "credit-system",
    heading: "10. Credit System",
    body: (
      <p>
        HireLens uses a credit system to access AI features. New accounts receive
        a limited number of free credits, and paid plans grant additional
        credits. Each AI action consumes credits as described on the pricing
        page. Credits are for use within the service, hold no cash value, and are
        non-transferable. If an AI action fails, we aim to return the credit
        reserved for that action.
      </p>
    ),
  },
  {
    id: "refunds",
    heading: "11. Refunds",
    body: (
      <p>
        Purchases are subject to our{" "}
        <a href="/refund-policy">Refund Policy</a>, which explains when refunds
        may be available and how to request one. Please review it before
        purchasing.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    heading: "12. Intellectual Property",
    body: (
      <>
        <p>
          HireLens, including its software, design, and branding, is owned by us
          and protected by intellectual-property laws. We grant you a limited,
          non-exclusive, non-transferable licence to use the service in
          accordance with these Terms.
        </p>
        <p>
          You retain ownership of the resume and job content you submit and of
          the output generated for you, subject to the rights of any third-party
          model providers in their underlying technology.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    heading: "13. Limitation of Liability",
    body: (
      <p>
        To the fullest extent permitted by law, HireLens and its providers are
        not liable for any indirect, incidental, special, consequential, or
        punitive damages, or for lost opportunities, employment outcomes, or
        data, arising from your use of the service. The service is provided
        &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
        any kind, except those that cannot be excluded under applicable law.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "14. Termination",
    body: (
      <p>
        You may stop using HireLens and delete your account at any time. We may
        suspend or terminate your access if you violate these Terms or use the
        service in a way that could cause harm or legal exposure. On termination,
        your right to use the service ends, though certain provisions — such as
        those on intellectual property and liability — survive.
      </p>
    ),
  },
  {
    id: "governing-law",
    heading: "15. Governing Law",
    body: (
      <p>
        These Terms are governed by and construed in accordance with the laws of{" "}
        {LEGAL.governingLaw}, without regard to its conflict-of-law principles.
        Any disputes arising from these Terms or the service will be subject to
        the appropriate courts of that jurisdiction.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "16. Contact",
    body: (
      <>
        <p>
          If you have questions about these Terms, contact us at {contact}.
        </p>
        <p>
          Postal address: <strong>{LEGAL.company}</strong>, {LEGAL.address}.
        </p>
      </>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="These Terms set out the rules for using HireLens and our AI-powered resume tools. Please read them carefully — by using the service, you agree to them."
      updated={LEGAL.lastUpdated}
      sections={sections}
    />
  );
}
