/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Typechecking is enforced via `pnpm typecheck` / CI. Keep the Next build
  // aligned with the same gate so production images cannot ship type errors.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Re-enable optimization in a later milestone once CDN/image hosts are set.
    unoptimized: true,
  },
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'bullmq',
    'ioredis',
    'pino',
    'pino-pretty',
    'thread-stream',
  ],
}

export default nextConfig
