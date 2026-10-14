"use client";

import React, { useState } from "react";
import { Icon } from "./icons";
import { Logo, Button } from "./primitives";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav-shell">
      <nav className="nav">
        <Logo />
        <button
          className="mobile-menu"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name="menu" />
        </button>
        <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#security" onClick={() => setMenuOpen(false)}>Security</a>
          <a href="#roadmap" onClick={() => setMenuOpen(false)}>Roadmap</a>
        </div>
        <div className="nav-actions">
          <a
            className="github-link"
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View nexus on GitHub"
          >
            <Icon name="github" />
          </a>
          <Button href="/login">Launch App</Button>
        </div>
      </nav>
    </header>
  );
}
