import { createServer } from 'vite';
import { createServer as createHttpServer } from 'node:http';
import { writePages } from './site-pages.mjs';
const server = await createServer({ server: { middlewareMode: true, hmr: { server: createHttpServer() }, watch: null }, appType: 'custom' });
try { await writePages(server); console.log('Prerendered PT/EN pages, sitemap and robots.'); }
finally { await server.close(); }
