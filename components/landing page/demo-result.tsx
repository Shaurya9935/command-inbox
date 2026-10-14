import React from "react";
import { Icon } from "./icons";
import { Card, Badge } from "./primitives";
import { EmailList } from "./email-list";
import { demos } from "./mock-data";

export function DemoResult({ active }: { active: number }) {
  const item = demos[active] || demos[0];

  if (item.type === "email") {
    return (
      <Card className="result-card">
        <div className="result-heading">
          <div>
            <span>UNREAD SUMMARY</span>
            <strong>{item.label}</strong>
          </div>
          <Badge>Gmail</Badge>
        </div>
        <EmailList />
      </Card>
    );
  }

  if (item.type === "search") {
    return (
      <Card className="result-card">
        <div className="result-heading">
          <div>
            <span>UNIVERSAL SEARCH</span>
            <strong>{item.label}</strong>
          </div>
          <Badge>2 sources</Badge>
        </div>
        <div className="search-results">
          <div>
            <Icon name="inbox" />
            <span>
              <strong>Project Orion — launch checklist</strong>Latest thread
              with Maya Chen and 4 others
            </span>
            <time>EMAIL · TUE</time>
          </div>
          <div>
            <Icon name="calendar" />
            <span>
              <strong>Orion weekly review</strong>Tomorrow at 10:00 AM · Google
              Meet
            </span>
            <time>EVENT</time>
          </div>
          <div>
            <Icon name="inbox" />
            <span>
              <strong>Budget approval for Orion</strong>Attachment:
              Orion-budget-v3.pdf
            </span>
            <time>EMAIL · MAR 2</time>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="result-card">
      <div className="result-heading">
        <div>
          <span>YOUR DAY</span>
          <strong>{item.label}</strong>
        </div>
        <Badge>Calendar</Badge>
      </div>
      <div className="schedule">
        <time>9:30 AM</time>
        <i />
        <div>
          <strong>Weekly team sync</strong>
          <span>Google Meet · 30 min</span>
        </div>
        <time>1:00 PM</time>
        <i />
        <div>
          <strong>Product review</strong>
          <span>Conference room Atlas · 60 min</span>
        </div>
        <time>4:00 PM</time>
        <i />
        <div>
          <strong>Project check-in</strong>
          <span>With Alex Morgan · 30 min</span>
        </div>
      </div>
    </Card>
  );
}
