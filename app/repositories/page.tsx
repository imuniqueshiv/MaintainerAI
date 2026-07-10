'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { RepositoryTable } from '@/components/shared/repository-table'
import { mockRepositories } from '@/lib/mock-data'

export default function RepositoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRepos = mockRepositories.filter((repo) =>
    `${repo.owner}/${repo.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Repositories"
        description="Manage and monitor all your connected GitHub repositories"
        action={
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Connect Repository
          </Button>
        }
      />

      {/* Search */}
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

      {/* Repository Table */}
      {filteredRepos.length > 0 ? (
        <RepositoryTable repositories={filteredRepos} />
      ) : (
        <Card className="border border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">
              No repositories found. Try adjusting your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
