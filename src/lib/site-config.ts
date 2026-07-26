/**
 * Central content configuration for the HireLens landing page.
 *
 * Keeping copy and structured data (nav links, features, FAQ) here means the
 * section components stay presentational and reusable. When a later phase
 * introduces real data or a CMS, only this file changes.
 */

export const siteConfig = {
  name: "HireLens",
  tagline: "See Your Resume Through a Recruiter's Lens.",
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export type Feature = {
  /** Lucide icon name resolved by the consuming component. */
  icon: string;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: "ScanSearch",
    title: "Recruiter-Grade Review",
    description:
      "See your resume the way a hiring manager does — a clear, structured read of what lands and what gets skimmed.",
  },
  {
    icon: "Target",
    title: "ATS Compatibility",
    description:
      "Understand how applicant tracking systems parse your resume, with precise fixes to clear the first screen.",
  },
  {
    icon: "Gauge",
    title: "Section Scoring",
    description:
      "Every section is rated on clarity, impact, and relevance so you always know exactly what to refine next.",
  },
  {
    icon: "PenLine",
    title: "Sharper Phrasing",
    description:
      "Turn flat responsibilities into measurable achievements with concise, confident wording suggestions.",
  },
  {
    icon: "KeyRound",
    title: "Keyword Alignment",
    description:
      "Match your resume against a target role and surface the terms recruiters are actually searching for.",
  },
  {
    icon: "Lock",
    title: "Private by Design",
    description:
      "Your documents are processed securely and never shared. Your career data stays yours — always.",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "What file formats can I upload?",
    answer:
      "HireLens currently accepts PDF files. This keeps formatting consistent and ensures the most accurate read of your resume.",
  },
  {
    question: "How long does a review take?",
    answer:
      "Most resumes are reviewed in just a few seconds. You'll see a complete breakdown with scores and suggestions almost instantly.",
  },
  {
    question: "Is my resume data kept private?",
    answer:
      "Yes. Your resume is processed securely and is never shared with third parties or used to train models without your consent.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "You can try a review without signing up. Creating an account lets you save your results and track improvements over time.",
  },
  {
    question: "Which roles does HireLens support?",
    answer:
      "HireLens works across industries and seniority levels, from entry-level applications to senior and executive roles.",
  },
];

export const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
} as const;
