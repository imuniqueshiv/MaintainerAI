'use client'

import { useState } from 'react'
import { GitBranch, Search, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSyncedPullRequests, type SyncedPullRequest } from '@/lib/hooks/use-synced-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
    case 'merged':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    case 'review':
      return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    default:
      return <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
    case 'merged':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case 'review':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    default:
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
  }
}

export default function PullRequestsPage() {
  const { pullRequests, loading, error } = useSyncedPullRequests()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPR, setSelectedPR] = useState<SyncedPullRequest | null>(null)

  const filteredPRs = pullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pr.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || pr.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pull Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review synchronized pull requests across your repositories.
          </p>
        </div>
      </div>

      {error ? (
        <Card className="border border-border">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pull requests..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value ?? 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PRs</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="merged">Merged</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading synchronized pull requests…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {filteredPRs.map((pr) => (
              <Card
                key={pr.id}
                className="border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setSelectedPR(pr)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(pr.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">#{pr.number}</span>
                        <h3 className="font-semibold text-foreground">{pr.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pr.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                        <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(pr.status)}`}>
                          {pr.status}
                        </span>
                        <span>{pr.repository}</span>
                        <span>by {pr.author}</span>
                        <span>
                          +{pr.additions} / -{pr.deletions}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPR && (
            <Card className="border border-border h-fit sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pull Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold text-foreground">{selectedPR.title}</p>
                <p className="text-sm text-muted-foreground capitalize">{selectedPR.status}</p>
                <p className="text-sm text-foreground">{selectedPR.repository}</p>
                {selectedPR.htmlUrl ? (
                  <a href={selectedPR.htmlUrl} target="_blank" rel="noreferrer">
                    <Button className="w-full" size="sm">
                      View on GitHub
                    </Button>
                  </a>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && filteredPRs.length === 0 && (
        <Card className="border border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">
              No synchronized pull requests yet. Connect repositories and run a sync.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
