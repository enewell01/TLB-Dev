# TLB Electric — Core 30 SEO Redesign & GBP Alignment

**Date:** 2026-07-07
**Status:** Approved by user, pending implementation plan
**Source spec:** `TLB_Electric_Core30_SEO_Structure.docx` (repo root)

## Goal

Expand the current single-page Astro marketing site into a "Core 30" SEO site structure — one homepage, four category (silo) pages, and ~25 service pages, one per Google Business Profile (GBP) service — so the site's page structure mirrors the GBP listing line-for-line. Keep the existing visual brand (colors, logo, fonts, header/footer chrome) unchanged. Produce a companion GBP-update TXT file listing the categories, services, and other profile fields to align once GBP owner access is restored. All work stays local (no git init/commit/push) — the user will provide a new repo destination afterward.

## Decisions Confirmed With User

1. **Scope:** Build the full Core 30 (homepage + 4 categories + 25 services) in one pass, not a phased subset.
2. **Images/proof points:** No real photos available yet. Use icon-based sections and labeled placeholder slots (clear `IMAGE SLOT` markers) instead of stock photography, so real photos can be dropped in later without a redesign.
3. **Address/schema model:** Service-area-only. No public street address. Google Maps embed shows a service-area boundary, not a fixed pin. Schema uses `areaServed` without a fixed `PostalAddress` street address.
4. **Phase 2 geo pages:** Included now (not held back), per user's explicit choice to override the doc's own "wait for rank-map data" sequencing: `/electrician-dieppe-nb`, `/electrician-riverview-nb`, `/emergency-electrician-dieppe-nb`.
5. **Page architecture:** Shared template + data files (Astro Content Collections), not 25+ individually hand-written page files.

## Site Structure (33 pages)

```
/                                          Homepage (redesigned in place, same URL)
/residential-electrical-moncton            Category 1 — Residential Electrical Services
/commercial-electrical-moncton              Category 2 — Commercial & Industrial Electrical Services
/panel-upgrades-moncton                    Category 3 — Panel & Power Upgrades
/specialty-electrical-services-moncton     Category 4 — EV Charging, New Construction & Emergency Services
```

Each category has its service pages nested under it (silo). Full list of 25 service URLs, titles, H1s, and target keywords comes directly from `TLB_Electric_Core30_SEO_Structure.docx` Section 5 — that document is the literal content spec and must not be altered when implementing (URLs, title tags, H1s, and target keywords are copied verbatim).

Geo pages (new, not in DOCX, drafted fresh following the DOCX's Section 7 guidance):
```
/electrician-dieppe-nb
/electrician-riverview-nb
/emergency-electrician-dieppe-nb
```

### Internal linking rules (strict silo model)

- Homepage → all 4 category pages, contextual in-body links (not just nav).
- Each category page → every service page in its silo, plus back to homepage.
- Each service page → its parent category page, plus 2–3 related services in the **same silo only**.
- No cross-silo links (e.g., never link Ceiling Fan Installation to Industrial Electrical Services) — preserves topical relevance per the doc's Section 6.
- Breadcrumbs (Home → Category → Service) on every non-homepage page, with matching `BreadcrumbList` schema.

### Navigation change

Current anchor-based single-page nav (`#services`, `#why-us`, `#contact`) becomes a mega-menu: "Services" opens a 4-column dropdown (one column per category, listing its child services). "Home" / "About" / "Contact" remain simple links. Mobile collapses to an accordion matching the existing mobile-menu pattern in `Header.astro`. No visual/brand changes — same colors, logo, fonts, header/footer chrome as today.

## Template Architecture

- `src/content/config.ts` — two Astro Content Collections: `categories` (4 entries) and `services` (25 Core-30 + 3 geo = 28 entries). Each entry is a data file (frontmatter: title, H1, meta description, target keyword, parent silo, related-service slugs, body copy sections).
- `src/layouts/CategoryLayout.astro` — single template rendering all 4 category pages.
- `src/layouts/ServiceLayout.astro` — single template rendering all 25 service pages + 3 geo pages (geo entries use a `type: "geo"` flag to swap in neighbourhood-specific intro/proof-point copy instead of the standard service copy pattern).
- `src/pages/[...slug].astro`-style dynamic routes (or one per collection) generate static HTML per entry at build time — output is still fully static, this is a maintainability choice only.

### Per-page template sections

1. Compact hero band (charcoal/red gradient — no stock photo, keeps all pages visually consistent) with H1, breadcrumb, intro sentence aligned to the target keyword, phone/quote CTA.
2. "What's included" bullet list — service-specific written content, not filler.
3. "Why TLB Electric" trust block (reusing existing `WhyUs` point style).
4. Local-relevance paragraph mentioning Moncton/Dieppe/Riverview only where genuinely relevant to that job type (per doc Section 5 instruction).
5. Related-services block (same-silo links only).
6. Category pages additionally get a service-card grid linking to every child service page.
7. Shared `QuoteCTA` + `ContactForm` sections at the bottom of every page (reuse existing components as-is).
8. Labeled placeholder image slots (HTML comment + neutral icon panel) marking where a real project photo goes later.

### Schema per page type

- **Homepage:** keep existing `Electrician` schema; add explicit service-area note (no fixed address); add `BreadcrumbList`; add Google Maps service-area embed (not a fixed pin).
- **Category pages:** `Service` schema (broad, e.g. "Residential Electrical Services") with `provider` referencing the homepage's `Electrician`/`LocalBusiness` entity, plus `BreadcrumbList`.
- **Service pages:** narrower `Service` schema per page matching the exact target keyword, plus `BreadcrumbList`.
- **Sitemap:** already wired via `@astrojs/sitemap` in `astro.config.mjs` — no config change needed; new static routes are picked up automatically on build.

### Homepage-specific changes ("7 Consistency Signals" from doc Section 3)

Title tag and H1 already match the target. NAP already correct. Adding: Google Maps service-area embed; contextual in-body links to all 4 category pages from the services section; a reviews-widget placeholder block clearly marked "pending GBP Place ID access" (not a fake/mocked widget); `BreadcrumbList` schema added to existing schema block.

## Content Drafting via Subagents

25 service pages + 4 category pages + 3 geo pages have independent content — no page's copy depends on another's. Dispatch **4 parallel subagents, one per silo** (Residential; Commercial & Industrial; Panel & Power; EV/Construction/Emergency + the 3 geo pages), each given:

- The exact DOCX rows for its silo (title/H1/meta/keyword are non-negotiable, copied verbatim).
- A shared voice/style brief derived from the current site's tone (direct, confident, locally-grounded, no fluff).
- The template section list above.
- Instruction to flag rather than invent any fact requiring real business info the agent doesn't have (years in business, certifications, etc.).

All 4 outputs get reviewed and reconciled by the orchestrating session before final files are written, to keep voice consistent across silos.

## GBP Update TXT Deliverable

Research into Google's live category taxonomy (verified via web search, not assumed) informs this file's contents:

- **Primary category:** `Electrician` (confirmed exact GBP category name).
- **Secondary categories (2–3 max, not the doc's stated 8–10):** current best practice (2026) penalizes "category stuffing" — recommend `Electrical installation service`, `Electrical contractor`, and optionally `Lighting contractor` if lighting work is a genuine focus. Note: exact wording should be re-verified live in the GBP category picker before submission, since Google's taxonomy changes roughly 40x/year.
- **Services list (~25–30 entries):** mapped 1:1 to the Core-30 service names, each with a ≤300-character description aligned to that page's target keyword. Explicit note that GBP's Services feature does **not** currently support linking each service line to its own website URL (verified, not assumed) — the site's own internal silo linking carries that signal instead, not GBP itself.
- **Business description** (~750 char GBP limit), NAP block, website URL, service-area city list, and existing social links (Instagram, Facebook) as profile links.
- **Explicitly flagged open items:** GBP owner access is currently blocked (per doc Section 8) — this file is the "align to this once access is restored" reference, not something pushed live by this work. Address/service-area schema decision is resolved (service-area-only) and not an open item.

## Verification Plan

All work stays local — no `git init`, commit, or push (user will provide a destination repo later). Verification:

1. `npm install` (sitemap integration already present) and `npm run build` — confirm all 33 pages compile with no Astro/type errors.
2. Spot-check `dist/` output contains distinct static HTML files for a sample page from each silo plus all 3 geo pages.
3. `npm run dev` and visually check: homepage, one category page, one service page, one geo page — confirm nav (including new mega-menu), breadcrumbs, mobile menu, and colors/logo all render correctly and match the existing brand.

## Explicitly Out of Scope

- Pushing GBP changes live (owner access is blocked; this produces a reference file only).
- Real project photography or customer testimonials (placeholders only, per user decision).
- Fixed street address / storefront schema (service-area-only, per user decision).
- Any git commit, push, or new-repo setup (explicitly local-only per user instruction).
