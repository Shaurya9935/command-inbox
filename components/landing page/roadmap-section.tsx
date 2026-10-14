import React from "react";
import { timelineItems } from "./mock-data";

export function RoadmapSection() {
  return (
    <section className="roadmap-section" id="roadmap">
      <div className="section-wrap roadmap-grid">
        <div className="section-intro">
          <span className="section-label">WHAT’S NEXT</span>
          <h2>
            A more capable command center, one careful step at a time.
          </h2>
        </div>
        <div className="timeline">
          {timelineItems.map((item, index) => (
            <div className="timeline-item" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{item.when}</small>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
