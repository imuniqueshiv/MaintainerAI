import { NextResponse } from 'next/server'
import { formatError } from '@/server/errors/error-handler'
import type { ErrorCode } from '@/server/errors/app-error'

export type PageInfo = {
  nextCursor: string | null
  hasNextPage: boolean
  total?: number
}

export type ApiMeta = Record<string, unknown>

export type ApiSuccessBody<T> = {
  data: T
  meta?: ApiMeta
  pageInfo?: PageInfo
}

export type ApiErrorBody = {
  error: {
    code: ErrorCode | string
    message: string
    details: unknown
    requestId?: string
    stack?: string
  }
}

export function success<T>(
  data: T,
  init?: {
    status?: number
    meta?: ApiMeta
    pageInfo?: PageInfo
    headers?: HeadersInit
  },
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = { data }
  if (init?.meta) body.meta = init.meta
  if (init?.pageInfo) body.pageInfo = init.pageInfo
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.headers,
  })
}

export function accepted<T extends { jobId?: string; status?: string }>(
  data: T,
  headers?: HeadersInit,
): NextResponse<ApiSuccessBody<T>> {
  return success(data, { status: 202, headers })
}

export function noContent(headers?: HeadersInit): NextResponse {
  return new NextResponse(null, { status: 204, headers })
}

export function failure(
  error: unknown,
  requestId?: string,
  headers?: HeadersInit,
): NextResponse<ApiErrorBody> {
  const formatted = formatError(error, requestId)
  return NextResponse.json(formatted.body, {
    status: formatted.statusCode,
    headers,
  })
}

export function paginated<T>(
  data: T[],
  pageInfo: PageInfo,
  meta?: ApiMeta,
): NextResponse<ApiSuccessBody<T[]>> {
  return success(data, { pageInfo, meta })
}
