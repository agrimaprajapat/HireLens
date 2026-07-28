import Link from "next/link";
import { XCircle } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Payment cancelled — HireLens",
};

export default function CheckoutCancelledPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-xl py-20">
          <Card className="items-center gap-5 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <XCircle className="size-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-medium tracking-tight">
                Payment cancelled
              </h1>
              <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                No credits were deducted and you weren&rsquo;t charged. You can
                safely try again whenever you&rsquo;re ready.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/pricing">Return to pricing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
