import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { footerLinks, siteConfig } from "@/lib/site-config";

/**
 * Site footer with brand blurb and grouped navigation columns.
 */
function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Resume review that sees what recruiters see — so you can refine
              with confidence.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {group}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
