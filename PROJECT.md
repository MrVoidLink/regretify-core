# Regretify Core Notes

## Purpose

`regretify-core` is the backend for Regretify.

It owns:

- public product API endpoints
- internal and admin API boundaries
- market data synchronization
- ads and sponsor orchestration
- persistence and cache integration

## Architecture Direction

- Start as a modular monolith.
- Do not split into microservices for the MVP.
- Keep clear boundaries between public API, internal API, jobs, and integrations.

## Network And Exposure Rules

- PostgreSQL must stay private and must not be publicly exposed.
- Redis must stay private and must not be publicly exposed.
- Admin and internal endpoints must not be treated as open internet-facing routes.
- Public traffic should only hit the intended public web and API entry points.
- Price and chart data should be synchronized internally by workers or jobs, not fetched from third-party providers directly in the browser.

## Planned Source Structure

```txt
src/
  config/
  common/
  database/
  integrations/
  modules/
```

## Planned Domain Modules

- `health`
- `auth`
- `admin-users`
- `assets`
- `markets`
- `prices`
- `charts`
- `calculator`
- `market-pulse`
- `ads`
- `sponsors`
- `jobs`
- `internal`
