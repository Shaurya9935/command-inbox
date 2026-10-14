export type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "chevron"
  | "github"
  | "inbox"
  | "lock"
  | "menu"
  | "search"
  | "send";

export interface DemoItem {
  prompt: string;
  label: string;
  type: "calendar" | "email" | "search";
}

export interface IntegrationItem {
  mark: string;
  name: string;
  live: boolean;
}

export interface TimelineItemData {
  when: string;
  title: string;
  copy: string;
}

export interface HowStepData {
  number: string;
  title: string;
  copy: string;
}
