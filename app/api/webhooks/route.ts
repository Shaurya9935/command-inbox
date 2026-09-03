import { processWebhook } from 'corsair';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { corsair } from '../../../lib/corsair';

export async function POST(request: NextRequest) {
    const url = new URL(request.url);

    const headers: Record<string, string> = {};

    request.headers.forEach((value, key) => {
        headers[key] = value;
    });

    const contentType = request.headers.get('content-type');

    let body: string | Record<string, unknown>;

    if (contentType?.includes('application/json')) {
        body = await request.json();
    } else {
        const text = await request.text();
        body = text && text.trim() ? text : {};
    }

    // Multi-tenancy: tenantId must come from ?tenantId= query param per https://docs.corsair.dev/concepts/multi-tenancy
    // Gmail webhook tenant is also resolved via email_address matcher, but query param takes precedence for isolation
    const tenantId = url.searchParams.get('tenantId') || url.searchParams.get('tenant_id');

    const result = await processWebhook(corsair, headers, body, {
        ...(tenantId ? { tenantId } : {}),
    });

    console.info(
        'Plugin Processed:',
        result.plugin,
        result.action
    );

    // Build response headers (e.g. Asana X-Hook-Secret handshake)
    const responseHeaders = result.responseHeaders;

    const nextHeaders = new Headers();

    if (responseHeaders) {
        for (const [key, value] of Object.entries(responseHeaders)) {
            nextHeaders.set(key, value);
        }
    }

    // Handle case where no webhook matched
    if (!result.response) {
        return NextResponse.json(
            {
                success: false,
                message: 'No matching webhook handler found',
            },
            { status: 404 }
        );
    }

    if (result.response !== undefined) {
        return NextResponse.json(result.response, {
            headers: nextHeaders,
        });
    }

    // Webhook processed successfully, no data to return to sender
    return new NextResponse(null, {
        status: 200,
        headers: nextHeaders,
    });
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Webhook endpoint is active',
        timestamp: new Date().toISOString(),
    });
}