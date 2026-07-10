'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { mockRepositories } from '@/lib/mock-data'

export default function SelectRepositoriesPage() {
  const [selectedRepos, setSelectedRepos] = useState<number[]>([1, 2])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRepos = mockRepositories.filter(
    (repo) =>
      `${repo.owner}/${repo.name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleRepo = (id: number) => {
    setSelectedRepos((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
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

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Repository List */}
        <div className="space-y-2 mb-8">
          {filteredRepos.map((repo) => {
            const isSelected = selectedRepos.includes(repo.id)
            return (
              <button
                key={repo.id}
                onClick={() => toggleRepo(repo.id)}
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
                  <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{repo.language}</span>
                    <span>⭐ {repo.stars.toLocaleString()}</span>
                    <span>Issues: {repo.openIssues}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{selectedRepos.length}</span> repository
            {selectedRepos.length !== 1 ? 'ies' : ''} selected
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Link href="/onboarding/connect-github">
            <Button variant="ghost">Back</Button>
          </Link>
          <Link href="/onboarding/setup-automation">
            <Button className="gap-2" disabled={selectedRepos.length === 0}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
