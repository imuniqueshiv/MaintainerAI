import type { ApiErrorBody, ApiSuccessBody, PageInfo } from '@/server/lib/api-response'

export type { ApiErrorBody, ApiSuccessBody, PageInfo }

export class ApiClientError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }
}

export type ApiClientOptions = {
  baseUrl?: string
  headers?: HeadersInit
}

/**
 * Typed fetch helper for future UI → API migration.
 * Phase 1: scaffold only — no business endpoints wired in the UI yet.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
  options?: ApiClientOptions,
): Promise<T> {
  const base =
    options?.baseUrl ??
    (typeof window === 'undefined'
      ? (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
      : '')

  const headers = new Headers(options?.headers)
  headers.set('Accept', 'application/json')

  let body = init?.body
  if (init?.json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(init.json)
  }

  const response = await fetch(`${base}${path}`, {
    credentials: 'include',
    ...init,
    headers,
    body,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody

  if (!response.ok) {
    const errorBody = payload as ApiErrorBody
    throw new ApiClientError(
      errorBody.error?.message ?? `Request failed (${response.status})`,
      response.status,
      errorBody,
    )
  }

  return (payload as ApiSuccessBody<T>).data
}
