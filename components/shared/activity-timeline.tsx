'use client'

import { MessageCircle, GitPullRequest, Clock } from 'lucide-react'

interface Activity {
  id: string | number
  type: 'issue' | 'pr'
  title: string
  action: string
  timestamp: Date | string
  repository: string
  author: string
}

interface ActivityTimelineProps {
  activities: Activity[]
  maxItems?: number
}

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const formatTime = (value: Date | string) => {
    const date = value instanceof Date ? value : new Date(value)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (Number.isNaN(date.getTime()) || hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, maxItems).map((activity) => (
        <div key={activity.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {activity.type === 'pr' ? (
                <GitPullRequest className="w-5 h-5 text-primary" />
              ) : (
                <MessageCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {activity.type === 'pr' ? 'PR' : 'Issue'} {activity.action}
            </p>
            <p className="text-sm text-muted-foreground truncate mt-1">{activity.title}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="text-primary font-medium">{activity.repository}</span>
              <span>by {activity.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatTime(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
