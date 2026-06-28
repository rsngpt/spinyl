import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spinyl.in';

export async function GET() {
  const body = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
