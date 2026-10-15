"use client";

import React from "react";
import { Email } from "../dashboard/types";
import { Avatar } from "../dashboard/avatar";
import { Dot } from "../dashboard/dot";
import { StarIcon } from "../dashboard/icons";

export interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onSelect: (email: Email) => void;
  onToggleStar?: (e: React.MouseEvent, id: string | number) => void;
  fadingOut?: boolean;
}

export function EmailListItem({
  email,
  isSelected,
  onSelect,
  onToggleStar,
  fadingOut = false,
}: EmailListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(email)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(email);
        }
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 20px",
        background: isSelected ? "#FFFFFF" : "transparent",
        borderBottom: "1px solid #EDEAE4",
        borderLeft: isSelected ? "3px solid #5549C0" : "3px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s, opacity 0.25s ease, transform 0.25s ease",
        opacity: fadingOut ? 0 : 1,
        transform: fadingOut ? "translateX(-12px)" : "none",
        boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
        userSelect: "none",
      }}
    >
      <Avatar initials={email.initials} color={email.color} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          {email.unread && <Dot color="#5549C0" size={5} />}
          <span
            style={{
              fontSize: 13,
              fontWeight: email.unread ? 600 : 500,
              color: isSelected ? "#5549C0" : "#1A1917",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email.from}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#B8B3AB",
              flexShrink: 0,
            }}
          >
            {email.time}
          </span>
          <button
            type="button"
            onClick={(e) => onToggleStar && onToggleStar(e, email.id)}
            title={email.starred ? "Starred" : "Not starred"}
            style={{
              background: "none",
              border: "none",
              padding: "0 2px",
              cursor: "pointer",
              color: email.starred ? "#F59E0B" : "#C5C0B9",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <StarIcon size={12} />
          </button>
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: email.unread ? 600 : 400,
            color: "#3D3C3A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}
        >
          {email.subject}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#9B9691",
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {email.preview}
        </div>
      </div>
    </div>
  );
}
