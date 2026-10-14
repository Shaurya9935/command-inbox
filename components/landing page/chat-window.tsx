import React from "react";
import { WindowFrame } from "./primitives";
import { EmailList } from "./email-list";
import { ApprovalCard } from "./approval-card";

export function ChatWindow() {
  return (
    <WindowFrame title="Ask nexus" className="chat-window">
      <div className="chat-body">
        <div className="chat-user">Show emails I need to reply to</div>
        <div className="chat-assistant">
          <span className="mini-mark">›</span>
          <div>
            <p>These three messages may need a reply:</p>
            <EmailList condensed />
          </div>
        </div>
        <div className="chat-user">
          Reply to Alex, I’m free at 4 PM, and put it on my calendar.
        </div>
        <ApprovalCard />
      </div>
    </WindowFrame>
  );
}
