import React from "react";
import { Card, Badge } from "./primitives";
import { integrations } from "./mock-data";

export function IntegrationsSection() {
  return (
    <section className="section-wrap integrations-section">
      <div className="section-intro centered compact">
        <span className="section-label">INTEGRATIONS</span>
        <h2>Where your work already lives.</h2>
      </div>
      <div className="integration-grid">
        {integrations.map((item) => (
          <Card
            className={`integration ${!item.live ? "coming" : ""}`}
            key={item.name}
          >
            <span>{item.mark}</span>
            <strong>{item.name}</strong>
            <Badge muted={!item.live}>{item.live ? "Live" : "Soon"}</Badge>
          </Card>
        ))}
      </div>
    </section>
  );
}
