import React from "react";

export interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  className?: string;
}

export function Avatar({
  initials,
  color,
  size = 28,
  className = "",
}: AvatarProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size / 3.5),
        backgroundColor: `${color}22`,
        color,
        fontSize: Math.round(size * 0.32),
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        letterSpacing: "0.3px",
      }}
    >
      {initials}
    </div>
  );
}
