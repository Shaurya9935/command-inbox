import { DemoItem, IntegrationItem, TimelineItemData, HowStepData } from "./types";

export const mails: [string, string, string][] = [
  [
    "Maya Chen",
    "Q2 planning notes",
    "Could you review the timeline before tomorrow?",
  ],
  ["Alex Morgan", "Project check-in", "Are you free later today to catch up?"],
  [
    "Noah Williams",
    "Design handoff",
    "The final files are ready for your review.",
  ],
];

export const demos: DemoItem[] = [
  {
    prompt: "What meetings do I have tomorrow?",
    label: "Tomorrow · 3 meetings",
    type: "calendar",
  },
  {
    prompt: "Summarize unread emails from this week",
    label: "8 unread · summarized",
    type: "email",
  },
  {
    prompt: "Find everything about Project Orion",
    label: "14 results across email and calendar",
    type: "search",
  },
];

export const howSteps: HowStepData[] = [
  {
    number: "01",
    title: "Connect your accounts",
    copy: "Securely link Gmail and Google Calendar in a few clicks.",
  },
  {
    number: "02",
    title: "Say what you need",
    copy: "Ask a question or describe an action in plain English.",
  },
  {
    number: "03",
    title: "Review and approve",
    copy: "See every detail, then approve before anything changes.",
  },
];

export const securityPoints: string[] = [
  "You approve every send and every change",
  "Your data stays in your own database",
  "Minimal permissions, read-only by default",
  "Secure OAuth, no passwords stored",
];

export const integrations: IntegrationItem[] = [
  { mark: "M", name: "Gmail", live: true },
  { mark: "31", name: "Google Calendar", live: true },
  { mark: "S", name: "Slack", live: false },
  { mark: "N", name: "Notion", live: false },
  { mark: "GH", name: "GitHub", live: false },
  { mark: "L", name: "Linear", live: false },
  { mark: "O", name: "Outlook", live: false },
];

export const timelineItems: TimelineItemData[] = [
  {
    when: "NOW",
    title: "Write actions",
    copy: "Draft, schedule, and send with your approval.",
  },
  {
    when: "NEXT",
    title: "Universal search",
    copy: "One query across every connected workspace.",
  },
  {
    when: "LATER",
    title: "Meeting briefings",
    copy: "Arrive prepared with the right context.",
  },
  {
    when: "LATER",
    title: "Daily briefings",
    copy: "A quiet summary of what deserves attention.",
  },
];
