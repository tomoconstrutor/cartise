import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { routes, routeFor } from '../src/routes.js';
import { sitemap, robots } from '../scripts/site-pages.mjs';
import { isLocalPreview } from '../src/analytics.js';

test('routes distinguish languages, normalise slashes and reject unknown pages', () => {
  assert.equal(routeFor('/en/formats/').key, 'formats');
  assert.equal(routeFor('/formatos').path, '/formatos/');
  assert.equal(routeFor('/en').path, '/en/');
  assert.equal(routeFor('/index.html').path, '/');
  assert.equal(routeFor('/tablet/').path, '/tablet');
  assert.equal(routeFor('/missing').key, 'notFound');
  assert.equal(routeFor('/en/missing').lang, 'en');
});

test('all pages contain rendered content and matching search metadata', async () => {
  const titles = new Set();
  for (const [key, route] of Object.entries(routes)) for (const lang of ['pt', 'en']) {
    const filename = route[lang].endsWith('.html') ? route[lang].slice(1) : path.join(route[lang].slice(1), 'index.html');
    const html = await readFile(path.resolve('dist/client', filename), 'utf8');
    assert.match(html, new RegExp(`<html lang="${lang === 'pt' ? 'pt-PT' : 'en'}"`));
    assert.ok(html.includes(`rel="canonical" href="https://www.cartise.pt${route[lang]}"`), filename);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, filename);
    assert.ok(!html.includes('<!--page-head-->'));
    assert.ok(!html.includes('<div id="root"></div>'));
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), title); titles.add(title);
    assert.ok(html.includes(`content="${route.noindex ? 'noindex, follow' : 'index, follow'}"`));
    for (const match of html.matchAll(/<a\s[^>]*href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
      if (match[1] === '/favicon.svg' || match[1].startsWith('/assets/')) continue;
      if (match[1].endsWith('/404.html')) continue;
      assert.notEqual(routeFor(match[1]).key, 'notFound', `${filename}: ${match[1]}`);
    }
    if (key === 'home') { assert.match(html, /Lisboa|Lisbon/); assert.match(html, /Porto/); }
  }
});

test('sitemap lists indexable bilingual pages only and crawler policies separate search from training', () => {
  const xml = sitemap();
  assert.match(xml, /^<\?xml/);
  assert.equal((xml.match(/<loc>/g) || []).length, Object.values(routes).filter(r => !r.noindex).length * 2);
  assert.ok(!xml.includes('/tablet'));
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
});

test('test mode includes loopback and local network previews', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]', 'terminal.local', '192.168.1.2', '10.0.0.2', '172.16.0.2']) assert.ok(isLocalPreview(host), host);
  assert.equal(isLocalPreview('cartise.pt'), false);
  assert.equal(isLocalPreview('localhost.example.com'), false);
});

test('Canva example images and tablet model are present', async () => {
  for (const file of ['cafe.jpg', 'viagem.jpg', 'evento.jpg', 'comida.jpg', 'cultura.jpg', 'bemestar.jpg']) await access(`dist/client/ads/${file}`);
  await access('dist/client/models/cartise-tablet.glb');
});

test('local server serves proper 404s, canonical redirects and XML responses', async () => {
  const { sitePages } = await import('../scripts/site-pages.mjs');
  let handle;
  sitePages().configurePreviewServer({ middlewares: { use: callback => { handle = callback; } } });
  async function request(url, method = 'GET', accept = 'text/html') {
    const headers = {};
    const response = { statusCode: 200, setHeader: (name, value) => { headers[name] = value; }, end: body => { response.body = body; } };
    let passed = false;
    await handle({ url, method, headers: { accept } }, response, error => { if (error) throw error; passed = true; });
    return { ...response, headers, passed };
  }
  const unknown = await request('/en/does-not-exist');
  assert.equal(unknown.statusCode, 404);
  assert.equal((await request('/missing', 'GET', '*/*')).statusCode, 404);
  assert.match(unknown.body, /This page left the route/);
  const redirect = await request('/formatos?source=test');
  assert.equal(redirect.statusCode, 308);
  assert.equal(redirect.headers.Location, '/formatos/?source=test');
  const page = await request('/en/formats/');
  assert.equal(page.statusCode, 200);
  assert.match(page.body, /In-car advertising formats/);
  const map = await request('/sitemap.xml');
  assert.match(map.headers['Content-Type'], /application\/xml/);
  assert.match(map.body, /^<\?xml/);
  assert.equal((await request('/contacto/', 'HEAD')).body, '');
  assert.equal((await request('/contacto/', 'POST')).passed, true);
});
