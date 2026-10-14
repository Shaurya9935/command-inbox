import {
  Navbar,
  HeroSection,
  CommandSection,
  FeaturesSection,
  HowItWorksSection,
  SecuritySection,
  IntegrationsSection,
  RoadmapSection,
  FinalCtaSection,
  Footer,
} from "@/components/landing page";

export default function Home() {
  return (
    <div className="landing-page" id="top">
      <Navbar />
      <main>
        <HeroSection />
        <CommandSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SecuritySection />
        <IntegrationsSection />
        <RoadmapSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
