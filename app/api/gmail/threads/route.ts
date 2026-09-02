import { getInboxThreads } from "@/features/gmail/server";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const threads = await getInboxThreads();

        return NextResponse.json(threads);
    } catch(error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message === "Unauthorized") {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        console.error(error);

        return NextResponse.json(
            {error: "Failed to fetch Inbox"},
            {status: 500}
        )
    }
}