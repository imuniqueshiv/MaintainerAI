'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { apiFetch } from '@/lib/api/client'

type DiscoverRepo = {
  githubId: string
  name: string
  owner: string
  fullName: string
  description: string | null
  language: string | null
  stars: number
  openIssues: number
  connected: boolean
}

export default function SelectRepositoriesClient() {
  const searchParams = useSearchParams()
  const installationIdParam = searchParams.get('installationId')
  const [installationId, setInstallationId] = useState<string | null>(installationIdParam)
  const [repos, setRepos] = useState<DiscoverRepo[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        let id = installationId
        if (!id) {
          const app = await apiFetch<{ installationId: string | null }>('/api/v1/github/app')
          id = app.installationId
          if (!cancelled) setInstallationId(id)
        }
        if (!id) {
          if (!cancelled) {
            setError('No GitHub App installation found. Install the app first.')
            setRepos([])
          }
          return
        }
        const data = await apiFetch<{ repositories: DiscoverRepo[] }>(
          `/api/v1/github/installations/${id}/repositories`,
        )
        if (!cancelled) {
          setRepos(data.repositories)
          setSelected(data.repositories.filter((r) => r.connected).map((r) => r.githubId))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load repositories')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [installationId])

  const filteredRepos = useMemo(
    () =>
      repos.filter(
        (repo) =>
          `${repo.owner}/${repo.name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [repos, searchQuery],
  )

  const toggleRepo = (githubId: string) => {
    setSelected((prev) =>
      prev.includes(githubId) ? prev.filter((r) => r !== githubId) : [...prev, githubId],
    )
  }

  async function handleContinue() {
    if (!installationId || selected.length === 0) return
    try {
      setSaving(true)
      await apiFetch(`/api/v1/repos/connect`, {
        method: 'POST',
        json: { installationId, githubIds: selected, replace: true },
      })
      window.location.href = '/onboarding/setup-automation'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repositories')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <PageHeader
          title="Select Repositories"
          description="Choose which repositories you want to manage with MaintainerAI"
          breadcrumbs={[
            { label: 'Onboarding' },
            { label: 'Select Repositories' },
          ]}
        />

        <div className="mb-6">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {error ? <p className="text-sm text-muted-foreground mb-4">{error}</p> : null}
        {loading ? <p className="text-sm text-muted-foreground mb-4">Loading from GitHub…</p> : null}

        <div className="space-y-2 mb-8">
          {filteredRepos.map((repo) => {
            const isSelected = selected.includes(repo.githubId)
            return (
              <button
                key={repo.githubId}
                onClick={() => toggleRepo(repo.githubId)}
                className="w-full flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="mt-1">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {repo.owner}/{repo.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {repo.description ?? 'No description'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{repo.language ?? 'Unknown'}</span>
                    <span>⭐ {repo.stars.toLocaleString()}</span>
                    <span>Issues: {repo.openIssues}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{selected.length}</span> repository
            {selected.length !== 1 ? 'ies' : ''} selected
          </p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <Link href="/onboarding/connect-github">
            <Button variant="ghost">Back</Button>
          </Link>
          <Button
            className="gap-2"
            disabled={selected.length === 0 || saving || !installationId}
            onClick={handleContinue}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
