# Service Page Consolidation & Geo Expansion — Design

**Date:** 2026-08-11
**Status:** Approved (pending spec review)
**Supersedes parts of:** `2026-07-07-core30-seo-redesign-design.md`

## Problem

The Core 30 build produced six category landing pages that sit between `/services` and the
35 service detail pages. They add a navigation hop without earning their own rankings —
each one targets a broad head term ("residential electrician Moncton") that the homepage
and the specific service pages already compete for, and each dilutes internal link equity
that should flow to the service pages.

Separately, the site has only three geo pages. TLB Electric's service area is
Moncton, Dieppe, and Riverview — three cities, so per-city hub pages alone cannot produce
meaningful local coverage. The coverage has to come from service × city combinations.

## Goals

1. Replace the six category landing pages with a single `/services` hub.
2. Preserve all 35 service detail pages and the copy already written for the categories.
3. Expand geo coverage from 3 pages to 13 with genuinely distinct, city-specific content.
4. Add the one missing service from the client's list: mini split & heat pump wiring.
5. Leave no orphaned pages.

## Non-Goals

- No changes to header nav, contact form, reviews carousel, or `Layout.astro` schema plumbing.
- No rewriting of the 34 existing service pages' body copy.
- No new service areas beyond Moncton / Dieppe / Riverview.
- No Moncton neighbourhood-level *pages* (neighbourhoods appear as content within the
  Moncton hub page, not as separate URLs).

---

## Architecture

### The `categories` collection is demoted to data

The collection is **kept** — its `h1` and body copy become the section headings and intro
paragraphs on `/services`. It simply stops generating pages.

- `src/pages/[slug].astro` no longer emits `categoryPaths`.
- `src/layouts/CategoryLayout.astro` is **deleted**.
- The `category:` field on every service entry keeps working unchanged. No content
  migration, no schema change to `services`.
- Section anchors on `/services` are the category `id` (e.g. `/services#residential-electrical-moncton`).
  No new frontmatter field is introduced for this.

### `/services` becomes the hub

Page composition, top to bottom:

1. `PageHero` — breadcrumb `Home › Services`, h1 "Our Electrical Services".
2. Six sections, ordered by `category.order`. Each renders:
   - `<h2>` from `category.data.h1`, with `id={category.id}` for anchor linking
   - the category's rendered markdown body as an intro paragraph
   - a card grid of that category's services (`type !== 'geo'`), each card showing the
     service `h1` and a truncated `intro`, linking to `/{service.id}`
3. **Service Areas** block — links to all 13 geo pages, grouped by city. This is the sole
   internal-link path to the geo pages; without it they are orphaned.
4. `QuoteCTA` + `ContactForm` (unchanged).

New component: `src/components/ServiceDirectory.astro` renders sections 2 and 3.
`CategoryGrid.astro` is retained but its card `href`s change from `/{cat.id}` to
`/services#{cat.id}` — it is still used on the homepage.

### Cascading edits

| File | Change |
|---|---|
| `src/pages/[slug].astro` | Remove `categoryPaths` and the `kind === 'category'` branch |
| `src/pages/services.astro` | Swap `CategoryGrid` for `ServiceDirectory`; update hero intro copy |
| `src/layouts/CategoryLayout.astro` | Delete |
| `src/layouts/ServiceLayout.astro` | Breadcrumb + JSON-LD `BreadcrumbList` + RelatedLinks "back" link: `Home › {Category} › {Service}` becomes `Home › Services › {Service}`, pointing at `/services`. Drop the `getEntry('categories', …)` lookup for breadcrumbs. **Keep** `photoByCategory[category]` — the category field still drives hero imagery. |
| `src/components/CategoryGrid.astro` | `href` → `/services#{cat.id}` |
| `src/components/Footer.astro` | Services column: six dead category URLs → six `/services#{cat.id}` anchors. Labels unchanged. |
| `src/components/Services.astro` | No code change (inherits `CategoryGrid` href fix) |
| `src/content.config.ts` | No change — `categories` stays defined, just unused as a route source |

### Redirects

**None required.** The entire Core 30 build is uncommitted and has never been deployed, so
the six category URLs were never published or indexed. Verify before shipping by confirming
`tlbelectric.ca/residential-electrical-moncton` 404s on the live site. If any category URL
*is* live, add a 301 to `/services#{id}` in `public/_redirects` before deploy.

---

## Content

### New service (1)

`src/content/services/mini-split-heat-pump-wiring-moncton.md`

- `category: residential-electrical-moncton`, `type: service`
- Target keyword: "mini split wiring Moncton" / "heat pump electrical hookup Moncton"
- `order` assigned so it sorts between aluminum wiring repair and hot tub & pool hookups,
  renumbering the following residential entries as needed to keep `order` contiguous.
- Angle: NB Power heat pump rebates have driven high adoption; most installs need a new
  dedicated 240V circuit and often reveal a panel at capacity. Cross-link to
  `electrical-panel-upgrade-moncton`.

### New geo pages (10)

All carry `type: "geo"`, which keeps them out of the six category sections on `/services`
and out of `RelatedLinks` service groupings — matching how the three existing geo pages
already behave.

**Moncton (1 new)**

| Slug | Notes |
|---|---|
| `electrician-moncton-nb` | **NEW** |

**Dieppe (4 new, 2 existing)**

| Slug | Status |
|---|---|
| `electrician-dieppe-nb` | exists |
| `emergency-electrician-dieppe-nb` | exists |
| `electrical-panel-upgrade-dieppe-nb` | NEW |
| `ev-charger-installation-dieppe-nb` | NEW |
| `home-rewiring-dieppe-nb` | NEW |
| `hot-tub-pool-electrical-hookup-dieppe-nb` | NEW |

**Riverview (5 new, 1 existing)**

| Slug | Status |
|---|---|
| `electrician-riverview-nb` | exists |
| `emergency-electrician-riverview-nb` | NEW |
| `electrical-panel-upgrade-riverview-nb` | NEW |
| `federal-pioneer-panel-replacement-riverview-nb` | NEW |
| `knob-and-tube-wiring-replacement-riverview-nb` | NEW |
| `home-rewiring-riverview-nb` | NEW |

**Total geo: 13 (3 existing + 10 new).**

### Why these service × city pairings

The service list per city is matched to that city's actual housing stock, not applied as a
uniform grid. This is what keeps the pages substantively different from each other and from
the Moncton parent service page — the difference between a local page and a doorway page.

- **Dieppe** — fast residential growth over the last 15–20 years; newer builds wired to
  recent code but on conservatively-sized services now carrying finished basements, home
  offices, and EV chargers. Hence panel upgrades, EV charging, hot tubs. Home rewiring covers
  the older Dieppe core near the city line.
- **Riverview** — substantially older housing stock. Federal Pioneer panels and
  knob-and-tube are common enough to justify dedicated pages; these are the two highest-intent
  local queries in that market. Emergency and panel upgrades round it out.
- Knob-and-tube and Federal Pioneer are deliberately **not** duplicated for Dieppe, and hot
  tub is not duplicated for Riverview, because the honest local content isn't there.

### Geo page content requirements

Each geo page must contain, and must not be a find-and-replace of its Moncton parent:

- Era and character of the local housing stock, specific to that city
- Named neighbourhoods, landmarks, or streets (e.g. Champlain Place and Chartersville for
  Dieppe; Coverdale, Gunningsville, Pine Glen for Riverview)
- The specific electrical conditions typically found there
- `localRelevance` frontmatter written fresh per page
- `relatedServices` pointing at both the Moncton parent service and the city hub page

---

## Decision record: the Moncton hub page

**Concern raised:** `/electrician-moncton-nb` targets substantially the same query as the
homepage, which is the site's strongest page. Two pages aiming at "electrician Moncton"
split ranking signals rather than adding to them.

**Decision:** Build it. Client reaffirmed after the concern was raised.

**Mitigation:** Differentiate the page so the overlap is as small as possible.

- The homepage retains the head term "electrician Moncton". Do not re-optimize it.
- The Moncton hub targets neighbourhood- and area-qualified long tail: "local electrician
  Moncton NB", "electrician near me Moncton", "electrician west end Moncton".
- Content is neighbourhood-level and covers ground the homepage does not: West End, North
  End, Lewisville, Sunny Brae, Magnetic Hill, downtown — each with its housing era and
  typical electrical conditions. The homepage carries none of this.
- Page positions itself as the service-area page, not a second front door.
- **Watch after launch:** if Search Console shows the two pages trading positions on the
  same query, consolidate by 301'ing this page to the homepage.

---

## Final page count

| | Before | After |
|---|---|---|
| Homepage | 1 | 1 |
| Services hub | 1 | 1 |
| Category pages | 6 | 0 |
| Service detail pages | 34 | 35 |
| Geo pages | 3 | 13 |
| **Total** | **45** | **50** |

## Verification

1. `npm run build` succeeds with no unresolved content references.
2. Build output contains no `residential-electrical-moncton/index.html` (or any of the other
   five category pages).
3. Build output contains all 35 service pages, all 13 geo pages, and `/services`.
4. Every one of the 13 geo pages is reachable from `/services`; no page in the sitemap lacks
   an inbound internal link.
5. No internal link in the built output resolves to a deleted category URL —
   grep `dist/` for the six category slugs; the only permitted hits are `/services#<slug>`
   anchor fragments.
6. `/services` renders 6 sections, 35 service cards, and the Service Areas block.
7. Breadcrumb JSON-LD on a service page validates and shows `Home › Services › {Service}`.
