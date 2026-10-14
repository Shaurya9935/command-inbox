import React from "react";
import { Icon } from "./icons";
import { ApprovalCard } from "./approval-card";
import { securityPoints } from "./mock-data";

export function SecuritySection() {
  return (
    <section className="security-section" id="security">
      <div className="section-wrap security-grid">
        <div className="security-copy">
          <span className="section-label">TRUST IS THE FOUNDATION</span>
          <h2>Your work stays yours.</h2>
          <p>
            nexus is designed around explicit permission. Nothing is sent,
            changed, or scheduled until you say so.
          </p>
          <div className="security-points">
            {securityPoints.map((point) => (
              <div key={point}>
                <span>
                  <Icon name="check" size={14} />
                </span>
                {point}
              </div>
            ))}
          </div>
        </div>
        <div className="security-card-wrap">
          <div className="secure-note">
            <Icon name="lock" size={15} /> Approval required
          </div>
          <ApprovalCard />
        </div>
      </div>
    </section>
  );
}
