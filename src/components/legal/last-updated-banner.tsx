import { Clock } from "lucide-react";

/**
 * Small pill noting when a legal document was last revised. The date is passed
 * in as a pre-formatted string (never computed at render time) so server and
 * client output match exactly.
 */
function LastUpdatedBanner({ date }: { date: string }) {
  return (
    <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
      <Clock className="size-3.5" aria-hidden="true" />
      <span>Last updated: {date}</span>
    </p>
  );
}

export { LastUpdatedBanner };
