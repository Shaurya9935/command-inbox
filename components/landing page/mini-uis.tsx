import React from "react";
import { Icon } from "./icons";
import { EmailList } from "./email-list";

export function MiniInbox() {
  return (
    <div className="mini-ui inbox-ui">
      <div className="mini-toolbar">
        <span>Inbox</span>
        <span>12 unread</span>
      </div>
      <EmailList condensed />
    </div>
  );
}

export function MiniCalendar() {
  const days = ["MON 9", "TUE 10", "WED 11", "THU 12", "FRI 13"];
  return (
    <div className="mini-ui calendar-ui">
      <div className="mini-toolbar">
        <span>March 9–13</span>
        <span>Week</span>
      </div>
      <div className="calendar-days">
        {days.map((day, index) => (
          <span className={index === 2 ? "active" : ""} key={day}>
            {day}
          </span>
        ))}
      </div>
      <div className="calendar-slots">
        <time>9 AM</time>
        <div className="event event-one">
          <strong>Team sync</strong>
          <span>Google Meet</span>
        </div>
        <time>11 AM</time>
        <div className="event event-two">
          <strong>Project review</strong>
          <span>11:00–12:00</span>
        </div>
        <time>2 PM</time>
        <div className="event event-three">
          <strong>Focus time</strong>
          <span>2:00–3:30</span>
        </div>
      </div>
    </div>
  );
}

export function MiniChat() {
  return (
    <div className="mini-ui mini-chat">
      <div className="mini-toolbar">
        <span>New command</span>
        <span>● Active</span>
      </div>
      <div className="mini-chat-body">
        <div className="chat-user">Move my 2 PM meeting to tomorrow.</div>
        <div className="mini-reply">
          <span className="mini-mark">›</span>
          <p>
            I found one meeting. I’ll check Alex’s availability before making
            any changes.
          </p>
        </div>
        <div className="mini-action">
          <Icon name="calendar" size={14} />
          <span>
            <strong>Product review</strong>Tomorrow, 2:00 PM
          </span>
          <button type="button">Approve</button>
        </div>
      </div>
    </div>
  );
}
