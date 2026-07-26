import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
  Badges: compact, hairline-bordered labels. The "brand" variant carries a small
  teal dot to signal a status without shouting.
*/
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-muted-foreground",
        brand: "border-border bg-card text-foreground",
        solid: "border-transparent bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  withDot = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { withDot?: boolean }) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    >
      {withDot && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-brand"
        />
      )}
      {props.children}
    </span>
  );
}

export { Badge, badgeVariants };
