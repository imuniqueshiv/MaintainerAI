import { AppError } from '@/server/errors/app-error'
import { RequestError } from '@octokit/request-error'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'github.errors' })

export type NormalizedGitHubError = {
  status: number
  code: string
  message: string
  retryAfterSeconds?: number
  rateLimitRemaining?: number
  rateLimitReset?: number
}

export function normalizeGitHubError(error: unknown): NormalizedGitHubError {
  if (error instanceof RequestError) {
    const retryAfter = error.response?.headers?.['retry-after']
    const remaining = error.response?.headers?.['x-ratelimit-remaining']
    const reset = error.response?.headers?.['x-ratelimit-reset']

    return {
      status: error.status,
      code: error.name,
      message: error.message,
      retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined,
      rateLimitRemaining: remaining !== undefined ? Number(remaining) : undefined,
      rateLimitReset: reset !== undefined ? Number(reset) : undefined,
    }
  }

  if (error instanceof Error) {
    return { status: 500, code: 'github_error', message: error.message }
  }

  return { status: 500, code: 'github_error', message: 'Unknown GitHub error' }
}

export function toAppError(error: unknown): AppError {
  const normalized = normalizeGitHubError(error)
  log.warn({ err: error, github: normalized }, 'GitHub API error')

  if (normalized.status === 401 || normalized.status === 403) {
    return AppError.forbidden(normalized.message, normalized)
  }
  if (normalized.status === 404) {
    return AppError.notFound(normalized.message)
  }
  if (normalized.status === 429) {
    return AppError.rateLimited(normalized.message)
  }
  if (normalized.status >= 400 && normalized.status < 500) {
    return AppError.badRequest(normalized.message, normalized)
  }
  return AppError.dependencyFailure(normalized.message, normalized)
}

export async function withGitHubRetry<T>(
  operation: () => Promise<T>,
  options?: { retries?: number; label?: string },
): Promise<T> {
  const retries = options?.retries ?? 2
  let attempt = 0
  let lastError: unknown

  while (attempt <= retries) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const normalized = normalizeGitHubError(error)
      const retryable =
        normalized.status === 429 ||
        normalized.status === 502 ||
        normalized.status === 503 ||
        normalized.status === 504

      if (!retryable || attempt === retries) break

      const delayMs = normalized.retryAfterSeconds
        ? normalized.retryAfterSeconds * 1000
        : Math.min(1000 * 2 ** attempt, 8_000)

      log.warn(
        { attempt, delayMs, label: options?.label, status: normalized.status },
        'Retrying GitHub request',
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      attempt += 1
    }
  }

  throw toAppError(lastError)
}
