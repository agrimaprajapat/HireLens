import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { ResumeWorkspace } from "@/components/sections/resume-workspace";
import { FeaturesSection } from "@/components/sections/features-section";
import { FaqSection } from "@/components/sections/faq-section";

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ResumeWorkspace />
        <FeaturesSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
