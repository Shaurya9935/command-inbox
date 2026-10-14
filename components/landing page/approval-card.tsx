import React from "react";
import { Icon } from "./icons";
import { Card } from "./primitives";

export function ApprovalCard({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={`approval-card ${compact ? "approval-compact" : ""}`}>
      <div className="approval-head">
        <span className="approval-check">
          <Icon name="check" size={14} />
        </span>
        <div>
          <strong>Ready for your approval</strong>
          <p>Email and calendar event</p>
        </div>
      </div>
      <div className="approval-fields">
        <div>
          <span>TO</span>
          <strong>Alex Morgan · alex@acme.co</strong>
        </div>
        {!compact && (
          <>
            <div>
              <span>SUBJECT</span>
              <strong>Re: Project check-in</strong>
            </div>
            <p>
              Hi Alex, I’m free at 4 PM today. I’ve added it to our calendars.
            </p>
          </>
        )}
        <div className="event-chip">
          <Icon name="calendar" size={15} />
          <span>
            <strong>Project check-in</strong>
            Today, 4:00–4:30 PM
          </span>
        </div>
      </div>
      <div className="approval-actions">
        <button type="button">Approve</button>
        <button type="button">Edit</button>
      </div>
    </Card>
  );
}
