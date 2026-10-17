import { auth } from "@/lib/auth";
import { corsair } from "@/lib/corsair";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
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
      plugin: "gmail",
      tenantId,
    });

    return Response.json({ connectUrl });
  } catch (err) {
    log.error("[integrations/gmail/connect] Error creating connect link", { error: err });
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}