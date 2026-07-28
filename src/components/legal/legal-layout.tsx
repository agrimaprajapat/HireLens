import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";
import { LastUpdatedBanner } from "@/components/legal/last-updated-banner";
import { LegalToc } from "@/components/legal/legal-toc";

/** One numbered section of a legal document. `body` is free-form JSX. */
export interface LegalSection {
  /** Anchor id, also used by the table of contents. */
  id: string;
  /** Section heading (rendered as an <h2>). */
  heading: string;
  /** Section content — plain <p>/<ul>/<strong>/<a> markup, styled by the wrapper. */
  body: ReactNode;
}

export type LegalTocItem = Pick<LegalSection, "id" | "heading">;

/**
 * Shared typographic treatment for legal body copy. Applying descendant
 * utilities on the wrapper lets each page author content as plain semantic
 * markup (`<p>`, `<ul>`, `<strong>`, `<a>`) without repeating class names.
 */
const legalProse =
  "space-y-4 text-sm leading-relaxed text-muted-foreground " +
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand/80 " +
  "[&_strong]:font-medium [&_strong]:text-foreground " +
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-muted-foreground/50 " +
  "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 " +
  "[&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-foreground";

/**
 * Consistent scaffold for every legal page: shared Navbar/Footer, a title
 * header with an intro and last-updated banner, an auto-generated table of
 * contents, and the document's numbered sections. Keeps all four legal pages
 * visually identical and free of duplicated layout markup.
 */
function LegalLayout({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: ReactNode;
  updated: string;
  sections: LegalSection[];
}) {
  const tocItems: LegalTocItem[] = sections.map(({ id, heading }) => ({
    id,
    heading,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-4xl py-16 sm:py-20">
          <header>
            <span className="eyebrow">Legal</span>
            <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {intro}
            </p>
            <LastUpdatedBanner date={updated} />
          </header>

          <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <LegalToc items={tocItems} />
            </aside>

            <div className="space-y-12">
              {sections.map((section) => (
                <section key={section.id} aria-labelledby={section.id}>
                  <h2
                    id={section.id}
                    className="scroll-mt-24 font-display text-xl font-medium tracking-tight text-foreground"
                  >
                    {section.heading}
                  </h2>
                  <div className={`mt-4 ${legalProse}`}>{section.body}</div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export { LegalLayout };
