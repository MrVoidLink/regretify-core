# Regretify Core Agent Instructions

## Role

This repo is the Regretify backend.

Prefer backend decisions that preserve:

- modular monolith boundaries
- internal/private service communication
- clean public versus internal API separation

## Working Rules

- Keep modules explicit and domain-oriented.
- Avoid giant shared service files.
- Keep controller, service, DTO, and persistence concerns separated as the repo grows.
- Do not expose internal or admin endpoints casually.
- Prefer additive structure over speculative complexity.

## Structure Direction

- `src/config/` for environment and runtime configuration
- `src/common/` for cross-module backend primitives
- `src/database/` for migrations and seeds
- `src/integrations/` for external provider adapters
- `src/modules/` for domain modules

## Implementation Direction

- The first real live module should be `health`.
- Other domains can start as empty module folders until their contracts are ready.
- Keep future market-data providers behind adapters.
- Keep ad-provider integrations provider-specific inside `integrations/ads/providers/`.
