import { LegalLayout, type LegalSection } from "@/components/legal/legal-layout";
import { LEGAL } from "@/lib/legal/config";
import { legalMetadata } from "@/lib/legal/metadata";

export const metadata = legalMetadata({
  title: "Cookie Policy",
  description:
    "The cookies and similar technologies HireLens uses for authentication, essential functionality, and analytics — and how to manage them.",
});

const contact = (
  <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
);

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    heading: "1. What Are Cookies",
    body: (
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help the site work, keep you signed in, and provide
        information about how the site is used. This policy describes the cookies
        and similar technologies used by HireLens.
      </p>
    ),
  },
  {
    id: "essential-cookies",
    heading: "2. Essential Cookies",
    body: (
      <p>
        These cookies are necessary for HireLens to function and cannot be
        switched off in our systems. They support core features such as page
        navigation, security, and load balancing. Without them, parts of the
        service will not work correctly.
      </p>
    ),
  },
  {
    id: "authentication-cookies",
    heading: "3. Authentication Cookies",
    body: (
      <p>
        We use authentication cookies set by <strong>Clerk</strong> to sign you
        in securely and keep you signed in as you move between pages. These
        cookies are essential to accessing your account, dashboard, and saved
        work.
      </p>
    ),
  },
  {
    id: "analytics-cookies",
    heading: "4. Analytics Cookies",
    body: (
      <p>
        Where enabled, we use <strong>Google Analytics</strong> cookies to
        understand how visitors use HireLens in aggregate — for example, which
        pages are popular and how features are used. This information helps us
        improve the product and is not used to identify you personally.
      </p>
    ),
  },
  {
    id: "functional-cookies",
    heading: "5. Functional Cookies",
    body: (
      <p>
        Functional cookies help remember choices you make to provide a smoother
        experience, such as retaining certain preferences during your session.
        These support convenience features rather than core functionality.
      </p>
    ),
  },
  {
    id: "third-party-cookies",
    heading: "6. Third-Party Cookies",
    body: (
      <>
        <p>
          Some cookies are set by the third-party providers that power HireLens.
          When you make a purchase, <strong>Paddle</strong> may set cookies as
          part of its secure checkout to process your payment and prevent fraud.
          Clerk and Google Analytics likewise set the cookies described above.
        </p>
        <p>
          These providers manage their own cookies in line with their respective
          privacy and cookie practices.
        </p>
      </>
    ),
  },
  {
    id: "managing-cookies",
    heading: "7. Managing Cookies",
    body: (
      <p>
        You can control and delete cookies through your browser. Note that
        blocking essential or authentication cookies will prevent you from
        signing in and using key parts of HireLens. Disabling analytics cookies
        will not affect your ability to use the service.
      </p>
    ),
  },
  {
    id: "browser-controls",
    heading: "8. Browser Controls",
    body: (
      <>
        <p>
          Most browsers let you view, manage, and delete cookies from their
          settings, and can be set to warn you before a cookie is stored. Refer
          to your browser&rsquo;s help pages for instructions:
        </p>
        <ul>
          <li>Chrome, Edge, Firefox, and Safari all provide cookie controls;</li>
          <li>
            You can clear existing cookies or block future ones per site; and
          </li>
          <li>
            Private/incognito windows limit how long cookies persist.
          </li>
        </ul>
        <p>
          If you have questions about our use of cookies, contact us at {contact}.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      intro="This Cookie Policy explains the cookies and similar technologies HireLens uses, why we use them, and how you can manage them."
      updated={LEGAL.lastUpdated}
      sections={sections}
    />
  );
}
