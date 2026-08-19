// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isCloudflare = process.env.CF_PAGES === '1';

// GitHub Pages serves a project site from /<repo>, so the build needs that as
// its base. Derive it from the slug Actions exports (owner/repo) rather than
// hardcoding: the literal '/TLB-Dev' here outlived the repo it named, and every
// asset 404d on the Pages preview until it was noticed. The fallback only
// applies to local builds, where nothing is serving under a path prefix anyway.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'TLBv2';
const base = isCloudflare ? undefined : `/${repoName}`;

/**
 * Prefixes root-relative links written inside markdown bodies with the configured
 * `base`. Astro applies `base` to component hrefs via BASE_URL, but markdown links
 * are passed through untouched — without this, `[text](/some-page)` in content
 * 404s on any build where `base` is set (i.e. the GitHub Pages preview and local dev).
 */
function rehypeBaseLinks() {
  const prefix = base ?? '';
  return (/** @type {any} */ tree) => {
    if (!prefix) return;
    const visit = (/** @type {any} */ node) => {
      if (node.tagName === 'a' && typeof node.properties?.href === 'string') {
        const href = node.properties.href;
        if (href.startsWith('/') && !href.startsWith('//')) {
          node.properties.href = prefix + href;
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: isCloudflare ? 'https://tlbelectric.ca' : 'https://enewell01.github.io',
  base,
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  markdown: {
    rehypePlugins: [rehypeBaseLinks],
  },
});
