import { auth } from "@/lib/auth";
import { corsair } from "@/lib/corsair";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const tenantId = session.user.id;

  const { connectUrl } = await corsair.manage.connect.createLink({
    plugin: "googlecalendar",
    tenantId,
  });

  return Response.json({ connectUrl });
}
