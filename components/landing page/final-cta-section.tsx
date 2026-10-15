"use client";

import { useState } from "react";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      id="early-access"
      className="relative overflow-hidden px-5 py-28 text-center md:py-40"
    >
      <div className="cta-glow" />
      <div className="relative mx-auto max-w-3xl">
        <p className="mono-kicker">EARLY ACCESS</p>
        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
          Ready to run your day
          <br />
          from one place?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
          Join the early access list. We’ll send a single note when Nexus is
          ready for you.
        </p>
        <form
          className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setSubmitted(true);
          }}
        >
          <label htmlFor="email" className="sr-only">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="h-12 flex-1 rounded-xl border border-line bg-white px-4 text-sm outline-none transition-shadow placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          <button type="submit" className="button button-primary h-12 justify-center text-white">
            {submitted ? "You're on the list!" : "Get early access"}
          </button>
        </form>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
          No spam. No launch theatre. Just one useful email.
        </p>
      </div>
    </section>
  );
}
