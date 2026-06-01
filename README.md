# FX–Brief Frontend

Angular 17 frontend for FX–Brief. Built incrementally in phases; this repository
currently contains the Phase 6A foundation (project setup, routing, layouts,
auth plumbing, SEO basics, pre-rendering).

## Requirements

- Node.js 18.19+ or 20.9+ (Angular 17 requirement)
- npm

## Build (production)

```bash
npm install
ng build --configuration production
npm run sitemap   # generates dist/fxbrief-frontend/browser/sitemap.xml
```

`ng build --configuration production` selects `environment.prod.ts` and
pre-renders the static public routes listed in `prerender-routes.txt`. Output is
written to `dist/fxbrief-frontend/browser`.

The sitemap step reads `GET /public/sitemap-entries` from the backend; override
the origins with env vars if needed:

```bash
APP_URL=https://fx-brief.com API_URL=https://api.fx-brief.com npm run sitemap
```

## Serve the static build (VPS testing)

```bash
npx serve -s dist/fxbrief-frontend/browser -l 4200
```

Then open `http://VPS_IP:4200` from a browser. Do not use `ng serve` (local dev
only).

## Configuration

- `src/environments/environment.ts` — development (`apiUrl: http://localhost:8080`)
- `src/environments/environment.prod.ts` — production (`apiUrl: https://api.fx-brief.com`)
