import { NextRequest, NextResponse } from 'next/server';
import { REDIRECT_CONFIG } from '@/app/config/redirects';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Remove the /api/redirect prefix to get the actual path
    const actualPath = path.replace('/api/redirect', '');

    // Check if we have a redirect configured for this path
    const targetUrl = REDIRECT_CONFIG[actualPath as keyof typeof REDIRECT_CONFIG];

    if (targetUrl) {
        // Redirect to the target URL
        return NextResponse.redirect(targetUrl, 302);
    }

    // If no redirect is configured, return a 404
    return NextResponse.json(
        { error: 'Redirect not found' },
        { status: 404 }
    );
}
