import React from "react";
import { Button } from "./primitives";
import { DashboardMock } from "./dashboard-mock";
import { ChatWindow } from "./chat-window";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="grid-markers" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="hero-copy">
        <div className="announcement">
          <span /> GMAIL + GOOGLE CALENDAR, TOGETHER
        </div>
        <h1>
          Your digital workspace,<em>one command away.</em>
        </h1>
        <p>
          Ask in plain English. nexus reads your email, checks your schedule,
          and gets things done, with your approval.
        </p>
        <div className="hero-actions">
          <Button href="/login" icon="arrow">Get early access</Button>
          <Button variant="outline" href="https://github.com" icon="github">
            View on GitHub
          </Button>
        </div>
        <div className="availability">
          GMAIL <i /> GOOGLE CALENDAR <i /> MORE COMING
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-glow" />
        <DashboardMock />
        <ChatWindow />
      </div>
    </section>
  );
}
