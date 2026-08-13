# TLB Electric Core 30 SEO Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the current single-page Astro site (`TLBWebsite - Development`) into a 33-page "Core 30" SEO structure (homepage + 4 category pages + 25 service pages + 3 geo pages), driven by Astro Content Collections, matching `TLB_Electric_Core30_SEO_Structure.docx` verbatim for all titles/H1s/meta/keywords, while keeping the existing brand (colors, logo, fonts, header/footer chrome) unchanged. Also produce a GBP-alignment TXT deliverable.

**Architecture:** Two Astro Content Collections (`categories`, `services`) hold per-page metadata and copy. Two shared layouts (`CategoryLayout`, `ServiceLayout`) render every category/service/geo page from a single dynamic route (`src/pages/[slug].astro`). Small shared components (breadcrumbs, hero band, trust badges, image slot, related links) are reused across every page so there is exactly one place to fix formatting bugs. The existing homepage (`src/pages/index.astro`) is edited in place, not replaced.

**Tech Stack:** Astro 6.4 (Content Layer API — `defineCollection` + `glob` loader), Zod schema validation, `@astrojs/sitemap` (already installed), no client-side framework, plain CSS in `.astro` files matching existing conventions.

## Global Constraints

- Brand must not change: colors `--red: #d52c3c`, `--red-dark: #b8232f`, `--charcoal: #363436`, `--charcoal-light: #4a484a`, fonts `Montserrat` (headings) / `Inter` (body), and the existing logo files (`tlb_altered.svg`, `logo-light.svg`, `logo-dark.svg`) are reused as-is — no new colors, fonts, or logo variants.
- All URLs, `<title>` tags, H1s, meta descriptions, and target keywords for the 4 categories and 25 services must match `TLB_Electric_Core30_SEO_Structure.docx` **verbatim** — copied exactly, not paraphrased. The exact values are reproduced in Tasks 7–10 below.
- The 3 geo pages (`/electrician-dieppe-nb`, `/electrician-riverview-nb`, `/emergency-electrician-dieppe-nb`) are new content not in the DOCX — draft with genuine neighbourhood/landmark detail per the DOCX's Section 7 guidance, not templated city-name swaps.
- No public street address anywhere (schema, Maps embed, footer) — service-area-only model, per user decision. `areaServed` schema only, no `PostalAddress.streetAddress`.
- No stock photography or fabricated customer photos — use the shared `ImageSlot` placeholder component everywhere a real project photo will eventually go.
- **No git commits during this work** — the user explicitly declined per-task commits. Do not run `git add` / `git commit` / `git push` at any point in this plan. Verification steps use build/dev-server checks only.
- Internal linking is strict-silo: a service page only links to its parent category and same-silo related services; a category page links to homepage + its own child services; never cross-silo links.
- NAP (Name/Address/Phone) already correct site-wide: phone `506-875-5337` / `+15068755337`, email `info@TLBELECTRIC.ca`, site `https://tlbelectric.ca` — reuse these exact values, do not alter.

---

## Task 1: Content Collections Schema & Scaffold

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/categories/panel-upgrades-moncton.md` (sample entry, real final content — this is category 3, done here so Task 3 has something real to render against)
- Create: `src/content/services/electrical-panel-upgrade-moncton.md` (sample entry, real final content — first service of silo 3)

**Interfaces:**
- Produces: `categories` collection with schema `{ title: string, h1: string, metaDescription: string, targetKeyword: string, order: number }`.
- Produces: `services` collection with schema `{ title: string, h1: string, metaDescription: string, targetKeyword: string, category: string, type: 'service' | 'geo' (default 'service'), relatedServices: string[] (default []), intro: string, whatsIncluded: string[], localRelevance: string (optional), order: number }`. Entry `id` (from filename, no extension) is the URL slug for both collections.

- [ ] **Step 1: Write the collections config**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    targetKeyword: z.string(),
    order: z.number(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    metaDescription: z.string(),
    targetKeyword: z.string(),
    category: z.string(),
    type: z.enum(['service', 'geo']).default('service'),
    relatedServices: z.array(z.string()).default([]),
    intro: z.string(),
    whatsIncluded: z.array(z.string()),
    localRelevance: z.string().optional(),
    order: z.number(),
  }),
});

export const collections = { categories, services };
```

- [ ] **Step 2: Create the sample category file**

```markdown
---
title: "Electrical Panel Upgrades in Moncton, NB | TLB Electric"
h1: "Electrical Panel & Power Upgrade Services"
metaDescription: "Licensed panel upgrades, Federal Pioneer replacement, generator hookups and surge protection in Moncton, Dieppe & Riverview, NB. Free quotes from TLB Electric."
targetKeyword: "panel upgrade Moncton"
order: 3
---

TLB Electric upgrades and modernizes electrical panels across Moncton, Dieppe, and Riverview — from routine 100-to-200-amp upgrades to Federal Pioneer replacements, generator hookups, and whole-home surge protection. Every job is performed by a licensed electrician and left in code-compliant condition.
```

- [ ] **Step 3: Create the sample service file**

```markdown
---
title: "Electrical Panel Upgrade in Moncton, NB | TLB Electric"
h1: "Electrical Panel Upgrades"
metaDescription: "Upgrade an outdated or overloaded electrical panel in Moncton, Dieppe or Riverview. Licensed, code-compliant panel upgrades from TLB Electric. Free quotes."
targetKeyword: "panel upgrade Moncton"
category: "panel-upgrades-moncton"
relatedServices: ["federal-pioneer-panel-replacement-moncton", "whole-home-surge-protection-moncton"]
intro: "If your breaker panel is tripping, buzzing, rusted, or simply too small for a modern home, a panel upgrade from TLB Electric brings your electrical system up to today's code and safety standard."
whatsIncluded:
  - "Assessment of your existing panel's capacity and condition"
  - "100-amp to 200-amp service upgrades for growing electrical loads"
  - "Replacement of outdated, recalled, or fire-risk panel brands"
  - "Full permit and inspection coordination with the local authority"
  - "Clean, labeled panel work with no loose ends"
localRelevance: "We upgrade panels in homes across Moncton, Dieppe, and Riverview, including older neighbourhoods where original panels are now decades past their intended service life."
order: 1
---

A panel upgrade is one of the highest-impact electrical investments a homeowner can make — it's what allows everything else (EV chargers, hot tubs, modern kitchens, finished basements) to run safely. TLB Electric sizes every upgrade to your actual and future load, not just the minimum code requirement.
```

- [ ] **Step 4: Verify the schema loads with no errors**

Run: `npx astro check`
Expected: No errors related to `src/content/config.ts` or the two sample files (schema validates cleanly). Astro's own dev-server type generation (`astro sync`) runs automatically as part of `astro check`.

---

## Task 2: Shared Presentational Components

**Files:**
- Create: `src/components/Breadcrumbs.astro`
- Create: `src/components/PageHero.astro`
- Create: `src/components/TrustBadges.astro`
- Create: `src/components/ImageSlot.astro`
- Create: `src/components/RelatedLinks.astro`
- Modify: `src/layouts/Layout.astro` (add optional `additionalSchemas` prop)

**Interfaces:**
- Consumes: nothing new (pure presentational components + one Layout prop addition).
- Produces:
  - `Breadcrumbs({ items: { label: string, href: string }[] })`
  - `PageHero({ breadcrumbItems: { label: string, href: string }[], eyebrow: string, h1: string, intro: string })`
  - `TrustBadges()` — no props
  - `ImageSlot({ label: string })`
  - `RelatedLinks({ title: string, links: { label: string, href: string }[] })`
  - `Layout({ title?: string, description?: string, additionalSchemas?: Record<string, any>[] })` — existing props unchanged, `additionalSchemas` is new and defaults to `[]`.

- [ ] **Step 1: Create Breadcrumbs component**

```astro
---
// src/components/Breadcrumbs.astro
interface Crumb { label: string; href: string; }
interface Props { items: Crumb[]; }
const { items } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---

<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol>
    {items.map((item, i) => (
      <li>
        {i < items.length - 1 ? (
          <a href={`${base}${item.href}`}>{item.label}</a>
        ) : (
          <span aria-current="page">{item.label}</span>
        )}
        {i < items.length - 1 && <span class="sep" aria-hidden="true">/</span>}
      </li>
    ))}
  </ol>
</nav>

<style>
  .breadcrumbs { padding: 0.5rem 0; }
  .breadcrumbs ol {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0;
    margin: 0;
  }
  .breadcrumbs li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-heading);
    font-size: 0.8rem;
    font-weight: 600;
  }
  .breadcrumbs a {
    color: rgba(255, 255, 255, 0.6);
    transition: color 0.2s;
  }
  .breadcrumbs a:hover { color: var(--white); }
  .breadcrumbs span[aria-current] { color: var(--white); }
  .breadcrumbs .sep { color: rgba(255, 255, 255, 0.3); }
</style>
```

- [ ] **Step 2: Create PageHero component**

```astro
---
// src/components/PageHero.astro
import Breadcrumbs from './Breadcrumbs.astro';
interface Crumb { label: string; href: string; }
interface Props {
  breadcrumbItems: Crumb[];
  eyebrow: string;
  h1: string;
  intro: string;
}
const { breadcrumbItems, eyebrow, h1, intro } = Astro.props;
---

<section class="page-hero">
  <div class="container page-hero-content">
    <Breadcrumbs items={breadcrumbItems} />
    <p class="page-hero-eyebrow">{eyebrow}</p>
    <h1 class="page-hero-title">{h1}</h1>
    <p class="page-hero-intro">{intro}</p>
    <div class="page-hero-actions">
      <a href="#contact" class="btn btn-primary">Request a Free Quote</a>
      <a href="tel:5068755337" class="btn btn-outline">Call 506-875-5337</a>
    </div>
  </div>
</section>

<style>
  .page-hero {
    background: linear-gradient(135deg, var(--charcoal) 0%, #241f24 100%);
    padding-top: 160px;
    padding-bottom: 4rem;
    position: relative;
    overflow: hidden;
  }
  .page-hero::before {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(213, 44, 60, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .page-hero-content { position: relative; z-index: 1; }
  .page-hero-eyebrow {
    font-family: var(--font-heading);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--red);
    margin: 1.5rem 0 0.75rem;
  }
  .page-hero-title {
    font-size: clamp(2rem, 4.5vw, 3rem);
    color: var(--white);
    margin-bottom: 1rem;
    max-width: 800px;
  }
  .page-hero-intro {
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.75);
    max-width: 640px;
    line-height: 1.7;
    margin-bottom: 2rem;
  }
  .page-hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  @media (max-width: 600px) {
    .page-hero-actions { flex-direction: column; }
    .page-hero-actions .btn { width: 100%; justify-content: center; }
  }
</style>
```

- [ ] **Step 3: Create TrustBadges component**

```astro
---
// src/components/TrustBadges.astro
const badges = [
  { icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`, label: 'Licensed & Insured' },
  { icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`, label: 'Fast Response Times' },
  { icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`, label: 'Quality Workmanship' },
  { icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`, label: 'Serving Greater Moncton' },
];
---

<div class="trust-badges">
  {badges.map((b) => (
    <div class="trust-badge">
      <span class="trust-badge-icon" set:html={b.icon} />
      {b.label}
    </div>
  ))}
</div>

<style>
  .trust-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    padding: 2rem 0;
    background: var(--off-white);
  }
  .trust-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-heading);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--charcoal);
    background: var(--white);
    border: 1px solid var(--gray);
    padding: 0.5rem 1rem;
    border-radius: 100px;
  }
  .trust-badge-icon { color: var(--red); display: flex; }
</style>
```

- [ ] **Step 4: Create ImageSlot component**

```astro
---
// src/components/ImageSlot.astro
interface Props { label: string; }
const { label } = Astro.props;
---
<!-- IMAGE SLOT: replace with a real project photo for "{label}" when available -->
<div class="image-slot" role="img" aria-label={`Placeholder for ${label} photo`}>
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
  <span>{label}</span>
</div>

<style>
  .image-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    aspect-ratio: 16 / 10;
    background: var(--off-white);
    border: 1.5px dashed var(--gray);
    border-radius: 8px;
    color: #b3b3b3;
    font-family: var(--font-heading);
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    padding: 1rem;
  }
</style>
```

- [ ] **Step 5: Create RelatedLinks component**

```astro
---
// src/components/RelatedLinks.astro
interface LinkItem { label: string; href: string; }
interface Props { title: string; links: LinkItem[]; }
const { title, links } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---

{links.length > 0 && (
  <section class="related-links">
    <div class="container">
      <h2 class="related-links-title">{title}</h2>
      <div class="related-links-grid">
        {links.map((link) => (
          <a href={`${base}${link.href}`} class="related-link-card">{link.label}</a>
        ))}
      </div>
    </div>
  </section>
)}

<style>
  .related-links { padding: 4rem 0; background: var(--white); }
  .related-links-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    color: var(--charcoal);
    margin-bottom: 1.5rem;
  }
  .related-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  .related-link-card {
    display: block;
    padding: 1.25rem;
    background: var(--off-white);
    border: 1px solid var(--gray);
    border-radius: 8px;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--charcoal);
    transition: border-color 0.2s, transform 0.2s;
  }
  .related-link-card:hover {
    border-color: var(--red);
    transform: translateY(-2px);
  }
</style>
```

- [ ] **Step 6: Add `additionalSchemas` support to Layout.astro**

In `src/layouts/Layout.astro`, change the props interface and add a render loop. Replace:

```astro
interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'TLB Electric | Licensed Electrician in Moncton, NB',
  description = 'TLB Electric — licensed electrician serving Moncton, NB. Residential & commercial wiring, panel upgrades, EV chargers, and emergency electrical services.',
} = Astro.props;
```

with:

```astro
interface Props {
  title?: string;
  description?: string;
  additionalSchemas?: Record<string, any>[];
}

const {
  title = 'TLB Electric | Licensed Electrician in Moncton, NB',
  description = 'TLB Electric — licensed electrician serving Moncton, NB. Residential & commercial wiring, panel upgrades, EV chargers, and emergency electrical services.',
  additionalSchemas = [],
} = Astro.props;
```

Then, directly below the existing `<script type="application/ld+json" set:html={JSON.stringify(schema)} />` line in the `<head>`, add:

```astro
    {additionalSchemas.map((s) => (
      <script type="application/ld+json" set:html={JSON.stringify(s)} />
    ))}
```

- [ ] **Step 7: Verify build still succeeds with no page changes yet**

Run: `npm run build`
Expected: Build succeeds (homepage unaffected — `additionalSchemas` defaults to `[]`, no other page consumes the new components yet).

---

## Task 3: Category & Service Layouts + Dynamic Route

**Files:**
- Create: `src/layouts/CategoryLayout.astro`
- Create: `src/layouts/ServiceLayout.astro`
- Create: `src/pages/[slug].astro`

**Interfaces:**
- Consumes: `categories`/`services` collections (Task 1), `Breadcrumbs`/`PageHero`/`TrustBadges`/`ImageSlot`/`RelatedLinks`/`Layout` (Task 2), existing `Header`/`Footer`/`QuoteCTA`/`ContactForm` components (unchanged).
- Produces: `CategoryLayout({ entry: CollectionEntry<'categories'> }, slot)`, `ServiceLayout({ entry: CollectionEntry<'services'> }, slot)`, and live routes for every category/service/geo entry at `/{entry.id}`.

- [ ] **Step 1: Write CategoryLayout.astro**

```astro
---
// src/layouts/CategoryLayout.astro
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import Layout from './Layout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import PageHero from '../components/PageHero.astro';
import TrustBadges from '../components/TrustBadges.astro';
import RelatedLinks from '../components/RelatedLinks.astro';
import QuoteCTA from '../components/QuoteCTA.astro';
import ContactForm from '../components/ContactForm.astro';

interface Props { entry: CollectionEntry<'categories'>; }
const { entry } = Astro.props;
const { title, h1, metaDescription, targetKeyword } = entry.data;

const allServices = await getCollection('services');
const childServices = allServices
  .filter((s) => s.data.category === entry.id && s.data.type !== 'geo')
  .sort((a, b) => a.data.order - b.data.order);

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: h1,
  serviceType: targetKeyword,
  provider: {
    '@type': 'Electrician',
    name: 'TLB Electric',
    telephone: '+15068755337',
    url: 'https://tlbelectric.ca',
  },
  areaServed: [
    { '@type': 'City', name: 'Moncton' },
    { '@type': 'City', name: 'Dieppe' },
    { '@type': 'City', name: 'Riverview' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tlbelectric.ca/' },
    { '@type': 'ListItem', position: 2, name: h1, item: `https://tlbelectric.ca/${entry.id}` },
  ],
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---

<Layout title={title} description={metaDescription} additionalSchemas={[serviceSchema, breadcrumbSchema]}>
  <Header />
  <main>
    <PageHero
      breadcrumbItems={[{ label: 'Home', href: '/' }, { label: h1, href: `/${entry.id}` }]}
      eyebrow="Greater Moncton, NB"
      h1={h1}
      intro={metaDescription}
    />
    <TrustBadges />
    <section class="category-services">
      <div class="container">
        <h2 class="section-title">Our {h1}</h2>
        <div class="category-services-grid">
          {childServices.map((service) => (
            <a href={`${base}/${service.id}`} class="category-service-card">
              <h3>{service.data.h1}</h3>
              <p>{service.data.intro}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
    <slot />
    <QuoteCTA />
    <ContactForm />
  </main>
  <Footer />
</Layout>

<style>
  .category-services { padding: 5rem 0; background: var(--off-white); }
  .category-services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  .category-service-card {
    display: block;
    background: var(--white);
    border: 1px solid var(--gray);
    border-radius: 8px;
    padding: 1.75rem;
    transition: transform 0.2s, border-color 0.2s;
  }
  .category-service-card:hover { transform: translateY(-3px); border-color: var(--red); }
  .category-service-card h3 {
    font-size: 1.05rem;
    color: var(--charcoal);
    margin-bottom: 0.5rem;
  }
  .category-service-card p {
    font-size: 0.9rem;
    color: var(--text-muted);
    line-height: 1.6;
  }
</style>
```

- [ ] **Step 2: Write ServiceLayout.astro**

```astro
---
// src/layouts/ServiceLayout.astro
import type { CollectionEntry } from 'astro:content';
import { getCollection, getEntry } from 'astro:content';
import Layout from './Layout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import PageHero from '../components/PageHero.astro';
import TrustBadges from '../components/TrustBadges.astro';
import ImageSlot from '../components/ImageSlot.astro';
import RelatedLinks from '../components/RelatedLinks.astro';
import QuoteCTA from '../components/QuoteCTA.astro';
import ContactForm from '../components/ContactForm.astro';

interface Props { entry: CollectionEntry<'services'>; }
const { entry } = Astro.props;
const { title, h1, metaDescription, targetKeyword, category, intro, whatsIncluded, localRelevance, relatedServices } = entry.data;

const categoryEntry = await getEntry('categories', category);
const allServices = await getCollection('services');
const related = relatedServices
  .map((slug) => allServices.find((s) => s.id === slug))
  .filter((s): s is CollectionEntry<'services'> => Boolean(s));

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: h1,
  serviceType: targetKeyword,
  provider: {
    '@type': 'Electrician',
    name: 'TLB Electric',
    telephone: '+15068755337',
    url: 'https://tlbelectric.ca',
  },
  areaServed: [
    { '@type': 'City', name: 'Moncton' },
    { '@type': 'City', name: 'Dieppe' },
    { '@type': 'City', name: 'Riverview' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tlbelectric.ca/' },
    ...(categoryEntry ? [{ '@type': 'ListItem', position: 2, name: categoryEntry.data.h1, item: `https://tlbelectric.ca/${categoryEntry.id}` }] : []),
    { '@type': 'ListItem', position: categoryEntry ? 3 : 2, name: h1, item: `https://tlbelectric.ca/${entry.id}` },
  ],
};
---

<Layout title={title} description={metaDescription} additionalSchemas={[serviceSchema, breadcrumbSchema]}>
  <Header />
  <main>
    <PageHero
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        ...(categoryEntry ? [{ label: categoryEntry.data.h1, href: `/${categoryEntry.id}` }] : []),
        { label: h1, href: `/${entry.id}` },
      ]}
      eyebrow="Greater Moncton, NB"
      h1={h1}
      intro={intro}
    />
    <TrustBadges />
    <section class="service-detail">
      <div class="container service-detail-grid">
        <div class="service-detail-body">
          <h2 class="section-title">What's Included</h2>
          <ul class="whats-included-list">
            {whatsIncluded.map((item) => <li>{item}</li>)}
          </ul>
          {localRelevance && <p class="local-relevance">{localRelevance}</p>}
          <slot />
        </div>
        <ImageSlot label={h1} />
      </div>
    </section>
    {categoryEntry && (
      <RelatedLinks
        title="Related Services"
        links={[
          { label: categoryEntry.data.h1, href: `/${categoryEntry.id}` },
          ...related.map((r) => ({ label: r.data.h1, href: `/${r.id}` })),
        ]}
      />
    )}
    <QuoteCTA />
    <ContactForm />
  </main>
  <Footer />
</Layout>

<style>
  .service-detail { padding: 5rem 0; background: var(--white); }
  .service-detail-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 3rem;
    align-items: start;
  }
  .whats-included-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  .whats-included-list li {
    padding-left: 1.75rem;
    position: relative;
    color: var(--charcoal);
    line-height: 1.6;
  }
  .whats-included-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.4rem;
    width: 10px;
    height: 10px;
    background: var(--red);
    border-radius: 50%;
  }
  .local-relevance {
    color: var(--text-muted);
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 900px) {
    .service-detail-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 3: Write the dynamic route**

```astro
---
// src/pages/[slug].astro
import { getCollection, render } from 'astro:content';
import CategoryLayout from '../layouts/CategoryLayout.astro';
import ServiceLayout from '../layouts/ServiceLayout.astro';

export async function getStaticPaths() {
  const categories = await getCollection('categories');
  const services = await getCollection('services');

  const categoryPaths = categories.map((entry) => ({
    params: { slug: entry.id },
    props: { kind: 'category' as const, entry },
  }));

  const servicePaths = services.map((entry) => ({
    params: { slug: entry.id },
    props: { kind: 'service' as const, entry },
  }));

  return [...categoryPaths, ...servicePaths];
}

const { kind, entry } = Astro.props;
const { Content } = await render(entry as any);
---

{kind === 'category' ? (
  <CategoryLayout entry={entry as any}>
    <Content />
  </CategoryLayout>
) : (
  <ServiceLayout entry={entry as any}>
    <Content />
  </ServiceLayout>
)}
```

- [ ] **Step 4: Verify the sample pages build and render**

Run: `npm run build`
Expected: Build succeeds and `dist/panel-upgrades-moncton/index.html` and `dist/electrical-panel-upgrade-moncton/index.html` both exist (adjust for `base: '/TLBv1'` if building outside Cloudflare — check `dist/TLBv1/panel-upgrades-moncton/index.html` in that case).

Run: `npm run dev`, then open `http://localhost:4321/TLBv1/panel-upgrades-moncton` and `http://localhost:4321/TLBv1/electrical-panel-upgrade-moncton`
Expected: Both pages render with correct H1, breadcrumb, hero, trust badges, and (for the service page) the "What's Included" list and image slot placeholder — matching brand styling.

---

## Task 4: Header Mega-Menu Navigation

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `categories`/`services` collections (Task 1).
- Produces: no new exports (page-level component); adds a "Services" mega-menu dropdown and mobile accordion in place of the old anchor-only `navLinks`.

- [ ] **Step 1: Replace the frontmatter nav data**

Replace the existing:

```astro
---
const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#why-us' },
  { label: 'Contact', href: '#contact' },
];
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
```

with:

```astro
---
import { getCollection } from 'astro:content';

const categories = (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
const services = await getCollection('services');

const megaMenu = categories.map((cat) => ({
  label: cat.data.h1,
  href: `/${cat.id}`,
  services: services
    .filter((s) => s.data.category === cat.id && s.data.type !== 'geo')
    .sort((a, b) => a.data.order - b.data.order)
    .map((s) => ({ label: s.data.h1, href: `/${s.id}` })),
}));

const navLinks = [
  { label: 'About Us', href: '/#why-us' },
  { label: 'Contact', href: '/#contact' },
];
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---
```

- [ ] **Step 2: Replace the desktop `<nav>` block**

Replace:

```astro
      <nav class="nav" aria-label="Main navigation">
        {navLinks.map(link => (
          <a href={link.href} class="nav-link">{link.label}</a>
        ))}
      </nav>
```

with:

```astro
      <nav class="nav" aria-label="Main navigation">
        <a href={`${base}/`} class="nav-link">Home</a>
        <div class="nav-item-dropdown">
          <button class="nav-link nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true">
            Services
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="mega-menu">
            {megaMenu.map((cat) => (
              <div class="mega-menu-column">
                <a href={`${base}${cat.href}`} class="mega-menu-heading">{cat.label}</a>
                <ul>
                  {cat.services.map((svc) => (
                    <li><a href={`${base}${svc.href}`}>{svc.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {navLinks.map(link => (
          <a href={`${base}${link.href}`} class="nav-link">{link.label}</a>
        ))}
      </nav>
```

- [ ] **Step 3: Replace the mobile menu block**

Replace:

```astro
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    {navLinks.map(link => (
      <a href={link.href} class="mobile-nav-link">{link.label}</a>
    ))}
```

with:

```astro
  <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    <a href={`${base}/`} class="mobile-nav-link">Home</a>
    {megaMenu.map((cat) => (
      <details class="mobile-accordion">
        <summary class="mobile-nav-link">{cat.label}</summary>
        <div class="mobile-accordion-body">
          <a href={`${base}${cat.href}`} class="mobile-sub-link">All {cat.label}</a>
          {cat.services.map((svc) => (
            <a href={`${base}${svc.href}`} class="mobile-sub-link">{svc.label}</a>
          ))}
        </div>
      </details>
    ))}
    {navLinks.map(link => (
      <a href={`${base}${link.href}`} class="mobile-nav-link">{link.label}</a>
    ))}
```

- [ ] **Step 4: Add mega-menu and accordion CSS**

Append to the `<style>` block in `Header.astro`:

```css
  .nav-item-dropdown { position: relative; }
  .nav-dropdown-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
  }
  .mega-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--charcoal);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1.5rem;
    gap: 2rem;
    grid-template-columns: repeat(4, 200px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
    z-index: 1100;
  }
  .nav-item-dropdown:hover .mega-menu,
  .nav-item-dropdown:focus-within .mega-menu {
    display: grid;
  }
  .mega-menu-column { display: flex; flex-direction: column; gap: 0.5rem; }
  .mega-menu-heading {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.8rem;
    color: var(--red);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.25rem;
  }
  .mega-menu-column ul { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
  .mega-menu-column a {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.2s;
  }
  .mega-menu-column a:hover { color: var(--white); }

  .mobile-accordion { border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
  .mobile-accordion summary {
    list-style: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .mobile-accordion summary::-webkit-details-marker { display: none; }
  .mobile-accordion-body {
    display: flex;
    flex-direction: column;
    padding: 0 1.5rem 1rem 2rem;
    gap: 0.6rem;
  }
  .mobile-sub-link {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.65);
  }

  @media (max-width: 1100px) {
    .mega-menu { grid-template-columns: repeat(2, 200px); }
  }
```

- [ ] **Step 5: Verify navigation renders**

Run: `npm run dev`, open `http://localhost:4321/TLBv1/`
Expected: Desktop hovering "Services" shows a 4-column mega-menu with all category + service links; on mobile width, hamburger menu shows a "Home" link, 4 expandable accordions (one per category, each listing its services), then "About Us"/"Contact".

---

## Task 5: Footer Real Links

**Files:**
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: `categories` collection (Task 1).
- Produces: no new exports; footer "Services" column now links to real category pages instead of the `#services` anchor.

- [ ] **Step 1: Replace the hardcoded services list with collection data**

Replace:

```astro
const currentYear = new Date().getFullYear();
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const services = [
  'Residential Electrical',
  'Commercial Electrical',
  'Panel Upgrades',
  'EV Charger Installation',
  'New Construction',
  'Emergency Services',
];
```

with:

```astro
import { getCollection } from 'astro:content';

const currentYear = new Date().getFullYear();
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const categories = (await getCollection('categories'))
  .sort((a, b) => a.data.order - b.data.order)
  .map((cat) => ({ label: cat.data.h1, href: `/${cat.id}` }));
```

- [ ] **Step 2: Update the footer markup to use real links**

Replace:

```astro
    <div class="footer-services">
      <h3 class="footer-heading">Services</h3>
      <ul class="footer-list">
        {services.map(s => (
          <li><a href="#services" class="footer-list-link">{s}</a></li>
        ))}
      </ul>
    </div>
```

with:

```astro
    <div class="footer-services">
      <h3 class="footer-heading">Services</h3>
      <ul class="footer-list">
        {categories.map(cat => (
          <li><a href={`${base}${cat.href}`} class="footer-list-link">{cat.label}</a></li>
        ))}
      </ul>
    </div>
```

- [ ] **Step 3: Update the "Get a Free Quote" footer CTA link to be homepage-relative**

Replace `<a href="#contact" class="btn btn-primary footer-cta">Get a Free Quote</a>` with `<a href={`${base}/#contact`} class="btn btn-primary footer-cta">Get a Free Quote</a>` so the link still works correctly from category/service pages (not just the homepage).

- [ ] **Step 4: Verify**

Run: `npm run dev`, open any page (e.g. `http://localhost:4321/TLBv1/panel-upgrades-moncton`)
Expected: Footer "Services" column shows the 4 real category links and each navigates correctly; "Get a Free Quote" footer button navigates back to the homepage contact section from any page.

---

## Task 6: Homepage Enhancements (7 Consistency Signals)

**Files:**
- Modify: `src/components/Services.astro` (replace 6 service tiles with 4 category tiles linking to real pages)
- Create: `src/components/MapEmbed.astro`
- Create: `src/components/ReviewsPlaceholder.astro`
- Modify: `src/pages/index.astro` (wire in `MapEmbed` and `ReviewsPlaceholder`)

**Interfaces:**
- Consumes: `categories` collection (Task 1).
- Produces: no new exports; homepage now has in-body links to all 4 category pages, a service-area Maps embed, and a reviews-widget placeholder.

- [ ] **Step 1: Rewrite Services.astro to render category tiles**

Replace the entire frontmatter and markup of `src/components/Services.astro` with:

```astro
---
import { getCollection } from 'astro:content';

const icons = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 7H16V4l-3-3H5C3.9 1 3 1.9 3 3v11c0 1.1.9 2 2 2h1v2c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-9c0-1.66-1.34-3-3-3zm0 13H8v-2h6c1.1 0 2-.9 2-2V9h1.5c.83 0 1.5.67 1.5 1.5V18c0 1.1-.9 2-2 2z"/></svg>`,
];

const categories = (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
---

<section class="services" id="services">
  <div class="container">
    <div class="services-header">
      <p class="section-label">What We Do</p>
      <h2 class="section-title">Electrical Services You Can Count On</h2>
      <p class="section-subtitle">
        From a single outlet to a full custom home, TLB Electric brings skilled, licensed work to every job in Greater Moncton, Dieppe &amp; Riverview.
      </p>
    </div>

    <div class="services-grid">
      {categories.map((cat, i) => (
        <a href={`${base}/${cat.id}`} class="service-card">
          <div class="service-icon" set:html={icons[i % icons.length]} />
          <h3 class="service-title">{cat.data.h1}</h3>
          <p class="service-description">{cat.data.metaDescription}</p>
          <span class="service-card-link">Explore {cat.data.h1} &rarr;</span>
        </a>
      ))}
    </div>

    <div class="services-footer">
      <p>Don't see your project listed? We handle it all.</p>
      <a href="#contact" class="btn btn-primary">Get a Free Quote</a>
    </div>
  </div>
</section>
```

Keep the existing `<style>` block from the current `Services.astro` unchanged, but append:

```css
  .service-card { display: block; text-decoration: none; }
  .service-card-link {
    display: inline-block;
    margin-top: 0.75rem;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--red);
  }
```

Also change `.services-grid { grid-template-columns: repeat(3, 1fr); }` to `.services-grid { grid-template-columns: repeat(2, 1fr); }` (4 tiles reads better as a 2x2 grid than 3-wide) and the `@media (max-width: 900px)` override for `.services-grid` to `grid-template-columns: 1fr;`.

- [ ] **Step 2: Create MapEmbed.astro**

```astro
---
// src/components/MapEmbed.astro
---

<section class="map-embed">
  <div class="container">
    <p class="section-label">Where We Work</p>
    <h2 class="section-title">Proudly Serving Greater Moncton</h2>
    <p class="section-subtitle">
      TLB Electric is a mobile electrical contractor covering Moncton, Dieppe, Riverview, and the surrounding Greater Moncton area — no storefront visit required, we come to you.
    </p>
    <div class="map-frame">
      <iframe
        title="TLB Electric service area — Moncton, Dieppe & Riverview, NB"
        src="https://maps.google.com/maps?q=Moncton%2C%20NB&t=&z=11&ie=UTF8&iwloc=&output=embed"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </div>
</section>

<style>
  .map-embed { padding: 5rem 0; background: var(--white); }
  .map-embed .section-label,
  .map-embed .section-title,
  .map-embed .section-subtitle { text-align: center; margin-left: auto; margin-right: auto; }
  .map-embed .section-subtitle { margin-bottom: 2rem; }
  .map-frame {
    width: 100%;
    aspect-ratio: 16 / 6;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--gray);
  }
  .map-frame iframe { width: 100%; height: 100%; border: 0; }
  @media (max-width: 700px) {
    .map-frame { aspect-ratio: 4 / 5; }
  }
</style>
```

- [ ] **Step 3: Create ReviewsPlaceholder.astro**

```astro
---
// src/components/ReviewsPlaceholder.astro
// Pending: Google Business Profile owner access / Place ID (see docs/superpowers/specs
// and the GBP_Update_Recommendations.txt deliverable). Once available, replace this
// block with a live Google Reviews widget wired to the confirmed Place ID.
---

<section class="reviews-placeholder">
  <div class="container">
    <p class="section-label">What Customers Say</p>
    <h2 class="section-title">Google Reviews</h2>
    <div class="reviews-placeholder-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      <p>Live Google reviews will display here once TLB Electric's Google Business Profile Place ID is available.</p>
    </div>
  </div>
</section>

<style>
  .reviews-placeholder { padding: 5rem 0; background: var(--off-white); text-align: center; }
  .reviews-placeholder-box {
    max-width: 480px;
    margin: 2rem auto 0;
    padding: 2.5rem;
    background: var(--white);
    border: 1.5px dashed var(--gray);
    border-radius: 12px;
    color: var(--text-muted);
  }
  .reviews-placeholder-box svg { color: var(--red); margin-bottom: 1rem; }
</style>
```

- [ ] **Step 4: Wire both new components into the homepage**

In `src/pages/index.astro`, replace:

```astro
import ContactForm from '../components/ContactForm.astro';
import InstagramFeed from '../components/InstagramFeed.astro';
import Footer from '../components/Footer.astro';
---

<Layout>
  <Header />
  <main>
    <Hero />
    <Services />
    <WhyUs />
    <QuoteCTA />
    <InstagramFeed />
    <ContactForm />
  </main>
  <Footer />
</Layout>
```

with:

```astro
import ContactForm from '../components/ContactForm.astro';
import InstagramFeed from '../components/InstagramFeed.astro';
import MapEmbed from '../components/MapEmbed.astro';
import ReviewsPlaceholder from '../components/ReviewsPlaceholder.astro';
import Footer from '../components/Footer.astro';
---

<Layout>
  <Header />
  <main>
    <Hero />
    <Services />
    <MapEmbed />
    <WhyUs />
    <QuoteCTA />
    <ReviewsPlaceholder />
    <InstagramFeed />
    <ContactForm />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 5: Verify homepage**

Run: `npm run dev`, open `http://localhost:4321/TLBv1/`
Expected: Services section now shows 4 category tiles (2x2 grid) each linking to its real category page; a Moncton-area Google Maps embed appears between Services and WhyUs; a reviews placeholder block appears between QuoteCTA and InstagramFeed. Colors/fonts/logo unchanged throughout.

---

## Task 7: Content Data — Silo 1 (Residential Electrical Services)

**Files:**
- Modify: `src/content/categories/residential-electrical-moncton.md` (create — this silo's category file)
- Create: `src/content/services/home-rewiring-moncton.md`
- Create: `src/content/services/outlet-switch-installation-moncton.md`
- Create: `src/content/services/lighting-installation-moncton.md`
- Create: `src/content/services/ceiling-fan-installation-moncton.md`
- Create: `src/content/services/home-electrical-inspection-moncton.md`
- Create: `src/content/services/knob-and-tube-wiring-replacement-moncton.md`
- Create: `src/content/services/aluminum-wiring-repair-moncton.md`
- Create: `src/content/services/hot-tub-pool-electrical-hookup-moncton.md`

**Interfaces:**
- Consumes: schema from Task 1.
- Produces: 1 category entry (`residential-electrical-moncton`, `order: 1`) + 8 service entries (`order: 1`–`8`, `category: "residential-electrical-moncton"`).

**Required metadata (verbatim from DOCX Section 4/5 — do not alter any of these fields):**

| Slug | title | h1 | targetKeyword |
|---|---|---|---|
| residential-electrical-moncton (category) | Residential Electrical Services in Moncton, NB \| TLB Electric | Residential Electrical Services in Moncton, Dieppe & Riverview | residential electrician Moncton |
| home-rewiring-moncton | Home Rewiring Services in Moncton, NB \| TLB Electric | Home Rewiring in Moncton, Dieppe & Riverview | home rewiring Moncton |
| outlet-switch-installation-moncton | Outlet & Switch Installation in Moncton, NB \| TLB Electric | Electrical Outlet & Switch Installation | outlet installation Moncton |
| lighting-installation-moncton | Lighting Installation in Moncton, NB \| TLB Electric | Residential Lighting Installation & Upgrades | lighting installation Moncton |
| ceiling-fan-installation-moncton | Ceiling Fan Installation in Moncton, NB \| TLB Electric | Ceiling Fan Installation | ceiling fan installation Moncton |
| home-electrical-inspection-moncton | Home Electrical Inspection in Moncton, NB \| TLB Electric | Home Electrical Inspections | electrical inspection Moncton |
| knob-and-tube-wiring-replacement-moncton | Knob & Tube Wiring Replacement \| TLB Electric | Knob & Tube Wiring Replacement | knob and tube wiring replacement Moncton |
| aluminum-wiring-repair-moncton | Aluminum Wiring Repair in Moncton, NB \| TLB Electric | Aluminum Wiring Repair | aluminum wiring repair Moncton |
| hot-tub-pool-electrical-hookup-moncton | Hot Tub & Pool Electrical Hookup \| TLB Electric | Hot Tub & Pool Electrical Hookups | hot tub electrical hookup Moncton |

- [ ] **Step 1: Write the category file**

Create `src/content/categories/residential-electrical-moncton.md` with `order: 1` and a `metaDescription` under 160 characters summarizing residential electrical work in Moncton/Dieppe/Riverview, following the same structure as the Task 1 sample category file (`panel-upgrades-moncton.md`).

- [ ] **Step 2: Write all 8 service files**

For each of the 8 slugs above, create `src/content/services/<slug>.md` with:
- Frontmatter fields exactly matching the schema from Task 1 (`title`, `h1`, `metaDescription`, `targetKeyword`, `category: "residential-electrical-moncton"`, `type` omitted (defaults to `service`), `relatedServices` (2–3 slugs from this same 8-item list — e.g. `home-rewiring-moncton` should relate to `knob-and-tube-wiring-replacement-moncton` and `aluminum-wiring-repair-moncton` since all three concern older/unsafe wiring), `intro`, `whatsIncluded` (4–6 bullet points), `localRelevance` (1–2 sentences, only where genuinely relevant to that specific job type per the DOCX's own instruction — e.g. skip forced Moncton/Dieppe/Riverview name-dropping on a page like Ceiling Fan Installation if it reads as filler), `order` (1 through 8 matching table order above).
- Body content: 2–4 original paragraphs of markdown prose expanding on the service, in the site's existing voice (direct, confident, no fluff — see `Hero.astro`/`WhyUs.astro` copy for tone reference). Do not fabricate specific credentials, years-in-business, or customer counts not already present elsewhere in the repo (e.g. don't invent "20 years of experience" — the existing site never states a specific founding year).
- Title tags, H1s, and target keywords must match the table exactly — no paraphrasing.

- [ ] **Step 3: Verify**

Run: `npx astro check`
Expected: No schema validation errors for any of the 9 new files.

Run: `npm run build`
Expected: Build succeeds; `dist/residential-electrical-moncton/index.html` and all 8 service page HTML files exist (or under `dist/TLBv1/...` depending on build target), each with the correct `<title>` matching the table above (spot-check with a text search in the built HTML).

---

## Task 8: Content Data — Silo 2 (Commercial & Industrial Electrical Services)

**Files:**
- Create: `src/content/categories/commercial-electrical-moncton.md`
- Create: `src/content/services/commercial-electrical-wiring-moncton.md`
- Create: `src/content/services/office-retail-lighting-moncton.md`
- Create: `src/content/services/commercial-electrical-maintenance-moncton.md`
- Create: `src/content/services/industrial-electrical-services-moncton.md`
- Create: `src/content/services/commercial-lighting-retrofit-moncton.md`
- Create: `src/content/services/electrical-code-compliance-inspection-moncton.md`

**Interfaces:**
- Consumes: schema from Task 1.
- Produces: 1 category entry (`commercial-electrical-moncton`, `order: 2`) + 6 service entries (`order: 1`–`6`, `category: "commercial-electrical-moncton"`).

**Required metadata (verbatim from DOCX):**

| Slug | title | h1 | targetKeyword |
|---|---|---|---|
| commercial-electrical-moncton (category) | Commercial Electrician in Moncton, NB \| TLB Electric | Commercial & Industrial Electrical Services | commercial electrician Moncton |
| commercial-electrical-wiring-moncton | Commercial Electrical Wiring in Moncton, NB \| TLB Electric | Commercial Electrical Wiring | commercial electrical wiring Moncton |
| office-retail-lighting-moncton | Office & Retail Lighting in Moncton, NB \| TLB Electric | Office & Retail Lighting Installation | commercial lighting Moncton |
| commercial-electrical-maintenance-moncton | Commercial Electrical Maintenance \| TLB Electric | Commercial Electrical Maintenance | commercial electrical maintenance Moncton |
| industrial-electrical-services-moncton | Industrial Electrician in Moncton, NB \| TLB Electric | Industrial Electrical Services | industrial electrician Moncton |
| commercial-lighting-retrofit-moncton | Commercial Lighting Retrofits \| TLB Electric | Commercial Lighting Retrofits — NB Power Grant Eligible | commercial lighting retrofit Moncton NB Power grant |
| electrical-code-compliance-inspection-moncton | Electrical Code Compliance & Inspections \| TLB Electric | Electrical Code Compliance & Inspections | electrical code compliance Moncton |

- [ ] **Step 1: Write the category file** — same pattern as Task 7 Step 1, `order: 2`.

- [ ] **Step 2: Write all 6 service files** — same pattern as Task 7 Step 2, `category: "commercial-electrical-moncton"`, `order: 1`–`6` matching table order. For `commercial-lighting-retrofit-moncton`, the `whatsIncluded` list must mention NB Power grant eligibility explicitly (per the DOCX's H1), without inventing specific grant dollar amounts or program names not confirmed. Relate `commercial-lighting-retrofit-moncton` to `office-retail-lighting-moncton`, and `electrical-code-compliance-inspection-moncton` to `commercial-electrical-maintenance-moncton`.

- [ ] **Step 3: Verify** — same commands/expectations as Task 7 Step 3, for this silo's 7 new files.

---

## Task 9: Content Data — Silo 3 (Panel & Power Upgrades)

**Files:**
- Modify: `src/content/categories/panel-upgrades-moncton.md` (already created in Task 1 — leave as-is)
- Modify: `src/content/services/electrical-panel-upgrade-moncton.md` (already created in Task 1 — leave as-is)
- Create: `src/content/services/federal-pioneer-panel-replacement-moncton.md`
- Create: `src/content/services/generator-hookup-generlink-installation-moncton.md`
- Create: `src/content/services/circuit-breaker-replacement-moncton.md`
- Create: `src/content/services/whole-home-surge-protection-moncton.md`

**Interfaces:**
- Consumes: schema from Task 1; the category and first service file already exist from Task 1.
- Produces: 4 additional service entries (`order: 2`–`5`, `category: "panel-upgrades-moncton"`), completing this 5-service silo.

**Required metadata (verbatim from DOCX):**

| Slug | title | h1 | targetKeyword |
|---|---|---|---|
| federal-pioneer-panel-replacement-moncton | Federal Pioneer Panel Replacement \| TLB Electric | Federal Pioneer Panel Replacement | Federal Pioneer panel replacement Moncton |
| generator-hookup-generlink-installation-moncton | Generator Hookup & Generlink Installation \| TLB Electric | Generator Hookups & Generlink Installation | Generlink installation Moncton |
| circuit-breaker-replacement-moncton | Circuit Breaker Replacement in Moncton, NB \| TLB Electric | Circuit Breaker Replacement & Repair | circuit breaker replacement Moncton |
| whole-home-surge-protection-moncton | Whole-Home Surge Protection \| TLB Electric | Whole-Home Surge Protection | surge protection installation Moncton |

- [ ] **Step 1: Write the 4 remaining service files** — same pattern as Task 7 Step 2, `category: "panel-upgrades-moncton"`, `order: 2`–`5` matching table order. Relate `federal-pioneer-panel-replacement-moncton` to `electrical-panel-upgrade-moncton` and `circuit-breaker-replacement-moncton` (Federal Pioneer panels are a known recalled-breaker risk); relate `whole-home-surge-protection-moncton` to `electrical-panel-upgrade-moncton` and `generator-hookup-generlink-installation-moncton`. Do not invent specific Federal Pioneer recall dates or legal claims beyond describing it as a known older panel brand often recommended for replacement — keep any safety claims general and non-alarmist.

- [ ] **Step 2: Update `electrical-panel-upgrade-moncton.md`'s `relatedServices`** from Task 1's `["federal-pioneer-panel-replacement-moncton", "whole-home-surge-protection-moncton"]` — confirm both slugs now exist as real files (they do, from Step 1) and leave the field as-is.

- [ ] **Step 3: Verify** — same commands/expectations as Task 7 Step 3, for this silo's 4 new files plus the 2 existing Task 1 files (5 services + 1 category = 6 total pages for this silo).

---

## Task 10: Content Data — Silo 4 (EV/Construction/Emergency) + 3 Geo Pages

**Files:**
- Create: `src/content/categories/specialty-electrical-services-moncton.md`
- Create: `src/content/services/ev-charger-installation-moncton.md`
- Create: `src/content/services/commercial-ev-charger-installation-moncton.md`
- Create: `src/content/services/emergency-electrician-moncton.md`
- Create: `src/content/services/new-construction-electrical-moncton.md`
- Create: `src/content/services/electrical-renovation-addition-moncton.md`
- Create: `src/content/services/smoke-co-detector-installation-moncton.md`
- Create: `src/content/services/electrician-dieppe-nb.md` (geo)
- Create: `src/content/services/electrician-riverview-nb.md` (geo)
- Create: `src/content/services/emergency-electrician-dieppe-nb.md` (geo)

**Interfaces:**
- Consumes: schema from Task 1.
- Produces: 1 category entry (`specialty-electrical-services-moncton`, `order: 4`) + 6 service entries (`order: 1`–`6`) + 3 geo entries (`type: "geo"`, `order: 7`–`9`, all `category: "specialty-electrical-services-moncton"` so they surface as related/nearby content without polluting the other 3 silos).

**Required metadata for the 6 Core-30 services (verbatim from DOCX):**

| Slug | title | h1 | targetKeyword |
|---|---|---|---|
| specialty-electrical-services-moncton (category) | EV Charger Installation & Emergency Electrician \| TLB Electric | EV Charging, New Construction & Emergency Electrical Services | emergency electrician Moncton |
| ev-charger-installation-moncton | EV Charger Installation in Moncton, NB \| TLB Electric | Home EV Charger Installation | EV charger installation Moncton |
| commercial-ev-charger-installation-moncton | Commercial EV Charger Installation \| TLB Electric | Commercial EV Charger Installation | commercial EV charger installation Moncton |
| emergency-electrician-moncton | Emergency Electrician in Moncton, NB \| TLB Electric | 24/7 Emergency Electrical Repair | emergency electrician Moncton |
| new-construction-electrical-moncton | New Construction Electrical \| TLB Electric | New Construction Electrical Rough-In | new construction electrician Moncton |
| electrical-renovation-addition-moncton | Electrical Renovations & Additions \| TLB Electric | Electrical Renovations & Additions | electrical renovation Moncton |
| smoke-co-detector-installation-moncton | Smoke & CO Detector Installation \| TLB Electric | Hardwired Smoke & CO Detector Installation | smoke detector installation Moncton |

**Required metadata for the 3 new geo pages (drafted fresh per DOCX Section 7 guidance — genuine neighbourhood detail, not templated city-swaps):**

| Slug | title | h1 | targetKeyword |
|---|---|---|---|
| electrician-dieppe-nb | Electrician in Dieppe, NB \| TLB Electric | Your Local Electrician in Dieppe, NB | electrician Dieppe NB |
| electrician-riverview-nb | Electrician in Riverview, NB \| TLB Electric | Your Local Electrician in Riverview, NB | electrician Riverview NB |
| emergency-electrician-dieppe-nb | Emergency Electrician in Dieppe, NB \| TLB Electric | 24/7 Emergency Electrician Serving Dieppe, NB | emergency electrician Dieppe |

- [ ] **Step 1: Write the category file** — same pattern as Task 7 Step 1, `order: 4`.

- [ ] **Step 2: Write the 6 Core-30 service files** — same pattern as Task 7 Step 2, `category: "specialty-electrical-services-moncton"`, `order: 1`–`6` matching table order. Relate `ev-charger-installation-moncton` to `commercial-ev-charger-installation-moncton`; relate `new-construction-electrical-moncton` to `electrical-renovation-addition-moncton`; relate `emergency-electrician-moncton` to `smoke-co-detector-installation-moncton` (both urgent-safety-oriented).

- [ ] **Step 3: Write the 3 geo files** — set `type: "geo"`, `category: "specialty-electrical-services-moncton"`, `order: 7`–`9`. For `intro` and body content, include genuine neighbourhood/landmark references for Dieppe (e.g. Champlain Place area, Dieppe's residential growth corridors) and Riverview (e.g. its riverside residential neighbourhoods), per the DOCX's explicit instruction to avoid templated city-name-swap content. `whatsIncluded` for geo pages should list the core services available in that specific town (residential wiring, panel upgrades, emergency repair) rather than repeating the full Core-30 service list. `relatedServices` for geo pages should point to `emergency-electrician-moncton` and `ev-charger-installation-moncton` (broadly useful cross-links back into the Core 30, still within this silo's category grouping).

- [ ] **Step 4: Verify**

Run: `npx astro check`
Expected: No schema errors for any of the 10 new files, including the `type: "geo"` entries validating against the `z.enum(['service', 'geo'])` field.

Run: `npm run build`
Expected: Build succeeds; all 10 new page HTML files exist with correct titles per the tables above.

---

## Task 11: Full-Site Verification

**Files:** none created or modified — verification only.

**Interfaces:** none — this task exercises every interface produced by Tasks 1–10.

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: Build completes with 0 errors. Output should report 33 total pages built (1 homepage + 4 categories + 25 services + 3 geo).

- [ ] **Step 2: Confirm sitemap includes all new pages**

Run: `Get-Content dist/sitemap-index.xml` (or the platform-appropriate path if building under the `/TLBv1` base — check `dist/TLBv1/sitemap-index.xml` in that case), then inspect the referenced `sitemap-0.xml`.
Expected: The sitemap XML lists all 33 page URLs (spot-check a handful from each silo plus all 3 geo pages) — `@astrojs/sitemap` picks these up automatically from the build output, no config change needed.

- [ ] **Step 3: Spot-check one page per silo in the dev server**

Run: `npm run dev`, then open each of:
- `http://localhost:4321/TLBv1/` (homepage — check mega-menu, 4 category tiles, map embed, reviews placeholder)
- `http://localhost:4321/TLBv1/residential-electrical-moncton` (category page — check service grid links to all 8 services)
- `http://localhost:4321/TLBv1/home-rewiring-moncton` (service page — check breadcrumb, What's Included list, image slot, related links)
- `http://localhost:4321/TLBv1/commercial-lighting-retrofit-moncton` (silo 2 — check NB Power grant mention renders)
- `http://localhost:4321/TLBv1/whole-home-surge-protection-moncton` (silo 3)
- `http://localhost:4321/TLBv1/emergency-electrician-moncton` (silo 4)
- `http://localhost:4321/TLBv1/electrician-dieppe-nb` (geo page — check it reads as genuine local content, not a templated swap)

Expected: Every page uses identical brand colors/fonts/logo/header/footer; breadcrumbs are correct for each page's silo; no console errors in the browser dev tools.

- [ ] **Step 4: Confirm no cross-silo links exist**

Run a search across the new content files for any `relatedServices` entry that references a slug belonging to a different silo than the entry itself.

Run: `Select-String -Path "src/content/services/*.md" -Pattern "relatedServices"` (PowerShell) and manually cross-reference each listed slug against the silo tables in Tasks 7–10.
Expected: Every `relatedServices` entry points only to slugs within its own silo (per the Global Constraints strict-silo rule).

---

## Task 12: GBP Update Recommendations TXT Deliverable

**Files:**
- Create: `GBP_Update_Recommendations.txt` (repo root, alongside the source DOCX)

**Interfaces:** none — standalone reference document, not consumed by the site build.

- [ ] **Step 1: Write the deliverable**

Create `GBP_Update_Recommendations.txt` with the following content:

```text
TLB ELECTRIC — GOOGLE BUSINESS PROFILE UPDATE RECOMMENDATIONS
Prepared to align the GBP listing with the Core 30 website structure.
Note: GBP owner access was blocked at the time this was prepared (per
TLB_Electric_Core30_SEO_Structure.docx, Section 8). Use this file as the
target to apply once access is restored — nothing here has been pushed
live to Google.

============================================================
1. BUSINESS NAME / NAP (confirm exactly matches current listing)
============================================================
Name:    TLB Electric
Phone:   506-875-5337
Email:   info@TLBELECTRIC.ca
Website: https://tlbelectric.ca
Service area: Moncton, Dieppe, Riverview, NB (service-area business —
no public street address, per confirmed site model)

============================================================
2. CATEGORIES
============================================================
Primary category (required, exact GBP match):
  Electrician

Recommended secondary categories (2-3 max — current 2026 best practice
penalizes "category stuffing"; do NOT add all 8-10 the source doc
mentions as a ceiling):
  - Electrical installation service
  - Electrical contractor
  - Lighting contractor   (only if lighting work is a genuine ongoing
                            focus — optional third category)

IMPORTANT: Verify exact spelling/casing of each category live in the
GBP category picker before saving — Google edits its category taxonomy
roughly 40 times per year, so treat the above as accurate as of this
writing but not guaranteed current.

============================================================
3. SERVICES LIST (add under the Services section of the GBP dashboard)
============================================================
Each line below is formatted as: Service name | Description (<=300 chars)
GBP does NOT currently support linking an individual service line to a
specific website URL (verified via Google's own support documentation,
not assumed) — the website's internal linking structure (see the new
Core 30 pages) is what carries that signal, not the GBP services list
itself.

Residential Electrical:
  Home Rewiring | Full or partial home rewiring for older or unsafe electrical systems.
  Outlet & Switch Installation | Installation and replacement of electrical outlets and switches.
  Lighting Installation & Upgrades | Residential lighting installation, fixture upgrades, and dimmer wiring.
  Ceiling Fan Installation | Safe, code-compliant ceiling fan installation with proper electrical box support.
  Home Electrical Inspections | Full home electrical safety inspections for buyers, sellers, and owners.
  Knob & Tube Wiring Replacement | Replacement of outdated knob-and-tube wiring in older homes.
  Aluminum Wiring Repair | Repair and remediation of aluminum branch-circuit wiring hazards.
  Hot Tub & Pool Electrical Hookups | Dedicated circuit installation for hot tubs and pool equipment.

Commercial & Industrial Electrical:
  Commercial Electrical Wiring | New wiring and electrical buildouts for commercial spaces.
  Office & Retail Lighting | Lighting design and installation for offices and retail spaces.
  Commercial Electrical Maintenance | Ongoing electrical maintenance contracts for businesses.
  Industrial Electrical Services | Electrical installation and repair for industrial facilities.
  Commercial Lighting Retrofits | LED lighting retrofits, NB Power grant-eligible projects.
  Electrical Code Compliance & Inspections | Code compliance audits and inspections for businesses.

Panel & Power Upgrades:
  Electrical Panel Upgrades | Panel capacity upgrades (100A to 200A) for growing electrical loads.
  Federal Pioneer Panel Replacement | Replacement of older Federal Pioneer electrical panels.
  Generator Hookups & Generlink Installation | Backup generator hookup and Generlink installation.
  Circuit Breaker Replacement & Repair | Diagnosis and replacement of faulty circuit breakers.
  Whole-Home Surge Protection | Whole-home surge protector installation at the main panel.

EV Charging, New Construction & Emergency:
  Home EV Charger Installation | Level 2 EV charger installation for residential garages/driveways.
  Commercial EV Charger Installation | EV charging station installation for commercial properties.
  24/7 Emergency Electrical Repair | Emergency call-out electrical repair, available 24/7.
  New Construction Electrical Rough-In | Full electrical rough-in for new home construction.
  Electrical Renovations & Additions | Electrical work for home renovations and additions.
  Hardwired Smoke & CO Detector Installation | Hardwired, interconnected smoke and CO detector installation.

============================================================
4. BUSINESS DESCRIPTION (GBP limit: ~750 characters)
============================================================
TLB Electric is a licensed and insured electrical contractor serving
Moncton, Dieppe, and Riverview, New Brunswick. We handle residential
and commercial electrical work of every size — from a single outlet
to full home rewiring, panel upgrades, EV charger installation, new
construction rough-in, and 24/7 emergency electrical repair. Every job
is performed by a licensed electrician, done to code, with clear
upfront pricing and no surprises. Free quotes available.

============================================================
5. WEBSITE / ACTION LINKS
============================================================
Website URL:        https://tlbelectric.ca
Appointment/Quote:  https://tlbelectric.ca/#contact
Additional links (profile "sameAs" / social):
  https://www.instagram.com/TLBELECTRIC
  https://www.facebook.com/p/TLB-Electric-61587323362780/

============================================================
6. OPEN ITEMS / DEPENDENCIES (per source doc Section 8)
============================================================
- GBP owner access is currently blocked — this file cannot be applied
  until access is restored.
- Once access is restored, confirm the exact wording of each category
  live in the GBP picker before saving (see Section 2 note above).
- Reviews widget: obtain the GBP Place ID once access is restored, then
  replace the ReviewsPlaceholder component on the homepage
  (src/components/ReviewsPlaceholder.astro) with a live reviews embed.
- Run a local rank map (grid search across Moncton, Dieppe, Riverview)
  per source doc Section 2 once the Core 30 site is live, to decide
  whether further Phase 2 geo-expansion pages are warranted beyond the
  3 already included in this build.
- Set up Google Search Console and submit the updated sitemap
  (https://tlbelectric.ca/sitemap-index.xml) once the new pages are
  deployed to production.
```

- [ ] **Step 2: Verify the file is well-formed and complete**

Run: `Get-Content "GBP_Update_Recommendations.txt" | Measure-Object -Line`
Expected: File exists at repo root with all 6 numbered sections present, service count under section 3 totals 25 (8+6+5+6), matching the 25 Core-30 services built across Tasks 7–10.

---

## Plan Self-Review Notes

- **Spec coverage:** Sitemap/architecture (Task 3), navigation (Task 4), footer (Task 5), homepage 7-signals (Task 6), all 4 silos' verbatim DOCX metadata (Tasks 7–10), geo pages (Task 10), strict-silo linking (enforced in Tasks 7–10 relatedServices guidance + checked in Task 11 Step 4), schema markup (Tasks 3 CategoryLayout/ServiceLayout), sitemap generation (Task 11 Step 2, no config change needed since `@astrojs/sitemap` already installed), GBP deliverable (Task 12) — every section of the approved design doc maps to a task above.
- **No git commits anywhere in this plan**, per the user's explicit decision — verification steps use build/dev-server checks only, never `git add`/`commit`.
- **Type consistency check:** `CollectionEntry<'categories'>` / `CollectionEntry<'services'>` naming is consistent across Task 2 (Layout prop), Task 3 (CategoryLayout/ServiceLayout props), Task 4 (Header consuming the same collections). Field names (`h1`, `metaDescription`, `targetKeyword`, `relatedServices`, `whatsIncluded`, `localRelevance`, `intro`, `order`, `category`, `type`) are used identically in Task 1's schema and every consuming task thereafter.
