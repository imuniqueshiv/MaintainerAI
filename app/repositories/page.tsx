'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { RepositoryTable } from '@/components/shared/repository-table'
import { useConnectedRepositories } from '@/lib/hooks/use-github'

export default function RepositoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { repositories, loading, error, setRepositories } = useConnectedRepositories()

  const filteredRepos = repositories.filter(
    (repo) =>
      `${repo.owner}/${repo.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  function markSyncing(repositoryId: string) {
    setRepositories((prev) =>
      prev.map((repo) =>
        repo.id === repositoryId ? { ...repo, syncStatus: 'syncing' } : repo,
      ),
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Repositories"
        description="Manage and monitor all your connected GitHub repositories"
        action={
          <Link href="/install">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Connect Repository
            </Button>
          </Link>
        }
      />

      <div className="flex gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <Card className="border border-border">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading repositories…</p>
      ) : filteredRepos.length > 0 ? (
        <RepositoryTable repositories={filteredRepos} onSynced={markSyncing} />
      ) : (
        <Card className="border border-border">
          <CardContent className="pt-12 pb-12 text-center space-y-3">
            <p className="text-muted-foreground">
              {repositories.length === 0
                ? 'No connected repositories yet.'
                : 'No repositories found. Try adjusting your search.'}
            </p>
            {repositories.length === 0 ? (
              <Link href="/install">
                <Button>Install GitHub App</Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
