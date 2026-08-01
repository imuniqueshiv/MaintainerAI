'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'

export type SyncedIssue = {
  id: string
  number: number
  title: string
  description: string
  repository: string
  repositoryId?: string
  status: string
  priority: string | null
  labels: string[]
  author: string
  createdAt: string | Date
  comments: number
  aiGenerated: boolean
  htmlUrl?: string | null
}

export type SyncedPullRequest = {
  id: string
  number: number
  title: string
  description: string
  repository: string
  status: string
  author: string
  createdAt: string | Date
  additions: number
  deletions: number
  comments: number
  reviewRequests: number
  aiReviewCompleted: boolean
  htmlUrl?: string | null
}

export type SyncedContributor = {
  id: string
  login: string
  name: string | null
  avatar: string | null
  contributions: number
  isMainMaintainer: boolean
  openPRCount: number
  issuesSolved: number
  joinedAt: string | Date | null
  lastActive: string | Date | null
}

export type SyncedActivity = {
  id: string
  type: 'issue' | 'pr'
  title: string
  action: string
  timestamp: string | Date
  repository: string
  author: string
}

type PageInfo = { hasNextPage: boolean; total?: number }

async function fetchPaginated<T>(path: string): Promise<T[]> {
  const base =
    typeof window === 'undefined'
      ? (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
      : ''
  const response = await fetch(`${base}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error?.message ?? `Request failed (${response.status})`)
  }
  const payload = (await response.json()) as { data: T[]; pageInfo?: PageInfo }
  return payload.data ?? []
}

export function useSyncedIssues() {
  const [issues, setIssues] = useState<SyncedIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchPaginated<SyncedIssue>('/api/v1/issues?limit=50')
        if (!cancelled) {
          setIssues(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load issues')
          setIssues([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { issues, loading, error }
}

export function useSyncedPullRequests() {
  const [pullRequests, setPullRequests] = useState<SyncedPullRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchPaginated<SyncedPullRequest>('/api/v1/pulls?limit=50')
        if (!cancelled) {
          setPullRequests(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load pull requests')
          setPullRequests([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { pullRequests, loading, error }
}

export function useSyncedContributors() {
  const [contributors, setContributors] = useState<SyncedContributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchPaginated<SyncedContributor>('/api/v1/contributors?limit=50')
        if (!cancelled) {
          setContributors(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load contributors')
          setContributors([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { contributors, loading, error }
}

export function useSyncedActivity() {
  const [activities, setActivities] = useState<SyncedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ activities: SyncedActivity[] }>('/api/v1/activity')
        if (!cancelled) {
          setActivities(data.activities)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load activity')
          setActivities([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { activities, loading, error }
}

export async function triggerRepositorySync(repositoryId: string, mode: 'full' | 'incremental' = 'full') {
  return apiFetch<{ jobs: unknown[] }>(`/api/v1/repos/${repositoryId}/sync`, {
    method: 'POST',
    json: { mode },
  })
}
