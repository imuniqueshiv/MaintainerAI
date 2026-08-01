'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'

export type DashboardRepository = {
  id: string
  githubId: string
  name: string
  owner: string
  fullName: string
  description: string | null
  stars: number
  forks: number
  openIssues: number
  openPRs: number
  url: string
  language: string | null
  defaultBranch: string | null
  lastUpdated: string | Date
  healthScore: number
  automationEnabled: boolean
  automationIssuesResolved: number
  automationPRsMerged: number
  collaborators: number
  topics: string[]
  isPrivate: boolean
  archived: boolean
  disabled: boolean
  connectedAt: string | Date | null
  installationId: string
  organizationId: string
}

export type GitHubAppSummary = {
  name: string
  configured: boolean
  status: string
  installationId: string | null
  githubInstallationId: string | null
  accountLogin?: string | null
  accountType?: string | null
  installationCount?: number
  installedRepositories: number
  permissions: Array<{ name: string; access: string }>
  webhookEvents: string[]
  webhookStatus: string
  rateLimit: { remaining: number | null; limit: number | null }
  lastSync: string | Date | null
  syncStatus: string | null
}

export function useConnectedRepositories() {
  const [repositories, setRepositories] = useState<DashboardRepository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await apiFetch<{ repositories: DashboardRepository[] }>('/api/v1/repos')
        if (!cancelled) {
          setRepositories(data.repositories)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load repositories')
          setRepositories([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { repositories, loading, error, setRepositories }
}

export function useGitHubAppSummary() {
  const [app, setApp] = useState<GitHubAppSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await apiFetch<GitHubAppSummary>('/api/v1/github/app')
        if (!cancelled) {
          setApp(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load GitHub App status')
          setApp(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { app, loading, error }
}

export async function startGitHubAppInstall(): Promise<string> {
  const data = await apiFetch<{ url: string }>('/api/v1/auth/github/install-url')
  return data.url
}
