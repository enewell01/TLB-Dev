// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isCloudflare = process.env.CF_PAGES === '1';
const base = isCloudflare ? undefined : '/TLB-Dev';

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
