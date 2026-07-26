import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

/**
 * HireLens mark — a geometric camera aperture / lens.
 * An ink frame holds a hairline aperture ring, a teal focal point, and a single
 * catch-light. Uses design tokens so it stays consistent with the system.
 */
function LensMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8.5"
        className="fill-primary"
      />
      <circle
        cx="16"
        cy="16"
        r="8.25"
        className="stroke-primary-foreground/25"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="3.75" className="fill-brand" />
      <circle
        cx="13.1"
        cy="13.1"
        r="1.15"
        className="fill-primary-foreground/90"
      />
    </svg>
  );
}

/**
 * Full lockup: lens mark beside the HireLens wordmark. Links to the top.
 */
function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="#top"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        "group flex items-center gap-2.5 rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <LensMark className="size-7 transition-transform duration-300 group-hover:scale-[1.04]" />
      <span className="text-[1.0625rem] font-semibold tracking-tight text-foreground">
        Hire<span className="text-muted-foreground">Lens</span>
      </span>
    </Link>
  );
}

export { Logo, LensMark };
