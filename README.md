# Cartise

Bilingual Portuguese/English landing page for Cartise, built with React and Vite.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run test:forms
npm run build
npm run test:seo
```

The campaign and TVDE driver forms submit to `hello@cartise.pt` through FormSubmit. The first live submission requires the recipient to confirm FormSubmit's activation email.

Deployment uses the existing Cloudflare Pages project `cartise`, connected to `linares222/cartise` (`main`). Build command: `npm run build`. Output directory: `dist/client`. Public domains: `cartise.pt` and `www.cartise.pt`.
