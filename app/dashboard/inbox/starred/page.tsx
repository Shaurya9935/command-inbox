import { redirect } from "next/navigation";

export default function StarredPage() {
  redirect("/dashboard/inbox?folder=starred");
}
