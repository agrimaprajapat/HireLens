import { CheckoutSuccess } from "@/components/billing/checkout-success";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Payment successful — HireLens",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  // Paddle appends `_ptxn` to the success URL; used only as a lookup key.
  searchParams: Promise<{ _ptxn?: string }>;
}) {
  const { _ptxn } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="max-w-xl py-20">
          <Card className="items-center gap-5 p-10 text-center">
            <CheckoutSuccess transactionId={_ptxn} />
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
