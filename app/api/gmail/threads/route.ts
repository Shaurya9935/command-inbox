import { getInboxThreads } from "@/features/gmail/server";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const threads = await getInboxThreads();

        return NextResponse.json(threads);
    } catch(error) {
        console.error(error);

        return NextResponse.json(
            {error: "Failed to fetch Inbox"},
            {status: 500}
        )
    }
}