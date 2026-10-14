import React, { ReactNode } from "react";
import { Icon } from "./icons";
import { IconName } from "./types";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <a
      className={`logo ${inverted ? "logo-inverted" : ""}`}
      href="#top"
      aria-label="nexus home"
    >
      <span className="logo-mark">
        <Icon name="chevron" size={15} />
      </span>
      <span>nexus</span>
    </a>
  );
}

export function Button({
  children,
  href = "#access",
  variant = "primary",
  icon,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "light" | "ghost";
  icon?: IconName;
}) {
  return (
    <a className={`button button-${variant}`} href={href}>
      {children}
      {icon && <Icon name={icon} size={16} />}
    </a>
  );
}

export function Badge({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span className={`badge ${muted ? "badge-muted" : ""}`}>{children}</span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function WindowFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`window ${className}`}>
      <div className="window-bar">
        <div className="traffic-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>{title}</span>
        <span className="window-status">
          <i /> Connected
        </span>
      </div>
      {children}
    </div>
  );
}

export function CommandBar({
  prompt,
  large = false,
}: {
  prompt: string;
  large?: boolean;
}) {
  return (
    <div className={`command-bar ${large ? "command-bar-large" : ""}`}>
      <span className="command-spark">›</span>
      <span className="command-text">{prompt}</span>
      <kbd>⌘K</kbd>
      <span className="command-send">
        <Icon name="arrow" size={17} />
      </span>
    </div>
  );
}
