export interface TourStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  body: string;
  targetSelector?: string;
  targetKey?: "command-bar" | "connect-apps" | "gmail" | "calendar" | "assistant" | "account";
  isWelcome?: boolean;
  isFinish?: boolean;
  showConnectedChip?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    stepNumber: 1,
    totalSteps: 7,
    title: "Welcome to Nexus.",
    body: "A 60-second tour of how everything fits together.",
    isWelcome: true,
  },
  {
    id: "command-bar",
    stepNumber: 2,
    totalSteps: 7,
    title: "Start here.",
    body: "Type what you need in plain English: 'Show emails I need to reply to', 'What\'s on my calendar today?'",
    targetSelector: '[data-tour="command-bar"]',
    targetKey: "command-bar",
  },
  {
    id: "connect-apps",
    stepNumber: 3,
    totalSteps: 7,
    title: "Connect your accounts.",
    body: "Link Gmail and Google Calendar to get started. More apps are coming soon.",
    targetSelector: '[data-tour="connect-apps"]',
    targetKey: "connect-apps",
    showConnectedChip: true,
  },
  {
    id: "gmail",
    stepNumber: 4,
    totalSteps: 7,
    title: "Your inbox, in one place.",
    body: "Search, star, and read threads, with folders for Inbox, Starred, Drafts and Sent.",
    targetSelector: '[data-tour="gmail"]',
    targetKey: "gmail",
  },
  {
    id: "calendar",
    stepNumber: 5,
    totalSteps: 7,
    title: "Your schedule, one click away.",
    body: "Week, day, month and agenda views, synced from Google Calendar.",
    targetSelector: '[data-tour="calendar"]',
    targetKey: "calendar",
  },
  {
    id: "assistant",
    stepNumber: 6,
    totalSteps: 7,
    title: "Nothing happens without you.",
    body: "Before Nexus sends an email or changes an event, you'll get an approval card to review.",
    targetSelector: '[data-tour="assistant"]',
    targetKey: "assistant",
  },
  {
    id: "account",
    stepNumber: 7,
    totalSteps: 7,
    title: "Your account and your data.",
    body: "Manage connected apps, your profile and password, and delete your data any time from Account.",
    targetSelector: '[data-tour="account"]',
    targetKey: "account",
    isFinish: true,
  },
];
