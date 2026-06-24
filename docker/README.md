# Docker Notes

`regretify-core` now ships with:

- a production `Dockerfile`
- a root `docker-compose.yml` for Portainer repository deployment
- environment-variable placeholders only

Expected deploy shape:

- stack name: `regretify-core`
- external network: `regretify_net`
- private dependencies already running:
  - `postgres`
  - `redis`
