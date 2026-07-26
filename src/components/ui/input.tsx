import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Single-line text input styled to match the HireLens system: hairline border,
 * subtle focus ring, consistent radius.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
