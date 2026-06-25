# Regretify Core

Backend API for Regretify.

Current live module:
- `GET /api/health`
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`

## Deploy Shape

This repository is prepared for Portainer `Repository` deployment.

Expected runtime shape:
- stack name: `regretify-core`
- service name: `core`
- external Docker network: `regretify_net`
- private dependencies available on the same network:
  - `postgres`
  - `redis`

The root [docker-compose.yml](./docker-compose.yml) is the deploy entrypoint.

## Required Portainer Environment Variables

Set real values in Portainer, not in git:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=regretify
DATABASE_USER=...
DATABASE_PASSWORD=...
REDIS_HOST=redis
REDIS_PORT=6379
ADMIN_AUTH_JWT_SECRET=...
ADMIN_AUTH_JWT_EXPIRES_IN_SECONDS=43200
ADMIN_BOOTSTRAP_EMAIL=admin@regretify.app
ADMIN_BOOTSTRAP_PASSWORD=...
ADMIN_BOOTSTRAP_ROLE=admin
```

Example placeholders live in [.env.example](./.env.example).

## Local Development

```bash
npm install
npm run start:dev
```

## Build

```bash
npm run build
npm run start:prod
```

## Docker

Build locally:

```bash
docker build -t regretify-core .
```

Run locally:

```bash
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e DATABASE_HOST=postgres \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=regretify \
  -e DATABASE_USER=replace-me \
  -e DATABASE_PASSWORD=replace-me \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e ADMIN_AUTH_JWT_SECRET=replace-me \
  -e ADMIN_BOOTSTRAP_EMAIL=admin@regretify.app \
  -e ADMIN_BOOTSTRAP_PASSWORD=replace-me \
  -e ADMIN_BOOTSTRAP_ROLE=admin \
  regretify-core
```

## Health Check

```txt
GET /api/health
```
