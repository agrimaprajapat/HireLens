import { LegalLayout, type LegalSection } from "@/components/legal/legal-layout";
import { LEGAL } from "@/lib/legal/config";
import { legalMetadata } from "@/lib/legal/metadata";

export const metadata = legalMetadata({
  title: "Privacy Policy",
  description:
    "How HireLens collects, uses, and protects your personal information, resumes, and job data across our AI resume tools.",
});

const contact = (
  <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
);

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    heading: "1. Information We Collect",
    body: (
      <>
        <p>
          We collect the information needed to provide HireLens&rsquo;s resume
          analysis, job-matching, and cover-letter tools. This includes
          information you provide directly, information generated as you use the
          service, and limited technical information collected automatically.
        </p>
        <p>
          We aim to collect only what is necessary to deliver and improve the
          service, and we describe each category below.
        </p>
      </>
    ),
  },
  {
    id: "account-information",
    heading: "2. Account Information",
    body: (
      <>
        <p>
          When you create an account, authentication and account management are
          handled by <strong>Clerk</strong>. Depending on how you sign up, this
          may include your name, email address, and profile details from a
          connected sign-in provider. Clerk stores your credentials securely; we
          never see or store your password.
        </p>
        <p>
          We keep a minimal record linked to your Clerk account identifier so we
          can associate your saved work and credit balance with you.
        </p>
      </>
    ),
  },
  {
    id: "resumes-and-job-descriptions",
    heading: "3. Uploaded Resumes and Job Descriptions",
    body: (
      <>
        <p>
          To analyse a resume, match it against a role, or generate a cover
          letter, you provide documents and text such as your resume file, a job
          description, and optional details about the role. We extract the text
          from your uploads to run the requested analysis.
        </p>
        <p>
          If you are signed in and choose to save a result, the associated
          content and generated output are stored in your dashboard so you can
          return to it. You can delete saved items at any time.
        </p>
      </>
    ),
  },
  {
    id: "ai-processing",
    heading: "4. AI Processing",
    body: (
      <>
        <p>
          The content you submit for analysis is processed using{" "}
          <strong>Azure OpenAI</strong>, Microsoft&rsquo;s enterprise AI
          platform. Your text is sent to Azure OpenAI solely to generate the
          analysis, match, or cover letter you requested and to return the
          result to you.
        </p>
        <p>
          Azure OpenAI does not use data submitted through its API to train the
          underlying models. We do not sell your content or use it to train our
          own models.
        </p>
      </>
    ),
  },
  {
    id: "payment-information",
    heading: "5. Payment Information",
    body: (
      <>
        <p>
          Payments are processed by <strong>Paddle</strong>, which acts as the
          merchant of record for purchases made through HireLens. When you buy a
          plan, your payment details (such as card information) are entered on
          Paddle&rsquo;s secure checkout and handled by Paddle.
        </p>
        <p>
          We do not receive or store your full card details. We retain a record
          of your transactions — such as the plan purchased, amount, currency,
          and status — to grant credits, provide receipts, and support billing
          enquiries.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "6. Cookies",
    body: (
      <>
        <p>
          We and our providers use cookies and similar technologies to keep you
          signed in, secure the service, and understand usage. For a full
          breakdown of the cookies used and how to control them, see our{" "}
          <a href="/cookie-policy">Cookie Policy</a>.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    heading: "7. Analytics",
    body: (
      <>
        <p>
          Where enabled, we use <strong>Google Analytics</strong> to understand
          how visitors use HireLens in aggregate — for example, which pages are
          viewed and how features are used. This helps us improve the product.
        </p>
        <p>
          Analytics data is used in aggregate and is not used to identify you
          personally. You can limit analytics through your browser settings as
          described in our <a href="/cookie-policy">Cookie Policy</a>.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "8. Security",
    body: (
      <>
        <p>
          We take reasonable technical and organisational measures to protect
          your information. Data is transmitted over encrypted connections
          (HTTPS), authentication is managed by Clerk, and application data is
          stored in a managed <strong>Neon PostgreSQL</strong> database. The
          application is hosted on <strong>Vercel</strong>.
        </p>
        <p>
          No method of transmission or storage is completely secure, and we
          cannot guarantee absolute security, but we work to protect your
          information using industry-standard practices.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    heading: "9. Data Retention",
    body: (
      <>
        <p>
          We retain your account information and saved items for as long as your
          account is active. Content you submit for a one-off analysis without
          saving is processed to return your result and is not retained as a
          saved item.
        </p>
        <p>
          Transaction records are retained as required to meet legal, accounting,
          and tax obligations. When you delete saved items or your account, the
          associated content is removed from our active systems, subject to those
          retention obligations.
        </p>
      </>
    ),
  },
  {
    id: "user-rights",
    heading: "10. Your Rights",
    body: (
      <>
        <p>
          Depending on your location, you may have rights over your personal
          information, including the right to access, correct, export, or delete
          it, and to object to or restrict certain processing.
        </p>
        <p>
          You can manage much of your data directly — updating your profile
          through your account and deleting saved items from your dashboard. To
          exercise any other right, contact us at {contact}.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    heading: "11. Third-Party Services",
    body: (
      <>
        <p>
          HireLens relies on trusted providers to operate. Each processes data
          only as needed to deliver its part of the service:
        </p>
        <ul>
          <li>
            <strong>Clerk</strong> — user authentication and account management.
          </li>
          <li>
            <strong>Azure OpenAI</strong> — AI processing of submitted content.
          </li>
          <li>
            <strong>Paddle</strong> — payment processing and billing.
          </li>
          <li>
            <strong>Neon PostgreSQL</strong> — managed database for application
            data.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting and delivery.
          </li>
          <li>
            <strong>Google Analytics</strong> — aggregate usage analytics, where
            enabled.
          </li>
        </ul>
        <p>
          These providers maintain their own privacy practices, and we encourage
          you to review them.
        </p>
      </>
    ),
  },
  {
    id: "international-users",
    heading: "12. International Users",
    body: (
      <>
        <p>
          HireLens is operated with the help of providers that may store or
          process data in countries other than your own. By using the service,
          you understand that your information may be transferred to and
          processed in locations where these providers operate.
        </p>
        <p>
          We rely on providers that offer appropriate safeguards for
          international data transfers.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "13. Contact Information",
    body: (
      <>
        <p>
          If you have questions about this Privacy Policy or how your
          information is handled, contact us at {contact}.
        </p>
        <p>
          You can also write to us at: <strong>{LEGAL.company}</strong>,{" "}
          {LEGAL.address}.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "14. Changes to This Policy",
    body: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          to the service or legal requirements. When we make material changes, we
          will update the &ldquo;Last updated&rdquo; date at the top of this
          page. Your continued use of HireLens after an update means you accept
          the revised policy.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This Privacy Policy explains what information HireLens collects, how we use and protect it, and the choices you have. It applies to your use of our website and AI-powered resume tools."
      updated={LEGAL.lastUpdated}
      sections={sections}
    />
  );
}
