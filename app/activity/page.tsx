'use client'

import { Clock, GitBranch, MessageCircle, Zap } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { mockActivityTimeline } from '@/lib/mock-data'

export default function ActivityPage() {
  const stats = {
    issuesCreated: mockActivityTimeline.filter((a) => a.type === 'issue' && a.action === 'created').length,
    mergedPRs: mockActivityTimeline.filter((a) => a.type === 'pr' && a.action === 'merged').length,
    closedIssues: mockActivityTimeline.filter((a) => a.type === 'issue' && a.action === 'closed').length,
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity Center"
        description="Track all activities across your repositories"
      />

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Issues Created</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.issuesCreated}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">PRs Merged</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.mergedPRs}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Issues Closed</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.closedIssues}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        <ActivityTimeline activities={mockActivityTimeline} />
      </div>
    </div>
  )
}
