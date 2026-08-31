import React from "react";

export interface DotProps {
  color: string;
  size?: number;
  className?: string;
}

export function Dot({ color, size = 6, className = "" }: DotProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
}
