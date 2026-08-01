'use client'

import { Clock, GitBranch, MessageCircle, Zap } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { Card, CardContent } from '@/components/ui/card'
import { useSyncedActivity } from '@/lib/hooks/use-synced-data'

export default function ActivityPage() {
  const { activities, loading, error } = useSyncedActivity()

  const stats = {
    issuesUpdated: activities.filter((a) => a.type === 'issue' && a.action !== 'closed').length,
    mergedPRs: activities.filter((a) => a.type === 'pr' && a.action === 'merged').length,
    closedIssues: activities.filter((a) => a.type === 'issue' && a.action === 'closed').length,
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity Center"
        description="Track synchronized activity across your repositories"
      />

      {error ? (
        <Card className="border border-border">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Issue Updates</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {loading ? '—' : stats.issuesUpdated}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">PRs Merged</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {loading ? '—' : stats.mergedPRs}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">Issues Closed</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {loading ? '—' : stats.closedIssues}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading synchronized activity…</p>
        ) : activities.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
              No synchronized activity yet. Run a repository sync to populate this view.
            </CardContent>
          </Card>
        ) : (
          <ActivityTimeline activities={activities} />
        )}
      </div>
    </div>
  )
}
