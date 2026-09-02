import { DashboardView } from "@/components/dashboard";
import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Command Inbox - Dashboard",
  description: "Your personal AI command center for email and calendar",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  const initialUser = user
    ? {
        name: user.name || user.email.split("@")[0],
        email: user.email,
        initials: (user.name || user.email)
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        color: "#5549C0",
      }
    : undefined;

  return <DashboardView initialUser={initialUser} />;
}
