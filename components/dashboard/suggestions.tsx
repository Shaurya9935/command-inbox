"use client";

import React from "react";
import { SUGGESTIONS } from "./mock-data";

export interface SuggestionsProps {
  suggestions?: string[];
  onSelectSuggestion: (text: string) => void;
  className?: string;
}

export function Suggestions({
  suggestions = SUGGESTIONS,
  onSelectSuggestion,
  className = "",
}: SuggestionsProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        marginBottom: 48,
      }}
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelectSuggestion(suggestion)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "5px 2px",
            textAlign: "left",
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <span style={{ fontSize: 10, opacity: 0.5 }}>↗</span>
          {suggestion}
        </button>
      ))}
    </div>
  );
}
