# MTG Explorer

A modern Magic: The Gathering card explorer and AI deck builder.

## Features

- **Card Search** — Full-text search with Scryfall syntax (colors, types, mana cost, etc.)
- **Card Details** — All illustrations, oracle text, rulings, prices, and format legality
- **Set Explorer** — Browse all MTG sets and their cards
- **AI Deck Builder** — Choose colors, format, and playstyle; AI builds a deck for you
- **Arena Support** — Look up cards by MTG Arena ID
- **Price Tracking** — USD/EUR prices from TCGPlayer and Cardmarket

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TanStack Query, React Router |
| Backend | Node.js 22, TypeScript, Fastify 4 |
| Cache | Redis 7 |
| API | Scryfall API (free, 40k+ cards) |
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
| `/api/cards?q=` | GET | Search cards |
| `/api/cards/random` | GET | Random card |
| `/api/cards/:id` | GET | Card by Scryfall ID |
| `/api/cards/name/:name` | GET | Card by name |
| `/api/cards/arena/:arenaId` | GET | Card by Arena ID |
| `/api/sets` | GET | List all sets |
| `/api/sets/:code/cards` | GET | Cards in a set |
| `/api/formats` | GET | List formats with rules |
| `/api/deck/build` | POST | AI deck builder |
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

## Environment Variables

See `.env.example` and `.env.production.example`.

## License

MIT.
