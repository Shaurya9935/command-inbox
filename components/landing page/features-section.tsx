import React from "react";
import { Card } from "./primitives";
import { MiniInbox, MiniCalendar, MiniChat } from "./mini-uis";

export function FeaturesSection() {
  return (
    <section className="section-wrap features-section" id="features">
      <div className="section-intro split-intro">
        <div>
          <span className="section-label">ONE QUIET WORKSPACE</span>
          <h2>
            Everything you need.
            <br />
            Nothing you don’t.
          </h2>
        </div>
        <p>
          Less switching, fewer distractions. nexus brings the essential parts
          of your day into one thoughtful interface.
        </p>
      </div>
      <div className="feature-grid">
        <Card className="feature-card">
          <MiniInbox />
          <div className="feature-copy">
            <span>01</span>
            <h3>Unified inbox</h3>
            <p>
              Search messages, read threads, and find what needs your
              attention—without opening another tab.
            </p>
          </div>
        </Card>
        <Card className="feature-card">
          <MiniCalendar />
          <div className="feature-copy">
            <span>02</span>
            <h3>Calendar that listens</h3>
            <p>
              Ask what’s next, find a free slot, or prepare an event using
              everyday language.
            </p>
          </div>
        </Card>
        <Card className="feature-card">
          <MiniChat />
          <div className="feature-copy">
            <span>03</span>
            <h3>Ask, don’t navigate</h3>
            <p>
              Say what you need. nexus gathers context across your work and gives
              you a clear next step.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
