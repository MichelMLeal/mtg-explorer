# ADR-003: Monorepo with pnpm Workspaces

## Status
Accepted

## Context
We need a project structure that supports shared code between frontend and backend while keeping them independently deployable.

## Decision
Use pnpm workspaces monorepo with three packages: `@mtg-explorer/api`, `@mtg-explorer/web`, `@mtg-explorer/shared`.

## Rationale
- Shared types and validation schemas eliminate duplication
- Zod schemas shared between API (validation) and frontend (types)
- Same pattern proven in the Pokémon Explorer project
- pnpm is fast and efficient with disk space
- Docker multi-stage builds can build all packages in one context

## Consequences
- All packages must be built before deployment
- TypeScript project references may be needed for large codebases
- Shared package must be built before API/Web can import it
