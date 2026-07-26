import { logger } from '@/server/logger'

type AsyncCleanup = () => Promise<void> | void

const cleanups: AsyncCleanup[] = []
let registered = false

export function onShutdown(fn: AsyncCleanup): void {
  cleanups.push(fn)
}

export function registerShutdownHandlers(): void {
  if (registered || process.env.NEXT_RUNTIME === 'edge') return
  registered = true

  const run = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received')
    for (const cleanup of [...cleanups].reverse()) {
      try {
        await cleanup()
      } catch (error) {
        logger.error({ err: error }, 'Error during shutdown cleanup')
      }
    }
    logger.info('Shutdown complete')
    process.exit(0)
  }

  process.once('SIGINT', () => {
    void run('SIGINT')
  })
  process.once('SIGTERM', () => {
    void run('SIGTERM')
  })
}
