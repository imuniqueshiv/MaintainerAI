'use client'

import Link from 'next/link'
import { ArrowRight, GitBranch, MessageCircle, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { RepositoryTable } from '@/components/shared/repository-table'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { HealthBadge } from '@/components/shared/health-badge'
import {
  mockRepositories,
  mockDashboardStats,
  mockActivityTimeline,
} from '@/lib/mock-data'

export default function Dashboard() {

  const avgHealthScore = Math.round(
    mockRepositories.reduce((acc, repo) => acc + repo.healthScore, 0) / mockRepositories.length
  )
  const automatedCount = mockRepositories.filter((r) => r.automationEnabled).length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Manage your repositories and track automation metrics in real-time"
        action={
          <Link href="/ai-generator">
            <Button className="gap-2">
              <Zap className="w-4 h-4" />
              Generate with AI
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Total Repositories</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {mockRepositories.length}
                </p>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2 this month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Avg Repository Health</p>
              <div className="flex items-center gap-3">
                <HealthBadge score={avgHealthScore} size="md" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Automation Enabled</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">{automatedCount}</p>
                <span className="text-xs text-muted-foreground">
                  of {mockRepositories.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Open Issues</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {mockDashboardStats.openIssues}
                </p>
                <span className="text-xs text-yellow-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repositories Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Repositories</h2>
            <Link href="/repositories">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <RepositoryTable repositories={mockRepositories.slice(0, 3)} />
        </div>

        {/* Activity Sidebar */}
        <div>
          <Card className="border border-border sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={mockActivityTimeline} maxItems={5} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/ai-generator">
          <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 space-y-2">
              <Zap className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Generate Issues</h3>
              <p className="text-sm text-muted-foreground">
                Use AI to create and manage issues
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pull-requests">
          <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 space-y-2">
              <GitBranch className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Review PRs</h3>
              <p className="text-sm text-muted-foreground">
                Check pending pull requests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/issues">
          <Card className="border border-border hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6 space-y-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Manage Issues</h3>
              <p className="text-sm text-muted-foreground">
                Organize and track issues
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
