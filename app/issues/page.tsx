'use client'

import { useState } from 'react'
import { Search, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockIssues } from '@/lib/mock-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-700 dark:text-red-400'
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
    default:
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
  }
}

export default function IssuesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<(typeof mockIssues)[0] | null>(
    null
  )

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || issue.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Issues</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all repository issues.
          </p>
        </div>
        <Button className="gap-2">
          <AlertCircle className="w-4 h-4" />
          Create Issue
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
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
            <SelectItem value="all">All Issues</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issues List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filteredIssues.map((issue) => (
            <Card
              key={issue.id}
              className="border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => setSelectedIssue(issue)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{issue.number}
                      </span>
                      <h3 className="font-semibold text-foreground">
                        {issue.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                          issue.priority
                        )}`}
                      >
                        {issue.priority}
                      </span>
                      {issue.labels.map((label) => (
                        <span
                          key={label}
                          className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {label}
                        </span>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        by {issue.author}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Issue Details Panel */}
        {selectedIssue && (
          <Card className="border border-border h-fit sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  ISSUE
                </p>
                <p className="text-sm font-mono text-foreground">
                  #{selectedIssue.number}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  TITLE
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {selectedIssue.title}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  STATUS
                </p>
                <p className="text-sm text-foreground capitalize">
                  {selectedIssue.status}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  PRIORITY
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${getPriorityColor(
                    selectedIssue.priority
                  )}`}
                >
                  {selectedIssue.priority}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  REPOSITORY
                </p>
                <p className="text-sm text-foreground">
                  {selectedIssue.repository}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="w-full" size="sm">
                  View on GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredIssues.length === 0 && (
        <Card className="border border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">
              No issues found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
