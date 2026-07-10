'use client'

import { useState } from 'react'
import { GitBranch, Plus, Search, CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockPullRequests } from '@/lib/mock-data'
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
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case 'review':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    default:
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
  }
}

export default function PullRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPR, setSelectedPR] = useState<(typeof mockPullRequests)[0] | null>(
    null
  )

  const filteredPRs = mockPullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || pr.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pull Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage all pull requests across your repositories.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Pull Request
        </Button>
      </div>

      {/* Search and Filters */}
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
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PRs List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filteredPRs.map((pr) => (
            <Card
              key={pr.id}
              className={`border cursor-pointer transition-colors ${
                selectedPR?.id === pr.id
                  ? 'border-primary bg-secondary/50'
                  : 'border-border hover:bg-secondary/30'
              }`}
              onClick={() => setSelectedPR(pr)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    {getStatusIcon(pr.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{pr.number}
                      </span>
                      <h3 className="font-semibold text-foreground">
                        {pr.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {pr.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>by {pr.author}</span>
                      <span>
                        {pr.additions} additions, {pr.deletions} deletions
                      </span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {pr.comments} comments
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getStatusColor(
                      pr.status
                    )}`}
                  >
                    {pr.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PR Details Panel */}
        {selectedPR && (
          <Card className="border border-border h-fit sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">PR Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  PULL REQUEST
                </p>
                <p className="text-sm font-mono text-foreground">
                  #{selectedPR.number}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  TITLE
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedPR.title}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  AUTHOR
                </p>
                <p className="text-sm text-foreground">{selectedPR.author}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  STATUS
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${getStatusColor(
                    selectedPR.status
                  )}`}
                >
                  {selectedPR.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    ADDITIONS
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +{selectedPR.additions}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    DELETIONS
                  </p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    -{selectedPR.deletions}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  COMMENTS
                </p>
                <p className="text-sm text-foreground">{selectedPR.comments}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  REPOSITORY
                </p>
                <p className="text-sm text-foreground">
                  {selectedPR.repository}
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <Button className="w-full" size="sm">
                  Review on GitHub
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Approve PR
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredPRs.length === 0 && (
        <Card className="border border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">
              No pull requests found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
