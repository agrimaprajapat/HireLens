"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { GenerationGateState } from "@/components/credits/credits-provider";

/**
 * Inline notice shown beside a generate action when it's unavailable — either
 * because the user is signed out or has run out of credits. Renders nothing when
 * generation is allowed.
 */
function GenerationGate({ gate }: { gate: GenerationGateState }) {
  if (!gate.blocked) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">
        {gate.outOfCredits
          ? "You've used your free AI credits."
          : "Sign in to use AI generation."}
      </p>
      {gate.outOfCredits ? (
        <Button size="sm" asChild>
          <Link href="/pricing">Upgrade</Link>
        </Button>
      ) : (
        <Button size="sm" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      )}
    </div>
  );
}

export { GenerationGate };
