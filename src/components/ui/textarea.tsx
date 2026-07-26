import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Multiline text input styled to match the HireLens system: hairline border,
 * subtle focus ring, consistent radius. Used for pasting a job description.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-32 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm leading-relaxed shadow-none outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
