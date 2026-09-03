import { redirect } from "next/navigation";
import { corsair } from "@/lib/corsair";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ConnectClient } from "./connect-client";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;

  // Manual OAuth: Hub-less flow - /connect?state=... -> resolve to Google OAuth URL
  if (state) {
    let oauthUrl: string | null = null;
    try {
      const result = await corsair.manage.connect.resolve(state);
      oauthUrl = result.oauthUrl;
    } catch (err) {
      // Next redirect throws NEXT_REDIRECT - let it bubble, don't catch
      const digest = (err as unknown as { digest?: string })?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw err;
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      const message = err instanceof Error ? err.message : String(err);
      return (
        <AuthLayout>
          <div className="flex flex-col items-center text-center">
            <div className="w-full p-3 rounded-[7px] bg-[#FEF2F2] border border-[#FCA5A5] text-[12px] text-[#B91C1C] mb-4">
              Failed to resolve OAuth: {message}
            </div>
            <a href="/connect" className="text-[13px] text-[#5549C0] underline">
              Back to connect
            </a>
          </div>
        </AuthLayout>
      );
    }
    if (oauthUrl) redirect(oauthUrl);
  }

  return <ConnectClient />;
}
