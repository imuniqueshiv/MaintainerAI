import { z, type ZodType } from 'zod'
import { AppError } from '@/server/errors/app-error'

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
    code: issue.code,
  }))
}

export function parseWithSchema<T extends ZodType>(
  schema: T,
  data: unknown,
  label = 'Request',
): z.infer<T> {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw AppError.validation(`${label} validation failed`, {
      issues: formatZodError(result.error),
    })
  }
  return result.data
}

export async function parseJsonBody<T extends ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    throw AppError.badRequest('Invalid JSON body')
  }
  return parseWithSchema(schema, json, 'Body')
}

export function parseSearchParams<T extends ZodType>(request: Request, schema: T): z.infer<T> {
  const url = new URL(request.url)
  const raw: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    raw[key] = value
  })
  return parseWithSchema(schema, raw, 'Query')
}

export function parseParams<T extends ZodType>(params: unknown, schema: T): z.infer<T> {
  return parseWithSchema(schema, params, 'Params')
}

/** Common pagination query schema for future list endpoints. */
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
})
