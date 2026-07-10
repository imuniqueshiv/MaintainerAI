# Deployment

Self-host MaintainerAI on your own infrastructure.

## Recommended approaches

1. **Docker Compose** — simplest for single-host deployments
2. **Container platform** — Fly.io, Render, Railway, ECS, Cloud Run, etc.
3. **Node host** — `pnpm build && pnpm start` behind a reverse proxy
4. **Kubernetes** — use the production image with your own manifests

## Production checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `NEXT_PUBLIC_APP_URL` to the public HTTPS URL
- [ ] Configure GitHub App credentials if using live sync
- [ ] Configure AI provider keys if enabling AI features
- [ ] Terminate TLS at a reverse proxy (Caddy, Nginx, Traefik, cloud LB)
- [ ] Restrict inbound ports to 443 (and SSH as needed)
- [ ] Enable log aggregation and uptime checks
- [ ] Pin image tags (avoid `latest` in production)
- [ ] Back up any persistent state once databases are introduced

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
