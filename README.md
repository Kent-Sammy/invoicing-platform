# Invoice Platform

A premium, design-led invoice and business-document platform. Create a beautiful, professional invoice in under 60 seconds — no account required.

## Getting started

Requires Node.js 24 LTS.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |

## Development sandbox

`/dev/document` renders a sample invoice through the real renderer. Use it to check templates, multi-page print (`?long`) and the paper-stays-white rule in dark mode. It returns 404 in production.

## Documentation

- [docs/PRD.md](docs/PRD.md) — product requirements
- [docs/PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md) — architecture and product decision log
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — visual system
- [docs/TEMPLATE_ARCHITECTURE.md](docs/TEMPLATE_ARCHITECTURE.md) — how invoice templates are structured (proposed)
- [docs/TEMPLATE_DIRECTIONS.md](docs/TEMPLATE_DIRECTIONS.md) — design direction for the six templates (exploration)
