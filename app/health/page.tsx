'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { HealthMetric } from '@/components/shared/health-metric'
import { mockRepositories, mockRepositoryHealth } from '@/lib/mock-data'

export default function HealthCenterPage() {
  const [selectedRepo, setSelectedRepo] = useState(mockRepositories[0])
  const health = mockRepositoryHealth[selectedRepo.id as keyof typeof mockRepositoryHealth]

  const healthMetrics: Array<{
    label: string
    value: number | string
    unit?: string
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  }> = [
    { label: 'Code Quality', value: health.codeQuality, unit: '%', color: 'blue' },
    { label: 'Documentation', value: health.documentation, unit: '%', color: 'purple' },
    { label: 'CI Status', value: health.ciStatus === 'passing' ? '✓ Passing' : '✗ Failing', color: 'green' },
    { label: 'Security Alerts', value: health.securityAlerts, unit: 'alerts', color: health.securityAlerts > 0 ? 'red' : 'green' },
    { label: 'Dependency Health', value: health.dependencyHealth, unit: '%', color: 'yellow' },
    { label: 'Automation Coverage', value: health.automationCoverage, unit: '%', color: 'purple' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Repository Health Center"
        description="Monitor the health and metrics of your repositories"
      />

      {/* Repository Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mockRepositories.map((repo) => (
          <button
            key={repo.id}
            onClick={() => setSelectedRepo(repo)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedRepo.id === repo.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <p className="font-semibold text-foreground">{repo.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{repo.owner}</p>
          </button>
        ))}
      </div>

      {/* Health Overview */}
      <Card className="border border-border bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Overall Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-8">
            <div>
              <p className="text-6xl font-bold text-primary">{selectedRepo.healthScore}</p>
              <p className="text-muted-foreground mt-2">out of 100</p>
            </div>
            <div className="flex-1 space-y-2 pb-4">
              <div className="h-3 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                  style={{ width: `${selectedRepo.healthScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Last checked {health.lastHealthCheck?.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthMetrics.map((metric, idx) => (
            <HealthMetric key={idx} {...metric} />
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues & PRs */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Issue & PR Backlog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-2xl font-bold text-foreground">{health.issueBacklog}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div>
                <p className="text-sm text-muted-foreground">Open PRs</p>
                <p className="text-2xl font-bold text-foreground">{health.prBacklog}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Release & Contributor Info */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Activity & Releases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground">Release Frequency</p>
              <p className="text-2xl font-bold text-foreground">{health.releaseFrequency}</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-muted-foreground">Contributor Activity</p>
              <p className="text-2xl font-bold text-foreground">{health.contributorActivity}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/repositories/${selectedRepo.id}`}>
          <Button>
            View Repository Details
          </Button>
        </Link>
        <Button variant="outline">
          Download Health Report
        </Button>
      </div>
    </div>
  )
}
