import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.jsx';
import { pageLink, routeFor, SITE_URL } from './routes.js';

const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function renderPage(template, pathname) {
  const route = routeFor(pathname);
  const en = route.lang === 'en';
  const title = route.title[en ? 1 : 0] + ' | Cartise';
  const description = route.description[en ? 1 : 0];
  const canonical = SITE_URL + route.path;
  const schema = [{ '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE_URL + '/#organization', name: 'Cartise', url: SITE_URL, email: 'hello@cartise.pt' }];
  if (route.key === 'home' || route.key === 'solution') schema.push({ '@context': 'https://schema.org', '@type': 'Service', name: 'Cartise In-Car DOOH', serviceType: en ? 'Digital advertising inside ride-hailing vehicles' : 'Publicidade digital dentro de veículos TVDE', provider: { '@id': SITE_URL + '/#organization' }, areaServed: [{ '@type': 'City', name: 'Lisboa' }, { '@type': 'City', name: 'Porto' }] });
  if (route.key !== 'home' && route.key !== 'notFound') schema.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Início', item: SITE_URL + pageLink('home', route.lang) }, { '@type': 'ListItem', position: 2, name: route.title[en ? 1 : 0], item: canonical }] });
  const head = `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="robots" content="${route.noindex ? 'noindex, follow' : 'index, follow'}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="pt-PT" href="${SITE_URL + route.pt}">
<link rel="alternate" hreflang="en" href="${SITE_URL + route.en}">
<link rel="alternate" hreflang="x-default" href="${SITE_URL + route.pt}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cartise">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${en ? 'en_GB' : 'pt_PT'}">
<meta property="og:image" content="${SITE_URL}/assets/cartise-hero-passengers.jpg">
<meta property="og:image:alt" content="${en ? 'Illustration of in-car screen advertising' : 'Ilustração de publicidade em ecrã no interior de um veículo'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${SITE_URL}/assets/cartise-hero-passengers.jpg">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`;
  return template.replace('lang="pt-PT"', `lang="${en ? 'en' : 'pt-PT'}"`).replace('<!--page-head-->', head).replace('<div id="root"></div>', `<div id="root">${renderToString(<App pathname={pathname} />)}</div>`);
}
