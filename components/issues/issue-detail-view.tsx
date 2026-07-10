'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitBranch, Link2 } from 'lucide-react'
import type { IssueDetailExtended, IssueState } from '@/lib/issue-workflow-types'
import { issueStateColors, issueStateLabels, difficultyColors } from '@/lib/issue-workflow-types'

interface IssueDetailViewProps {
  issue: IssueDetailExtended
  onStateChange?: (newState: IssueState) => void
}

const stateTransitions: Record<IssueState, IssueState[]> = {
  draft: ['open', 'closed'],
  open: ['claimed', 'in-progress', 'closed'],
  claimed: ['in-progress', 'open', 'blocked'],
  'in-progress': ['review', 'blocked', 'open'],
  review: ['ready-to-merge', 'blocked', 'in-progress'],
  blocked: ['open', 'in-progress', 'review'],
  'ready-to-merge': ['closed'],
  closed: ['open'],
}

export function IssueDetailView({ issue, onStateChange }: IssueDetailViewProps) {
  const [currentState, setCurrentState] = useState<IssueState>(issue.state)

  const handleStateChange = (newState: IssueState) => {
    setCurrentState(newState)
    onStateChange?.(newState)
  }

  const availableTransitions = stateTransitions[currentState] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{issue.title}</h1>
              <Badge className={issueStateColors[currentState]}>
                {issueStateLabels[currentState]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {issue.repository}#{issue.number}
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
              <Badge className={difficultyColors[issue.estimatedDifficulty]}>
                {issue.estimatedDifficulty}
              </Badge>
            </CardContent>
          </Card>
          {issue.estimatedCompletionTime && (
            <Card className="border border-border">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">Est. Time</p>
                <p className="font-medium text-foreground">{issue.estimatedCompletionTime}</p>
              </CardContent>
            </Card>
          )}
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Checklist</p>
              <p className="font-medium text-foreground">
                {issue.checklist.filter((c) => c.completed).length}/{issue.checklist.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-1">Files</p>
              <p className="font-medium text-foreground">{issue.potentialFilesAffected.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{issue.description}</p>
            </CardContent>
          </Card>

          {/* Checklist */}
          {issue.checklist.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {issue.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.timeline.length > 0 ? (
                issue.timeline.map((event) => (
                  <div key={event.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <div className="flex-shrink-0 pt-1">
                      {event.type === 'status-change' && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      {event.type === 'comment' && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      {event.type === 'assignment' && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.actor} • {event.timestamp.toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p className="text-sm text-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No timeline events yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* State Management */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${issueStateColors[currentState]}`}>
                  {issueStateLabels[currentState]}
                </span>
              </div>
              <div className="space-y-2">
                {availableTransitions.map((state) => (
                  <Button
                    key={state}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStateChange(state)}
                  >
                    Move to {issueStateLabels[state]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assignees */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Assignees</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.assignees.length > 0 ? (
                <div className="space-y-2">
                  {issue.assignees.map((assignee) => (
                    <div
                      key={assignee}
                      className="px-3 py-2 bg-secondary rounded-lg text-sm text-secondary-foreground"
                    >
                      {assignee}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Labels */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Labels</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.labels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {issue.labels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No labels</p>
              )}
            </CardContent>
          </Card>

          {/* Related Items */}
          {(issue.relatedPRs.length > 0 || issue.relatedIssues.length > 0) && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Related</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {issue.relatedPRs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Pull Requests</p>
                    {issue.relatedPRs.map((prId) => (
                      <Button
                        key={prId}
                        variant="ghost"
                        className="w-full justify-start gap-2 text-sm"
                      >
                        <GitBranch className="w-4 h-4" />
                        PR #{prId}
                      </Button>
                    ))}
                  </div>
                )}
                {issue.relatedIssues.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Issues</p>
                    {issue.relatedIssues.map((issueId) => (
                      <Button
                        key={issueId}
                        variant="ghost"
                        className="w-full justify-start gap-2 text-sm"
                      >
                        <Link2 className="w-4 h-4" />
                        Issue #{issueId}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
