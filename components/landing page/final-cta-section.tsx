import React from "react";
import { EmailCapture } from "./email-capture";

export function FinalCtaSection() {
  return (
    <section className="final-cta" id="access">
      <div className="cta-mark">›</div>
      <span className="section-label">A CALMER WAY TO WORK</span>
      <h2>Stop switching apps.</h2>
      <p>
        Join the early access list and be among the first to put your inbox and
        calendar in one command.
      </p>
      <EmailCapture />
      <small>NO SPAM. JUST PRODUCT UPDATES AND EARLY ACCESS.</small>
    </section>
  );
}
