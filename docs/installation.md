# Installation

This guide covers installing MaintainerAI for local use.

## Requirements

- **Node.js** 20 or later (see `.nvmrc`)
- **pnpm** 9 or later
- **Git**

Optional:

- Docker Desktop (or compatible engine) for containerized runs
- A GitHub account for App-based repository access

## Install pnpm

```bash
corepack enable
corepack prepare pnpm@9 --activate
```

## Clone the repository

```bash
git clone https://github.com/imuniqueshiv/MaintainerAI.git
cd MaintainerAI
```

## Install dependencies

```bash
pnpm install
```

## Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` as needed. For a UI-only local preview, defaults are enough.
See [configuration.md](./configuration.md) for the full variable reference.

## Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build (local)

```bash
pnpm build
pnpm start
```

## Next steps

- [Development guide](./development.md)
- [Docker setup](./docker.md)
- [GitHub App setup](./github-app.md)
- [Deployment](./deployment.md)
