"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

import { useCredits } from "@/components/credits/credits-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/layout/logo";
import { navLinks } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Small pill showing the remaining credit balance. */
function CreditsPill({ credits }: { credits: number }) {
  return (
    <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
      {credits} {credits === 1 ? "credit" : "credits"}
    </span>
  );
}

/**
 * Sticky top navigation on a paper-toned, blurred surface with a hairline base.
 * Collapses into a toggleable panel on small screens.
 */
function Navbar() {
  const [open, setOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { credits } = useCredits();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <Container>
        <nav
          className="flex h-16 items-center justify-between"
          aria-label="Main"
        >
          <Logo />

          {/* Desktop links */}
          <ul className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoaded && !isSignedIn && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
            {isLoaded && isSignedIn && (
              <>
                {credits !== null && <CreditsPill credits={credits} />}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-border/70 transition-[max-height] duration-300 ease-out md:hidden",
          open ? "max-h-96 border-t" : "max-h-0"
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border/70 pt-4">
            {isLoaded && !isSignedIn && (
              <>
                <Button variant="outline" asChild>
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up" onClick={() => setOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
            {isLoaded && isSignedIn && (
              <>
                {credits !== null && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {credits} {credits === 1 ? "credit" : "credits"} remaining
                  </div>
                )}
                <Button asChild>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              </>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}

export { Navbar };
