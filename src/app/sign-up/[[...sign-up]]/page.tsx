import { SignUp } from "@clerk/nextjs";

import { Logo } from "@/components/layout/logo";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <Logo />
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full flex justify-center",
            cardBox: "shadow-none border border-border rounded-xl",
          },
        }}
      />
    </main>
  );
}
