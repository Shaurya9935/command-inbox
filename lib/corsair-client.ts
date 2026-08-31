import { headers } from "next/headers";
import { auth } from "./auth";
import { corsair } from "./corsair";

export async function getCorsairTenant() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return corsair.withTenant(session.user.id);
}