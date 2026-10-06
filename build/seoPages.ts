import type { Plugin } from 'vite';
import { createHead, transformHtmlTemplate } from 'unhead/server';
import { ALL_PAGES, absoluteUrl, buildHead } from '../src/seo/site.ts';

/**
 * Writes one HTML file per page and language (dist/<path>/index.html), each
 * with its own lang, title, description, canonical, hreflang and Open Graph
 * tags, plus sitemap.xml. The body stays client-rendered; this only makes the
 * head right for crawlers and link previews that read the raw HTML. At runtime
 * @unhead/vue keeps the same head (same buildHead) during navigation.
 */
export const seoPages = (): Plugin => ({
  name: 'meteo-seo-pages',
  apply: 'build',
  // After Vite's HTML plugin, which adds index.html to the bundle.
  enforce: 'post',
  generateBundle(_, bundle) {
    const template = bundle['index.html'];
    if (template?.type !== 'asset' || typeof template.source !== 'string') {
      this.error('index.html missing from the bundle');
    }
    const html = template.source;

    for (const { page, locale, path } of ALL_PAGES) {
      const head = createHead();
      head.push(buildHead(page, locale));
      const source = transformHtmlTemplate(head, html);
      const fileName = `${path.slice(1)}index.html`;
      if (fileName === 'index.html') {
        template.source = source;
      } else {
        this.emitFile({ type: 'asset', fileName, source });
      }
    }

    // hreflang lives in each page's head, so the sitemap only lists URLs.
    const urls = ALL_PAGES.map(({ path }) => `  <url><loc>${absoluteUrl(path)}</loc></url>`).join('\n');
    this.emitFile({
      type: 'asset',
      fileName: 'sitemap.xml',
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    });
  },
});
