"use client";

import { useState, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useTheme, SunIcon, MoonIcon } from "@/components/theme";
import { Wordmark } from "./wordmark";
import { GithubIcon } from "./icons";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 60));

  const isDark = mounted && resolvedTheme === "dark";

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
          <Link
            href="/login"
            className="button button-secondary button-small text-[11px]"
          >
            Log in
          </Link>
          <a
            href="#early-access"
            className="button button-primary button-small text-white text-[11px]"
          >
            Get early access
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="icon-button focus-ring"
          >
            {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <a
            href="https://github.com/Shaurya9935/nexus"
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
