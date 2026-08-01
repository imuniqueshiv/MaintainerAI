# Deployment

Self-host MaintainerAI on your own infrastructure.

## Recommended approaches

1. **Docker Compose** — simplest for single-host deployments
2. **Container platform** — Fly.io, Render, Railway, ECS, Cloud Run, etc.
3. **Node host** — `pnpm build && pnpm start` behind a reverse proxy
4. **Kubernetes** — use the production image with your own manifests

## Production checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXT_PUBLIC_APP_URL` / `NEXTAUTH_URL` to the public HTTPS URL
- [ ] Set `NEXTAUTH_SECRET` and GitHub OAuth credentials
- [ ] Configure GitHub App credentials (`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`, …) — see [GITHUB_APP_SETUP.md](../GITHUB_APP_SETUP.md)
- [ ] Set GitHub App **Callback URL** to `{APP_URL}/api/v1/auth/github/callback`
- [ ] Set GitHub App **Webhook URL** to `{APP_URL}/api/webhooks/github`
- [ ] Run database migrations (`pnpm db:migrate:deploy` or Compose `migrate` service)
- [ ] Run a **worker** process (`pnpm worker` / Compose `worker`) with the same GitHub App env (or set `GITHUB_WEBHOOK_INLINE=true` for small/dev installs)
- [ ] Confirm Redis + PostgreSQL health via `/api/ready`
- [ ] Configure AI provider keys only when enabling Phase 5+ AI features
- [ ] Terminate TLS at a reverse proxy (Caddy, Nginx, Traefik, cloud LB)
- [ ] Restrict inbound ports to 443 (and SSH as needed)
- [ ] Enable log aggregation and uptime checks
- [ ] Pin image tags (avoid `latest` in production)
- [ ] Back up PostgreSQL regularly

## Platforms

| Platform | Notes |
| -------- | ----- |
| Docker Compose | Recommended self-host path (`postgres`, `redis`, `migrate`, `worker`, `maintainerai`) |
| Render / Railway / Fly.io | Run **web + worker** as separate services; attach managed Postgres + Redis |
| Vercel | Suitable for the Next.js web app; you still need managed Postgres, Redis, and a **worker** host for BullMQ (or `GITHUB_WEBHOOK_INLINE=true` with caution) |
| Kubernetes | Use the multi-stage `Dockerfile` targets `runner`, `worker`, `migrate` |

## Reverse proxy example (Caddy)

```caddyfile
maintainerai.example.com {
  reverse_proxy localhost:3000
}
```

## Reverse proxy example (Nginx)

```nginx
server {
  listen 443 ssl http2;
  server_name maintainerai.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Docker Compose production

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f maintainerai
```

## Upgrades

1. Read [CHANGELOG.md](../CHANGELOG.md)
2. Pull the new release tag or rebuild from `main`
3. Apply any new environment variables
4. Restart the service and verify the health endpoint

## Security

Review [SECURITY.md](../SECURITY.md) and rotate credentials after staff changes.
