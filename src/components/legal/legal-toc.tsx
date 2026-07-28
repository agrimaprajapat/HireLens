import type { LegalTocItem } from "@/components/legal/legal-layout";

/**
 * "On this page" anchor navigation for a legal document. Rendered as a bordered
 * card that becomes a sticky sidebar on large screens. Purely in-page anchors,
 * so it is keyboard-navigable and needs no client JavaScript.
 */
function LegalToc({ items }: { items: LegalTocItem[] }) {
  return (
    <nav
      aria-label="On this page"
      className="rounded-lg border border-border bg-secondary/30 p-5"
    >
      <h2 className="eyebrow">On this page</h2>
      <ol className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-2.5 text-sm leading-snug">
            <span className="tabular-nums text-muted-foreground/60">
              {index + 1}.
            </span>
            <a
              href={`#${item.id}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { LegalToc };
