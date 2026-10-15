"use client";

import { motion } from "framer-motion";
import { WindowFrame } from "./window-frame";
import {
  DashboardState,
  ResultsState,
  CalendarState,
  ApprovalState,
} from "./mock-states";

const mobileBeats = [
  {
    kicker: "01 · COMMAND",
    title: "Ask. Don’t navigate.",
    body: "Type what you need. Nexus searches Gmail and Calendar and brings back the answer.",
    state: <ResultsState />,
  },
  {
    kicker: "02 · CONTEXT",
    title: "Your day, already understood.",
    body: "Meetings, deadlines and replies in one place, with live countdowns to what’s next.",
    state: <CalendarState />,
  },
  {
    kicker: "03 · APPROVAL",
    title: "Nothing happens without you.",
    body: "Review every email and invite before it goes out. One click to approve.",
    state: <ApprovalState />,
  },
];

export function MobileStory() {
  return (
    <section id="how-it-works-mobile" className="px-5 pb-24 pt-8 md:hidden">
      <WindowFrame>
        <DashboardState />
      </WindowFrame>
      {mobileBeats.map((beat) => (
        <motion.article
          key={beat.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          className="py-20"
        >
          <p className="mono-kicker">{beat.kicker}</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
            {beat.title}
          </h2>
          <p className="mb-8 mt-3 text-base leading-relaxed text-muted">
            {beat.body}
          </p>
          <WindowFrame
            approvalActive={beat.title.includes("Nothing")}
            sidebarActive={
              beat.title.includes("Calendar") ||
              beat.title.includes("understood")
                ? "Calendar"
                : beat.title.includes("Nothing")
                ? "Drafts"
                : "Inbox"
            }
          >
            {beat.state}
          </WindowFrame>
        </motion.article>
      ))}
    </section>
  );
}
