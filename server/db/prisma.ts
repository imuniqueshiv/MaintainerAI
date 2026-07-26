import { PrismaClient } from '@prisma/client'
import { getConfig } from '@/server/config'
import { logger } from '@/server/logger'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const { database, isDev } = getConfig()

  if (!database.url) {
    logger.warn(
      'DATABASE_URL is not configured — Prisma client created without connection guarantee',
    )
  }

  return new PrismaClient({
    datasources: database.url ? { db: { url: database.url } } : undefined,
    log: isDev ? ['warn', 'error'] : ['warn', 'error'],
  })
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

export async function checkDatabaseHealth(): Promise<{
  ok: boolean
  latencyMs: number
  error?: string
}> {
  if (!getConfig().database.configured) {
    return { ok: false, latencyMs: 0, error: 'DATABASE_URL not configured' }
  }

  const started = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - started }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    logger.error({ err: error }, 'Database health check failed')
    return { ok: false, latencyMs: Date.now() - started, error: message }
  }
}
