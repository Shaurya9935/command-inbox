import React from "react";
import { Logo } from "./primitives";

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <Logo inverted />
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#roadmap">Roadmap</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <span>© 2026 nexus</span>
      </div>
    </footer>
  );
}
