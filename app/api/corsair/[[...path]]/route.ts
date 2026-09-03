import { NextResponse } from 'next/server';
import { toNextJsHandler } from 'corsair';
import { corsair } from '../../../../lib/corsair';

const handler = toNextJsHandler(corsair, {
  basePath: '/api/corsair',
});

export async function GET(request: Request) {
  try {
    return await handler.GET(request);
  } catch {
    // If hub is not configured (manual OAuth mode), return 200 OK so health checks / tunnels don't error with 503
    return NextResponse.json({ status: "ok", mode: "manual" });
  }
}

export async function POST(request: Request) {
  try {
    return await handler.POST(request);
  } catch {
    return NextResponse.json({ status: "ok", mode: "manual" });
  }
}

export async function OPTIONS(request: Request) {
  try {
    return await handler.OPTIONS(request);
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}