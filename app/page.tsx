"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Navbar,
  Hero,
  StagePinned,
  MobileStory,
  Features,
  Integrations,
  SecurityBand,
  FinalCTA,
  Footer,
} from "@/components/landing page";

export default function Home() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduce-motion",
      Boolean(reducedMotion)
    );
  }, [reducedMotion]);

  return (
    <div className="landing-page" id="top">
      <Navbar />
      <main>
        <Hero />
        <StagePinned />
        <MobileStory />
        <Features />
        <Integrations />
        <SecurityBand />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
