import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { routes, routeFor, SITE_URL } from '../src/routes.js';

export function sitemap() {
  const entries = Object.values(routes).filter(route => !route.noindex).flatMap(route => ['pt', 'en'].map(lang => `<url><loc>${SITE_URL + route[lang]}</loc><xhtml:link rel="alternate" hreflang="pt-PT" href="${SITE_URL + route.pt}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE_URL + route.en}"/></url>`));
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`;
}
export const robots = `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Google-Extended\nDisallow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

// Use the existing React/Vite stack to emit static pages; no runtime application server is required.
export function sitePages() {
  let devServer;
  function routing(server, preview) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') {
        res.setHeader('Content-Type', url.pathname.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
        return res.end(req.method === 'HEAD' ? '' : url.pathname.endsWith('.xml') ? sitemap() : robots);
      }
      if (!['GET', 'HEAD'].includes(req.method)) return next();
      if (/^\/(?:@|src\/|node_modules\/|assets\/|ads\/|models\/)/.test(url.pathname) || url.pathname === '/favicon.svg') return next();
      const route = routeFor(url.pathname);
      if (route.key !== 'notFound' && route.path !== url.pathname) {
        res.statusCode = 308; res.setHeader('Location', route.path + url.search); return res.end();
      }
      try {
        res.statusCode = route.key === 'notFound' ? 404 : 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        let html;
        if (preview) {
          const filename = route.path.endsWith('.html') ? route.path.slice(1) : path.join(route.path.slice(1), 'index.html');
          html = await readFile(path.resolve('dist/client', filename), 'utf8');
        } else {
          html = await server.transformIndexHtml(route.path, await readFile('index.html', 'utf8'));
        }
        res.end(req.method === 'HEAD' ? '' : html);
      } catch (error) { next(error); }
    });
  }
  return {
    name: 'cartise-static-pages',
    configureServer(server) { devServer = server; routing(server, false); },
    configurePreviewServer(server) { routing(server, true); },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, context) {
        if (!devServer) return html;
        const { renderPage } = await devServer.ssrLoadModule('/src/render.jsx');
        return renderPage(html, context.path);
      },
    },
  };
}

export async function writePages(server) {
  const template = await readFile('dist/client/index.html', 'utf8');
  if (!template.includes('<!--page-head-->') || !template.includes('<div id="root"></div>')) throw new Error('Run npm run build to regenerate the empty Vite template before prerendering.');
  const { renderPage } = await server.ssrLoadModule('/src/render.jsx');
  for (const route of Object.values(routes)) for (const lang of ['pt', 'en']) {
    const pathname = route[lang];
    const filename = pathname.endsWith('.html') ? pathname.slice(1) : path.join(pathname.slice(1), 'index.html');
    const target = path.resolve('dist/client', filename);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, renderPage(template, pathname));
  }
  await writeFile('dist/client/sitemap.xml', sitemap());
  await writeFile('dist/client/robots.txt', robots);
}
