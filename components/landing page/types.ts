import type { ReactNode } from "react";
import type { MotionValue } from "framer-motion";

export type SidebarItem =
  | "Inbox"
  | "Calendar"
  | "Drafts"
  | "Search"
  | "Commands"
  | "Connections";

export interface SignalPath {
  id: string;
  d: string;
  duration: number;
  delay: number;
  side: "left" | "right";
  tertiary?: boolean;
}

export interface BeatProps {
  progress: MotionValue<number>;
  range: number[];
  position: "hero" | "left" | "right" | "center";
  children: ReactNode;
}
