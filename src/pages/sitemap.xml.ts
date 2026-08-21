// src/pages/sitemap.xml.ts
// Alias for the sitemap index at the conventional /sitemap.xml path.
//
// @astrojs/sitemap emits /sitemap-index.xml, and robots.txt points there, which is
// correct and sufficient for Google. But plenty of crawlers, and most third-party
// SEO auditors, probe /sitemap.xml directly without reading robots.txt first. That
// path had nothing behind it, which is how an external audit concluded this site
// served an "empty sitemap" while sitemap-0.xml in fact listed every page.
//
// This emits a real sitemapindex (not an HTML redirect, which would hand an XML
// consumer a text/html body) pointing at the same generated sitemap-0.xml. Listing
// one sitemap from two index files is explicitly allowed and de-duplicates on
// Google's side, since both resolve to the same set of URLs.
import type { APIRoute } from 'astro';

const SITE = 'https://tlbelectric.ca';

export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE}/sitemap-0.xml</loc></sitemap>
</sitemapindex>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
