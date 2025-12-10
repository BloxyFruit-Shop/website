import { products } from '$server/api';

export async function GET() {
  const site = 'https://bloxyfruit.com';
  const pages = [
    '',
    '/store',
    '/contact',
    '/terms',
    '/privacy',
    '/faq'
  ];

  // Add dynamic game pages
  for (const game in products) {
    if (products[game].products && products[game].products.length > 0) {
      pages.push(`/store/${game}`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${site}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? 1.0 : 0.8}</priority>
  </url>
  `
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
}
