'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Workflow,
  GitBranch,
  Users,
  Package,
  Zap,
  BarChart3,
  Settings,
  BookOpen,
  Play,
  MessageSquare,
} from 'lucide-react'

interface RepositoryInfo {
  name: string
  owner: string
  description: string
  stars: number
  forks: number
  language: string
  healthScore: number
  lastUpdated: Date
}

interface CommandCenterProps {
  repository: RepositoryInfo
}

export function RepositoryCommandCenter({ repository }: CommandCenterProps) {
  const [collapsedWidgets, setCollapsedWidgets] = useState<string[]>([])

  const toggleWidget = (widgetId: string) => {
    setCollapsedWidgets((prev) =>
      prev.includes(widgetId) ? prev.filter((w) => w !== widgetId) : [...prev, widgetId]
    )
  }

  const widgets = [
    {
      id: 'health',
      title: 'Health',
      icon: TrendingUp,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall Score</span>
            <span className="text-2xl font-bold text-primary">{repository.healthScore}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${repository.healthScore}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium text-foreground">
                {repository.lastUpdated.toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Language</p>
              <Badge variant="outline" className="mt-1">
                {repository.language}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'issues',
      title: 'Issues',
      icon: AlertCircle,
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Card className="border border-border bg-card">
              <CardContent className="pt-3">
                <p className="text-2xl font-bold text-foreground">45</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardContent className="pt-3">
                <p className="text-2xl font-bold text-blue-600">128</p>
                <p className="text-xs text-muted-foreground">Closed</p>
              </CardContent>
            </Card>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            Manage Issues
          </Button>
        </div>
      ),
    },
    {
      id: 'prs',
      title: 'Pull Requests',
      icon: GitBranch,
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Card className="border border-border bg-card">
              <CardContent className="pt-3">
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardContent className="pt-3">
                <p className="text-2xl font-bold text-green-600">324</p>
                <p className="text-xs text-muted-foreground">Merged</p>
              </CardContent>
            </Card>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            Review PRs
          </Button>
        </div>
      ),
    },
    {
      id: 'contributors',
      title: 'Contributors',
      icon: Users,
      content: (
        <div className="space-y-2">
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-secondary-foreground">34</p>
            <p className="text-xs text-muted-foreground">Active Maintainers</p>
          </div>
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-secondary-foreground">284</p>
            <p className="text-xs text-muted-foreground">Total Contributors</p>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            View Team
          </Button>
        </div>
      ),
    },
    {
      id: 'releases',
      title: 'Releases',
      icon: Package,
      content: (
        <div className="space-y-2">
          <div className="p-3 bg-secondary rounded">
            <p className="font-medium text-secondary-foreground">v2.5.0</p>
            <p className="text-xs text-muted-foreground">Latest Release</p>
            <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            Create Release
          </Button>
        </div>
      ),
    },
    {
      id: 'actions',
      title: 'Actions',
      icon: Workflow,
      content: (
        <div className="space-y-2">
          <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              All Checks Passing
            </p>
            <p className="text-xs text-green-800 dark:text-green-300">Last run: 2 hours ago</p>
          </div>
          <Button className="w-full gap-2" variant="outline" size="sm">
            <Play className="w-4 h-4" />
            Run Workflow
          </Button>
        </div>
      ),
    },
    {
      id: 'automation',
      title: 'Automation',
      icon: Zap,
      content: (
        <div className="space-y-2">
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-secondary-foreground">8</p>
            <p className="text-xs text-muted-foreground">Active Automations</p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-foreground">✓ Auto-label PRs</p>
            <p className="text-foreground">✓ Auto-assign reviews</p>
            <p className="text-foreground">✓ Release automation</p>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            Configure
          </Button>
        </div>
      ),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-secondary rounded text-center">
              <p className="text-lg font-bold text-secondary-foreground">12.5</p>
              <p className="text-xs text-muted-foreground">PRs/week</p>
            </div>
            <div className="p-2 bg-secondary rounded text-center">
              <p className="text-lg font-bold text-secondary-foreground">3.2</p>
              <p className="text-xs text-muted-foreground">days to merge</p>
            </div>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            View Report
          </Button>
        </div>
      ),
    },
    {
      id: 'documentation',
      title: 'Documentation',
      icon: BookOpen,
      content: (
        <div className="space-y-2">
          <div className="p-2 bg-secondary rounded">
            <p className="text-sm font-medium text-secondary-foreground">README.md</p>
            <p className="text-xs text-muted-foreground">Last updated: 1 week ago</p>
          </div>
          <Badge className="bg-green-100 text-green-800">Complete</Badge>
          <Button className="w-full" variant="outline" size="sm">
            Edit Docs
          </Button>
        </div>
      ),
    },
    {
      id: 'discussions',
      title: 'Discussions',
      icon: MessageSquare,
      content: (
        <div className="space-y-2">
          <div className="p-2 bg-secondary rounded">
            <p className="text-lg font-bold text-secondary-foreground">24</p>
            <p className="text-xs text-muted-foreground">Active Discussions</p>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            Browse Discussions
          </Button>
        </div>
      ),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      content: (
        <div className="space-y-2">
          <div className="text-sm space-y-1">
            <p className="text-foreground">⚙ Protection Rules</p>
            <p className="text-foreground">⚙ Branch Settings</p>
            <p className="text-foreground">⚙ Webhooks</p>
          </div>
          <Button className="w-full" variant="outline" size="sm">
            Configure
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{repository.name}</h1>
        <p className="text-muted-foreground">{repository.description}</p>
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">⭐ {repository.stars.toLocaleString()} stars</span>
          <span className="text-muted-foreground">🍴 {repository.forks.toLocaleString()} forks</span>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {widgets.map((widget) => {
          const Icon = widget.icon
          const isCollapsed = collapsedWidgets.includes(widget.id)

          return (
            <Card key={widget.id} className="border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {widget.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                    className="p-1 h-auto"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {!isCollapsed && <CardContent>{widget.content}</CardContent>}
            </Card>
          )
        })}
      </div>

      {/* Info Footer */}
      <Card className="border border-border bg-secondary/30">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Drag widgets to reorder, collapse to focus on what matters. All changes are automatically saved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
