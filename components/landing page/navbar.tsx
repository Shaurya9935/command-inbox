"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { Wordmark } from "./wordmark";
import { GithubIcon } from "./icons";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 60));

  return (
    <header className={`nav-shell ${scrolled ? "nav-shell--scrolled" : ""}`}>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 md:px-8"
      >
        <a href="#" aria-label="Nexus home" className="rounded-lg focus-ring">
          <Wordmark />
        </a>
        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          {[
            "Features",
            "How it works",
            "Integrations",
            "Security",
            "Roadmap",
          ].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              className="transition-colors hover:text-ink focus-ring"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#early-access"
            className="button button-primary button-small"
          >
            Get early access
          </a>
          <a
            href="https://github.com"
            aria-label="View Nexus on GitHub"
            className="icon-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon />
          </a>
        </div>
      </nav>
    </header>
  );
}
