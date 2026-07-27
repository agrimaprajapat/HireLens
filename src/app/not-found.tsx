import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

/**
 * 404 page, styled to match the HireLens design system.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo />
      <div>
        <span className="eyebrow">404</span>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-tight">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have
          moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
