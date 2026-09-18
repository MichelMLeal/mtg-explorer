# MTG Explorer

A modern Magic: The Gathering card explorer and AI deck builder.

## Features

- **Card Search** — Full-text search with Scryfall syntax (colors, types, mana cost, etc.), with name autocomplete as you type
- **Card Details** — Oracle text, official rulings, real mana symbol icons, all illustrations/printings of a card, prices, and format legality
- **Set Explorer** — Browse all MTG sets, drill into a set's full card list, and filter/sort by color, rarity, type, keyword ability, mana value, or price
- **AI Deck Builder** — Choose colors, format, playstyle, and budget; builds 1-3 varied decks with real card art
- **Top Decks** — The 10 best-recorded decks from recent paper tournaments per format (Standard, Pioneer, Modern, Legacy, Vintage, Commander, Pauper), via the TopDeck.gg API; open any of them straight into the Deck Builder
- **Arena Support** — Look up cards by MTG Arena ID
- **Price Tracking** — USD/EUR prices from TCGPlayer and Cardmarket

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TanStack Query, React Router |
| Backend | Node.js 22, TypeScript, Fastify 4 |
| Cache | Redis 7 |
| Card data | Scryfall API (free, 40k+ cards, no key required) |
| Tournament data | TopDeck.gg API (free key, see below) |
| Validation | Zod (shared schemas) |
| Container | Docker multi-stage, Docker Compose |
| CI/CD | GitHub Actions → GHCR → Self-hosted runner |
| Proxy | Caddy + Tailscale (TLS) |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
docker compose -f compose.dev.yaml up -d
pnpm dev

# Open
http://localhost:5173
```

## Project Structure

```
mtg-explorer/
├── apps/
│   ├── api/          # Fastify backend
│   └── web/          # React frontend
├── packages/
│   └── shared/       # Shared types, schemas, constants
├── infra/            # Caddy, deploy scripts
└── .github/          # CI/CD workflows
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cards?q=` | GET | Search cards (`order`/`dir` for sorting) |
| `/api/cards/autocomplete?q=` | GET | Card name suggestions |
| `/api/cards/random` | GET | Random card |
| `/api/cards/:id` | GET | Card by Scryfall ID |
| `/api/cards/:id/prints` | GET | All printings/illustrations of a card |
| `/api/cards/:id/rulings` | GET | Official rulings |
| `/api/cards/name/:name` | GET | Card by name |
| `/api/cards/arena/:arenaId` | GET | Card by Arena ID |
| `/api/sets` | GET | List all sets |
| `/api/sets/:code/cards` | GET | Cards in a set |
| `/api/formats` | GET | List formats with rules |
| `/api/symbology` | GET | Mana/card symbols (icon URLs) |
| `/api/catalog/:name` | GET | Scryfall word-list catalogs (e.g. `keyword-abilities`) |
| `/api/meta/top-decks?format=` | GET | Top 10 recent tournament decks for a format |
| `/api/deck/build` | POST | AI deck builder (`count` for 1-3 decks) |
| `/api/deck/validate` | POST | Validate a deck |
| `/health` | GET | Health check |
| `/ready` | GET | Readiness check |

## Deployment

```bash
# Build and push to GHCR
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml up -d

# Via GitHub Actions (automatic on push to main)
# See .github/workflows/deploy.yml
```

Runs behind a shared Caddy instance on the deploy host, path-prefixed at `/mtg/` (see `infra/caddy/Caddyfile` for the block to merge into that host's Caddyfile) — the app isn't on its own subdomain.

## Environment Variables

See `.env.example` and `.env.production.example`.

`TOPDECK_API_KEY` is optional — get a free key at [topdeck.gg/developers](https://topdeck.gg/developers) to enable the Top Decks page. Everything else works without it.

## License

MIT!
