"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary. Rendered inside the root layout, so it stays within the
 * HireLens design system. Offers a retry (via `reset`) and a way home.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo />
      <div>
        <span className="eyebrow">Something went wrong</span>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-tight">
          An unexpected error occurred
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Please try again. If the problem keeps happening, head back home and
          give it another go in a moment.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
