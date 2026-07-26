import pino, { type Logger, type LoggerOptions } from 'pino'
import { getConfig } from '@/server/config'

let rootLogger: Logger | null = null

function buildOptions(): LoggerOptions {
  const { log, app, isDev, isTest } = getConfig()

  const options: LoggerOptions = {
    name: app.name,
    level: isTest ? 'silent' : log.level,
    base: {
      service: app.name,
      version: app.version,
      env: getConfig().appEnv,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
        'secret',
        'DATABASE_URL',
        'REDIS_URL',
        'AI_API_KEY',
        'GITHUB_APP_PRIVATE_KEY',
        'GITHUB_APP_CLIENT_SECRET',
        'NEXTAUTH_SECRET',
      ],
      censor: '[Redacted]',
    },
  }

  if (log.pretty && (isDev || process.env.LOG_PRETTY === 'true')) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  }

  return options
}

export function getLogger(): Logger {
  if (!rootLogger) {
    rootLogger = pino(buildOptions())
  }
  return rootLogger
}

export function createLogger(bindings: Record<string, unknown>): Logger {
  return getLogger().child(bindings)
}

export function resetLoggerForTests(): void {
  rootLogger = null
}

export const logger = {
  get fatal() {
    return getLogger().fatal.bind(getLogger())
  },
  get error() {
    return getLogger().error.bind(getLogger())
  },
  get warn() {
    return getLogger().warn.bind(getLogger())
  },
  get info() {
    return getLogger().info.bind(getLogger())
  },
  get debug() {
    return getLogger().debug.bind(getLogger())
  },
  get trace() {
    return getLogger().trace.bind(getLogger())
  },
  child(bindings: Record<string, unknown>) {
    return createLogger(bindings)
  },
}
