'use client'

import Link from 'next/link'
import { Workflow, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import {
  startGitHubAppInstall,
  useConnectedRepositories,
  useGitHubAppSummary,
} from '@/lib/hooks/use-github'
import { apiFetch } from '@/lib/api/client'
import { useState } from 'react'

export default function GitHubAppPage() {
  const { app, loading: appLoading, error: appError } = useGitHubAppSummary()
  const { repositories, loading: reposLoading } = useConnectedRepositories()
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const remaining = app?.rateLimit.remaining
  const limit = app?.rateLimit.limit
  const ratePct =
    remaining != null && limit != null && limit > 0
      ? Math.round((remaining / limit) * 100)
      : null

  async function handleInstall() {
    try {
      setBusy(true)
      setActionError(null)
      const url = await startGitHubAppInstall()
      window.location.href = url
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Install failed')
      setBusy(false)
    }
  }

  async function handleRefresh() {
    if (!app?.installationId) return
    try {
      setBusy(true)
      setActionError(null)
      await apiFetch(`/api/v1/github/installations/${app.installationId}`, {
        method: 'POST',
      })
      window.location.reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Refresh failed')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="GitHub App Management"
        description="Manage your MaintainerAI GitHub application and permissions"
      />

      {appError || actionError ? (
        <Card className="border border-border">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {actionError ?? appError}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border border-border bg-gradient-to-br from-green-50 dark:from-green-900/20 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              {app?.name ?? 'MaintainerAI'}
            </CardTitle>
            {app?.status === 'active' ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {appLoading ? 'Loading' : app?.status ?? 'Inactive'}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Installation ID</p>
              <p className="font-mono text-sm font-semibold text-foreground mt-1">
                {app?.installationId ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Installed Repositories</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {app?.installedRepositories ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Webhook Status</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-600 dark:text-green-400 capitalize">
                  {app?.webhookStatus ?? 'unknown'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Refresh</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {app?.lastSync
                  ? new Date(app.lastSync).toLocaleString()
                  : '—'}
              </p>
            </div>
          </div>
          {app?.accountLogin ? (
            <p className="text-sm text-muted-foreground">
              GitHub account: <span className="font-medium text-foreground">{app.accountLogin}</span>
              {app.accountType ? ` (${app.accountType})` : ''}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>API Rate Limit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Requests</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {remaining ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of {limit ?? '—'} total
              </p>
            </div>
            {ratePct != null ? (
              <div className="flex-1 ml-8">
                <div className="h-4 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${ratePct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{ratePct}% remaining</p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Permissions</h2>
        {(app?.permissions?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No installation permissions yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {app!.permissions.map((perm, idx) => (
              <Card key={idx} className="border border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground capitalize">{perm.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{perm.access}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(app?.webhookEvents?.length ? app.webhookEvents : ['installation', 'installation_repositories', 'repository']).map(
              (event, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                >
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{event}</p>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Connected Repositories</h2>
        {reposLoading ? (
          <p className="text-sm text-muted-foreground">Loading repositories…</p>
        ) : repositories.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="pt-8 pb-8 text-center text-sm text-muted-foreground">
              No repositories connected.{' '}
              <Link href="/install" className="text-primary hover:underline">
                Install the GitHub App
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 border border-border rounded-lg overflow-hidden">
            {repositories.map((repo, idx) => (
              <div
                key={repo.id}
                className={`flex items-center justify-between p-4 ${idx !== repositories.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div>
                  <p className="font-medium text-foreground">
                    {repo.owner}/{repo.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {repo.description ?? 'No description'}
                    {repo.isPrivate ? ' · Private' : ' · Public'}
                    {repo.language ? ` · ${repo.language}` : ''}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {app?.installationId ? (
          <Button className="gap-2" onClick={handleRefresh} disabled={busy}>
            <RotateCcw className="w-4 h-4" />
            Refresh metadata
          </Button>
        ) : (
          <Button onClick={handleInstall} disabled={busy}>
            Install GitHub App
          </Button>
        )}
        <Link href="https://github.com/settings/installations" target="_blank">
          <Button variant="outline">Manage on GitHub</Button>
        </Link>
      </div>
    </div>
  )
}
