// src/pages/llms.txt.ts
// Plain language summary of the site for language models, following the
// llms.txt convention. Generated from the content collections rather than
// written by hand so that adding a service page keeps this file current.
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

// The canonical production domain. Deliberately not derived from Astro.site,
// which points at github.io on the preview build; an assistant reading this
// file should always be sent to the live site.
const SITE = 'https://tlbelectric.ca';

const byOrder = (
  a: CollectionEntry<'services'> | CollectionEntry<'categories'>,
  b: CollectionEntry<'services'> | CollectionEntry<'categories'>,
) => a.data.order - b.data.order;

const link = (entry: CollectionEntry<'services'>) =>
  `- [${entry.data.h1}](${SITE}/${entry.id}): ${entry.data.metaDescription}`;

export const GET: APIRoute = async () => {
  const categories = (await getCollection('categories')).sort(byOrder);
  const all = await getCollection('services');

  const services = all.filter((e) => e.data.type === 'service').sort(byOrder);
  const geo = all.filter((e) => e.data.type === 'geo').sort(byOrder);

  const serviceSections: string[] = [];
  for (const cat of categories) {
    const inCategory = services.filter((s) => s.data.category === cat.id);
    if (inCategory.length === 0) continue;
    serviceSections.push(`### ${cat.data.h1}\n\n${inCategory.map(link).join('\n')}`);
  }

  const body = `# TLB Electric Inc.

> Licensed electrical contractor serving Moncton, Dieppe, Riverview and the surrounding Greater Moncton area of New Brunswick, Canada.

TLB Electric Inc. is a mobile electrical contractor, which means there is no storefront to visit and the work is carried out at the customer's home or business. The company covers residential and commercial wiring, electrical panel upgrades and replacements, EV charger installation, new construction and renovation electrical work, and emergency callouts. Quotes are free.

Phone: 506-875-5337
Email: info@TLBELECTRIC.ca
Service area: Moncton, Dieppe, Riverview, Shediac, Memramcook and surrounding communities in New Brunswick, Canada.

## Key pages

- [Home](${SITE}/): Overview of the company, its services, and customer reviews.
- [All services](${SITE}/services): Full directory of every service and service area page.
- [Privacy policy](${SITE}/privacy): How personal information from the quote form is handled.

## Services

${serviceSections.join('\n\n')}

## Service areas

${geo.map(link).join('\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
