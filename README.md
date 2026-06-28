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
R2_ACCOUNT_ID=ead6309d1fe6c509012d949ad110c46b
R2_BUCKET_NAME=regretify-media
R2_ENDPOINT=https://ead6309d1fe6c509012d949ad110c46b.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://pub-a2e9dc274a69453a890cf0d83ab4c040.r2.dev
```

Example placeholders live in [.env.example](./.env.example).

## R2 Media Layout

Use `core` as the only writer to R2. The admin app uploads to `core`, `core` writes into the bucket, and the client reads the final public URL.

Recommended object key layout:

```txt
market-pulse/
  posts/
    {postId}/
      feed/hero.{ext}
      story/hero.{ext}
      content/
        01.{ext}
        02.{ext}
        03.{ext}
  authors/
    {adminUserId}/avatar.{ext}
```

Current database media fields already map cleanly to this:
- `feedHeroAssetKey` -> `market-pulse/posts/{postId}/feed/hero.{ext}`
- `storyHeroAssetKey` -> `market-pulse/posts/{postId}/story/hero.{ext}`
- `authorAvatarAssetKey` -> `market-pulse/authors/{adminUserId}/avatar.{ext}`

Inline story images do not need dedicated columns on `market_pulse_posts`.
The story editor can upload each inline image to:
- `market-pulse/posts/{postId}/content/{sequence}.{ext}`

Then the editor writes the final public image URL directly into `bodyHtml`:
- `<img src="https://media.../market-pulse/posts/{postId}/content/01.webp" ... />`

Notes:
- `R2_ENDPOINT` is the S3-compatible upload endpoint used by `core`.
- `R2_PUBLIC_BASE_URL` should point to the active public media host. For the current setup, use `https://pub-a2e9dc274a69453a890cf0d83ab4c040.r2.dev`.
- For now, `admin` and `client` do not need extra R2 secrets in Portainer. Only `core` needs them.

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
