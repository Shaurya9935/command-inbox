import { DashboardView } from "@/components/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Command Inbox - Dashboard",
  description: "Your personal AI command center for email and calendar",
};

export default function DashboardPage() {
  return <DashboardView />;
}
