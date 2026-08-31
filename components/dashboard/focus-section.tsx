"use client";

import React from "react";
import { FocusItem, View } from "./types";
import { FOCUS_ITEMS } from "./mock-data";

export interface FocusSectionProps {
  items?: FocusItem[];
  onTriggerAction: (action: View) => void;
  className?: string;
}

export function FocusSection({
  items = FOCUS_ITEMS,
  onTriggerAction,
  className = "",
}: FocusSectionProps) {
  return (
    <div className={className} style={{ marginBottom: 44 }}>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.09em",
          color: "#B8B3AB",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        Your focus
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px 24px",
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onTriggerAction(item.action)}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 0",
              textAlign: "left",
              borderBottom: "1px solid #EDEAE4",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#C4BFF0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#EDEAE4")
            }
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1A1917",
                letterSpacing: "-0.04em",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                lineHeight: 1,
              }}
            >
              {item.count}
            </span>
            <span
              style={{
                fontSize: 13,
                color: "#7B7775",
                fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
