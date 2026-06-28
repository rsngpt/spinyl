import { NextResponse } from 'next/server';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spinyl.in';
const lastmod = new Date().toISOString().split('T')[0];

const urls = [
  '/',
  '/boiler-room',
  '/welcome',
  '/search',
  '/privacy',
  '/terms',
];

function createUrlEntry(path: string) {
  return `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
}

export async function GET() {
  const urlEntries = urls.map(createUrlEntry).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
