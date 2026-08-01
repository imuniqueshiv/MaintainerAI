'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Star, GitFork, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HealthBadge } from './health-badge'
import { triggerRepositorySync } from '@/lib/hooks/use-synced-data'

interface Repository {
  id: string | number
  name: string
  owner: string
  description: string | null
  stars: number
  forks: number
  language: string | null
  lastUpdated: Date | string
  healthScore: number
  automationEnabled: boolean
  automationIssuesResolved: number
  automationPRsMerged: number
  openIssues: number
  openPRs: number
  syncStatus?: string
  lastFullSyncAt?: Date | string | null
  lastIncrementalSyncAt?: Date | string | null
  lastSyncError?: string | null
}

interface RepositoryTableProps {
  repositories: Repository[]
  onSynced?: (repositoryId: string) => void
}

function formatSyncTime(value?: Date | string | null) {
  if (!value) return 'Never'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleString()
}

function syncBadgeClass(status?: string) {
  switch (status) {
    case 'syncing':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case 'failed':
      return 'bg-red-500/10 text-red-700 dark:text-red-400'
    default:
      return 'bg-secondary text-secondary-foreground'
  }
}

export function RepositoryTable({ repositories, onSynced }: RepositoryTableProps) {
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({})

  async function handleSync(repoId: string) {
    setSyncingIds((prev) => new Set(prev).add(repoId))
    setSyncErrors((prev) => {
      const next = { ...prev }
      delete next[repoId]
      return next
    })
    try {
      await triggerRepositorySync(repoId, 'full')
      onSynced?.(repoId)
    } catch (err) {
      setSyncErrors((prev) => ({
        ...prev,
        [repoId]: err instanceof Error ? err.message : 'Sync failed',
      }))
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev)
        next.delete(repoId)
        return next
      })
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/50 border-b border-border">
            <th className="px-6 py-4 text-left font-semibold text-foreground">Repository</th>
            <th className="px-6 py-4 text-left font-semibold text-foreground">Health</th>
            <th className="px-6 py-4 text-left font-semibold text-foreground">Sync</th>
            <th className="px-6 py-4 text-left font-semibold text-foreground">Activity</th>
            <th className="px-6 py-4 text-right font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repo) => {
            const id = String(repo.id)
            const isSyncing = syncingIds.has(id) || repo.syncStatus === 'syncing'
            const lastSync = repo.lastFullSyncAt ?? repo.lastIncrementalSyncAt
            return (
              <tr key={id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <span className="font-semibold text-primary">
                      {repo.owner}/{repo.name}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{repo.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3" /> {repo.stars.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {repo.forks}
                      </span>
                      <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        {repo.language ?? 'Unknown'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <HealthBadge score={repo.healthScore} size="sm" />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-xs">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-medium capitalize ${syncBadgeClass(
                        isSyncing ? 'syncing' : repo.syncStatus,
                      )}`}
                    >
                      {isSyncing ? 'syncing' : repo.syncStatus ?? 'idle'}
                    </span>
                    <p className="text-muted-foreground">Last: {formatSyncTime(lastSync)}</p>
                    {(syncErrors[id] || repo.lastSyncError) && (
                      <p className="text-red-600 dark:text-red-400 truncate max-w-[180px]">
                        {syncErrors[id] ?? repo.lastSyncError}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div className="text-muted-foreground">
                      Issues: <span className="font-semibold text-foreground">{repo.openIssues}</span>
                    </div>
                    <div className="text-muted-foreground">
                      PRs: <span className="font-semibold text-foreground">{repo.openPRs}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={isSyncing}
                    onClick={() => void handleSync(id)}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                  <Link href={`/github-app`}>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
