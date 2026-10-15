"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function MiniInbox() {
  return (
    <div className="mini-ui">
      {["Priya Shah", "Marcus Chen", "Nora Bell"].map((name, i) => (
        <div className="mini-row" key={name}>
          <span className="mini-avatar">{name[0]}</span>
          <span>
            <strong>{name}</strong>
            <small>
              {["Project review", "Planning notes", "Launch checklist"][i]}
            </small>
          </span>
          <time>
            {9 + i}:2{i}
          </time>
        </div>
      ))}
    </div>
  );
}

export function MiniCalendar() {
  return (
    <div className="mini-calendar">
      <div className="mini-days">
        {["M", "T", "W", "T", "F"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mini-cal-grid">
        <i className="col-start-2 row-start-2">Review</i>
        <i className="col-start-4 row-start-3">Priya · 4 PM</i>
      </div>
    </div>
  );
}

export function MiniCommand() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full rounded-xl border border-accent/20 bg-white p-3 shadow-[0_10px_30px_rgba(80,70,184,.08)]">
        <p className="mono-label mb-3">⌘ K · ASK NEXUS</p>
        <p className="text-[11px]">
          What needs my attention today?
          <span className="ml-0.5 inline-block h-3 w-px bg-accent" />
        </p>
        <div className="mt-3 flex gap-1.5">
          <span className="chip">Search mail</span>
          <span className="chip">Check calendar</span>
        </div>
      </div>
    </div>
  );
}

export function FeatureCard({
  index,
  title,
  body,
  children,
}: {
  index: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: Number(index) * 0.08, duration: 0.55, ease }}
      viewport={{ once: true, margin: "-10%" }}
      className="feature-card"
    >
      <div className="mb-7 h-48 overflow-hidden rounded-xl border border-line bg-[#F8F7F4] p-4">
        {children}
      </div>
      <p className="mono-kicker">0{Number(index) + 1}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{body}</p>
    </motion.article>
  );
}

export function Features() {
  return (
    <section id="features" className="section-shell">
      <div className="section-heading">
        <p className="mono-kicker">ONE CALM WORKSPACE</p>
        <h2>
          Everything that needs your attention.
          <br />
          Nothing that doesn’t.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          index="0"
          title="Unified inbox"
          body="The threads that need you, prioritized across every connected account."
        >
          <MiniInbox />
        </FeatureCard>
        <FeatureCard
          index="1"
          title="Calendar that listens"
          body="See the shape of your week and make changes in natural language."
        >
          <MiniCalendar />
        </FeatureCard>
        <FeatureCard
          index="2"
          title="Command surface"
          body="Search, understand and act without opening another tab."
        >
          <MiniCommand />
        </FeatureCard>
      </div>
    </section>
  );
}
