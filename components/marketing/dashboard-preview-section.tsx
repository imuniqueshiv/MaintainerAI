'use client'

import Link from 'next/link'
import { ArrowRight, Bot, GitPullRequest, MessageCircle, Users, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthBadge } from '@/components/shared/health-badge'
import { AutomationBadge } from '@/components/shared/automation-badge'
import {
  mockAIInsights,
  mockDashboardStats,
  mockRepositories,
} from '@/lib/mock-data'

export function DashboardPreviewSection() {
  const avgHealth = Math.round(
    mockRepositories.reduce((acc, repo) => acc + repo.healthScore, 0) / mockRepositories.length,
  )
  const automated = mockRepositories.filter((r) => r.automationEnabled).length
  const topRepos = mockRepositories.slice(0, 3)
  const insights = mockAIInsights.slice(0, 3)

  return (
    <section className="border-b border-border bg-muted/20 py-20" aria-labelledby="preview-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="preview-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Live dashboard preview
            </h2>
            <p className="mt-3 text-muted-foreground">
              The same surfaces you get inside MaintainerAI—health, issues, PRs, contributors, AI suggestions, and
              automation—using realistic sample data.
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="gap-2">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card className="mt-10 overflow-hidden border border-border shadow-lg">
          <CardHeader className="border-b border-border bg-card/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-lg">MaintainerAI · Overview</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500" aria-hidden />
                Sample workspace
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Avg Health" value={<HealthBadge score={avgHealth} size="sm" />} />
              <Stat
                label="Open PRs"
                value={String(mockDashboardStats.openPRs)}
                icon={<GitPullRequest className="h-4 w-4 text-primary" />}
              />
              <Stat
                label="Open Issues"
                value={String(mockDashboardStats.openIssues)}
                icon={<MessageCircle className="h-4 w-4 text-primary" />}
              />
              <Stat
                label="Automation"
                value={`${automated}/${mockRepositories.length}`}
                icon={<Workflow className="h-4 w-4 text-primary" />}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-3 lg:col-span-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <h3 className="text-sm font-semibold text-foreground">Repositories</h3>
                </div>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Repository</th>
                        <th className="px-4 py-3 font-medium">Health</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">Automation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRepos.map((repo) => (
                        <tr key={repo.id} className="border-t border-border">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">
                              {repo.owner}/{repo.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {repo.openIssues} issues · {repo.openPRs} PRs
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <HealthBadge score={repo.healthScore} size="sm" />
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <AutomationBadge enabled={repo.automationEnabled} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div key={insight.id} className="rounded-xl border border-border bg-background/60 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {insight.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{insight.suggestedAction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
    </div>
  )
}
