import React from "react";
import { Icon } from "./icons";
import { WindowFrame, Logo, CommandBar } from "./primitives";

export function DashboardMock() {
  return (
    <WindowFrame title="nexus" className="dashboard-window">
      <div className="app-shell">
        <aside className="app-sidebar">
          <Logo />
          <button className="new-chat" type="button">
            <span>＋</span> New command
          </button>
          <small>WORKSPACES</small>
          <a href="#command">
            <Icon name="inbox" size={15} /> Gmail
          </a>
          <a href="#command">
            <Icon name="calendar" size={15} /> Calendar
          </a>
          <small>TOOLS</small>
          <a href="#features">
            <Icon name="search" size={15} /> Search
          </a>
          <a href="#security">
            <Icon name="lock" size={15} /> Permissions
          </a>
          <div className="app-user">
            <span className="avatar">S</span>
            <span>
              <strong>Sam Taylor</strong>
              <small>sam@example.com</small>
            </span>
          </div>
        </aside>
        <main className="app-main">
          <div className="app-date">
            MONDAY, MARCH 9 <span>● AI ASSISTANT ACTIVE</span>
          </div>
          <div className="app-content">
            <p className="eyebrow">GOOD MORNING, SAM</p>
            <h3>What would you like to take care of?</h3>
            <p>Your inbox and schedule, together in one calm place.</p>
            <CommandBar prompt="Ask about your email or schedule..." />
            <div className="suggestions">
              <span>SUGGESTED</span>
              <a href="#command">↗ Show emails I need to reply to</a>
              <a href="#command">↗ What’s on my calendar today?</a>
              <a href="#command">↗ Schedule a meeting with Alex</a>
            </div>
            <div className="focus-grid">
              <span>YOUR FOCUS</span>
              <div>
                <strong>12</strong> emails need attention
              </div>
              <div>
                <strong>3</strong> meetings today
              </div>
              <div>
                <strong>2</strong> drafts waiting
              </div>
              <div>
                <strong>4h</strong> until your next meeting
              </div>
            </div>
          </div>
        </main>
      </div>
    </WindowFrame>
  );
}
