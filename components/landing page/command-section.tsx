"use client";

import React, { useState, useEffect } from "react";
import { CommandBar } from "./primitives";
import { DemoResult } from "./demo-result";
import { demos } from "./mock-data";

export function CommandSection() {
  const [activeDemo, setActiveDemo] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveDemo((current) => (current + 1) % demos.length),
      4800
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="command-section" id="command">
      <div className="section-wrap command-wrap">
        <div className="section-intro centered">
          <span className="section-label">THE COMMAND LINE</span>
          <h2>One input. Every answer.</h2>
          <p>
            Your work doesn’t live in tabs. Ask once and nexus finds the right
            context, wherever it is.
          </p>
        </div>
        <div className="command-demo">
          <CommandBar large prompt={demos[activeDemo].prompt} />
          <div className="demo-tabs">
            {demos.map((demo, index) => (
              <button
                className={activeDemo === index ? "active" : ""}
                type="button"
                onClick={() => setActiveDemo(index)}
                key={demo.prompt}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {demo.prompt}
              </button>
            ))}
          </div>
          <div className="result-swap" key={activeDemo}>
            <DemoResult active={activeDemo} />
          </div>
        </div>
      </div>
    </section>
  );
}
