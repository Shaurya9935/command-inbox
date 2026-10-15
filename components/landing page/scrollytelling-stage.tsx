"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import type { BeatProps, SidebarItem } from "./types";
import { WindowFrame } from "./window-frame";
import {
  DashboardState,
  ResultsState,
  CalendarState,
  ApprovalState,
} from "./mock-states";

export function StateLayer({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: number[];
  children: ReactNode;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [12, 0, 0, -12]);
  return (
    <motion.div className="absolute inset-0" style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

export function CopyBeat({ progress, range, position, children }: BeatProps) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [20, 0, 0, -20]);
  return (
    <motion.div
      className={`copy-beat copy-beat--${position}`}
      style={{ opacity, y }}
    >
      {children}
    </motion.div>
  );
}

export function StagePinned() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 0.08, 0.86, 1],
    [0.95, 1, 1, 0.95]
  );
  const finalWindowY = useTransform(
    scrollYProgress,
    [0.78, 0.87, 1],
    [0, 140, 150]
  );
  const approvedProgress = useTransform(scrollYProgress, [0.72, 0.76], [0, 1]);
  const [approved, setApproved] = useState(false);
  const [approvalActive, setApprovalActive] = useState(false);
  const [sidebarActive, setSidebarActive] = useState<SidebarItem>("Inbox");

  useMotionValueEvent(approvedProgress, "change", (v) => setApproved(v > 0.5));
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setApprovalActive(v >= 0.58 && v < 0.84);
    setSidebarActive(
      v >= 0.61 && v < 0.83
        ? "Drafts"
        : v >= 0.34 && v < 0.61
        ? "Calendar"
        : "Inbox"
    );
  });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative hidden h-[350vh] md:block"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="technical-grid absolute inset-x-[4%] top-[12%] bottom-[7%] rounded-[28px]">
          <span className="corner corner-tl">+</span>
          <span className="corner corner-tr">+</span>
          <span className="corner corner-bl">+</span>
          <span className="corner corner-br">+</span>
        </div>
        <CopyBeat
          progress={scrollYProgress}
          range={[0, 0.04, 0.28, 0.34]}
          position="left"
        >
          <p className="mono-kicker">01 · COMMAND</p>
          <h2>Ask. Don’t navigate.</h2>
          <p>
            Type what you need. Nexus searches Gmail and Calendar and brings
            back the answer.
          </p>
        </CopyBeat>
        <CopyBeat
          progress={scrollYProgress}
          range={[0.28, 0.34, 0.55, 0.61]}
          position="right"
        >
          <p className="mono-kicker">02 · CONTEXT</p>
          <h2>Your day, already understood.</h2>
          <p>
            Meetings, deadlines and replies in one place, with live countdowns
            to what’s next.
          </p>
        </CopyBeat>
        <CopyBeat
          progress={scrollYProgress}
          range={[0.55, 0.61, 0.79, 0.85]}
          position="left"
        >
          <p className="mono-kicker">03 · APPROVAL</p>
          <h2>Nothing happens without you.</h2>
          <p>
            Review every email and invite before it goes out. One click to
            approve.
          </p>
        </CopyBeat>
        <CopyBeat
          progress={scrollYProgress}
          range={[0.79, 0.85, 0.98, 1]}
          position="center"
        >
          <p className="mono-kicker">YOUR DAY, CONNECTED</p>
          <h2>Stop switching apps.</h2>
          <div className="mt-5 flex justify-center gap-4">
            <a href="#early-access" className="button button-primary">
              Get early access
            </a>
            <a
              href="https://github.com"
              className="text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub →
            </a>
          </div>
          <p className="mono-footnote">
            Gmail and Google Calendar today. Slack, Notion and GitHub next.
          </p>
        </CopyBeat>

        <div className="stage-window-shell">
          <motion.div
            className="stage-window"
            style={{ scale, y: finalWindowY }}
          >
            <WindowFrame
              approvalActive={approvalActive}
              sidebarActive={sidebarActive}
            >
              <StateLayer
                progress={scrollYProgress}
                range={[0, 0.01, 0.07, 0.12]}
              >
                <DashboardState />
              </StateLayer>
              <StateLayer
                progress={scrollYProgress}
                range={[0.07, 0.12, 0.31, 0.37]}
              >
                <ResultsState />
              </StateLayer>
              <StateLayer
                progress={scrollYProgress}
                range={[0.31, 0.37, 0.58, 0.64]}
              >
                <CalendarState />
              </StateLayer>
              <StateLayer
                progress={scrollYProgress}
                range={[0.58, 0.64, 0.8, 0.86]}
              >
                <ApprovalState approved={approved} />
              </StateLayer>
              <StateLayer
                progress={scrollYProgress}
                range={[0.8, 0.86, 0.99, 1]}
              >
                <DashboardState />
              </StateLayer>
            </WindowFrame>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
