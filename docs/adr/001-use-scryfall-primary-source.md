# ADR-001: Use Scryfall as Primary Data Source

## Status
Accepted

## Context
We need a free, comprehensive API for Magic: The Gathering card data, images, and metadata.

## Decision
Use Scryfall API as the primary data source for all card data.

## Rationale
- 40k+ cards with full metadata (oracle text, rulings, legality, prices)
- High-resolution images in multiple formats (normal, art crop, border crop, PNG)
- Fuzzy name matching and full-text search syntax
- Free, community-funded, rate limit of 10 req/s (generous for our use case)
- Includes Arena IDs for MTG Arena integration
- Bulk data downloads available for offline indexing if needed

## Consequences
- No API key required (simplifies deployment)
- Must respect rate limits (implement rate limiter in HTTP client)
- Pricing data is delayed (not real-time) — acceptable for our use case
- Must include User-Agent header in all requests
- Cannot "paywall" Scryfall data per their Fan Content Policy
