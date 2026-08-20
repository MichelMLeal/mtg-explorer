# ADR-002: AI Deck Builder via Rules Engine + Scryfall Queries

## Status
Accepted

## Context
We need an AI deck builder that suggests complete, legal decks based on user preferences (colors, format, playstyle).

## Decision
Implement a rules-based engine that uses Scryfall search queries and deck-building heuristics, without requiring a paid LLM API.

## Rationale
- Zero cost (Scryfall is free)
- Deterministic results (same input → same output)
- Format-legal by construction (Scryfall enforces legality in search)
- Fast response times (no LLM inference delay)
- Can be enhanced with LLM later if needed (architecture supports it)

## How It Works
1. User selects colors, format, playstyle (fun/competitive)
2. Engine selects archetype (aggro/control/midrange) based on inputs
3. Scryfall queries fetch legal cards sorted by EDHREC rank
4. Engine assembles deck following mana curve targets and card ratios
5. Budget filtering removes cards above price threshold
6. Validator ensures format compliance (card count, singleton rules, etc.)

## Consequences
- Less "creative" than LLM-based approaches
- Limited to well-known archetypes initially
- Can be extended with LLM refinement in v2
