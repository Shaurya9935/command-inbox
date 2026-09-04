export type AppCategory = "all" | "email" | "calendar" | "communication" | "productivity";

export interface IntegrationApp {
  id: string;
  pluginName?: string;
  name: string;
  tagline: string;
  description: string;
  category: "email" | "calendar" | "communication" | "productivity";
  categoryLabel: string;
  connected: boolean;
  connectedEmail?: string;
  connectedAccountName?: string;
  lastSyncedAt?: string;
  capabilities: string[];
  permissions: string[];
  accentColor: string;
  bgAccent: string;
  badge?: string;
  canRealConnect: boolean;
  connectEndpoint?: string;
  docsUrl?: string;
}

export interface ConnectUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}
