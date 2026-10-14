import React from "react";
import { mails } from "./mock-data";

export function EmailList({ condensed = false }: { condensed?: boolean }) {
  return (
    <div className={`email-list ${condensed ? "email-condensed" : ""}`}>
      {mails.map(([sender, subject, snippet], index) => (
        <div className="email-row" key={sender}>
          <span className="avatar">{sender.charAt(0)}</span>
          <div>
            <strong>{sender}</strong>
            <span>{subject}</span>
            {!condensed && <p>{snippet}</p>}
          </div>
          <time>{index === 0 ? "9:42" : index === 1 ? "8:15" : "MON"}</time>
        </div>
      ))}
    </div>
  );
}
