"use client";

import React, { useRef, useEffect, useState } from "react";
import { CommandIcon, MicIcon, ArrowUpIcon } from "./icons";

export interface CommandSurfaceProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function CommandSurface({
  value,
  onChange,
  onSubmit,
  placeholder = "What's on your mind?",
  className = "",
}: CommandSurfaceProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  // Global ⌘K / Ctrl+K listener to focus command surface
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
    }
  };

  return (
    <div
      className={className}
      style={{
        borderRadius: 14,
        border: focused
          ? "1.5px solid rgba(85,73,192,0.5)"
          : "1.5px solid #E4E0D8",
        background: "#FFFFFF",
        boxShadow: focused
          ? "0 0 0 4px rgba(85,73,192,0.09), 0 4px 24px rgba(0,0,0,0.07)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        transition: "border-color 0.18s, box-shadow 0.18s",
        marginBottom: 16,
      }}
    >
      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "18px 18px 10px",
        }}
      >
        <div
          style={{
            color: focused ? "#5549C0" : "#C5C0B8",
            paddingTop: 3,
            transition: "color 0.18s",
            flexShrink: 0,
            display: "flex",
          }}
        >
          <CommandIcon />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          rows={1}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            resize: "none",
            fontSize: 15,
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
            color: "#1A1917",
            lineHeight: 1.55,
            minHeight: 24,
            maxHeight: 140,
            overflowY: "auto",
          }}
        />
      </div>

      {/* Action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 18px 14px",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            color: "#C5C0B8",
            letterSpacing: "0.01em",
          }}
        >
          ⌘ K
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button
            type="button"
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid #E8E4DC",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C5C0B8",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F5F2EC";
              e.currentTarget.style.color = "#7B7775";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#C5C0B8";
            }}
          >
            <MicIcon />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: value.trim() ? "#5549C0" : "#EAE8F8",
              cursor: value.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: value.trim() ? "#FFF" : "#9B9691",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
