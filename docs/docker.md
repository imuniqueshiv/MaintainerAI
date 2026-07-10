# Docker

MaintainerAI ships with a multi-stage `Dockerfile` and `docker-compose.yml` for
production-like and development container workflows.

## Prerequisites

- Docker Engine 24+ or Docker Desktop
- Docker Compose v2

## Production Compose

Build and run the production image:

```bash
cp .env.example .env.local
docker compose up --build
```

The service listens on [http://localhost:3000](http://localhost:3000).

Healthchecks probe `http://127.0.0.1:3000/` every 30 seconds.

## Development Compose profile

Run the app with bind mounts for live development:

```bash
docker compose --profile dev up maintainerai-dev
```

## Build the image manually

```bash
docker build -t maintainerai:local .
docker run --rm -p 3000:3000 --env-file .env.example maintainerai:local
```

## Image design

| Stage    | Purpose                                      |
| -------- | -------------------------------------------- |
| `base`   | Node 20 Alpine + pnpm via Corepack           |
| `deps`   | Install dependencies from the lockfile       |
| `builder`| `pnpm build` with Next.js `standalone` output|
| `runner` | Minimal runtime user `nextjs` + healthcheck  |

## Notes

- Do not bake secrets into images. Pass them at runtime with `--env-file` or your orchestrator.
- For Kubernetes, start from this image and add your own Deployment / Service manifests.
- See [deployment.md](./deployment.md) for reverse-proxy and TLS guidance.
