import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Centered, max-width content wrapper with responsive horizontal padding.
 * Used by every section to keep page gutters consistent.
 */
function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

export { Container };
