import React from "react";
import { howSteps } from "./mock-data";

export function HowItWorksSection() {
  return (
    <section className="how-section" id="how">
      <div className="section-wrap">
        <div className="section-intro centered compact">
          <span className="section-label">HOW IT WORKS</span>
          <h2>From intent to done.</h2>
        </div>
        <div className="steps">
          {howSteps.map((step) => (
            <div className="step" key={step.number}>
              <span>{step.number}</span>
              <i />
              <div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
