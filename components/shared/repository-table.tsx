'use client'

import Link from 'next/link'
import { Star, GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HealthBadge } from './health-badge'
import { AutomationBadge } from './automation-badge'

interface Repository {
  id: number
  name: string
  owner: string
  description: string
  stars: number
  forks: number
  language: string
  lastUpdated: Date
  healthScore: number
  automationEnabled: boolean
  automationIssuesResolved: number
  automationPRsMerged: number
  openIssues: number
  openPRs: number
}

interface RepositoryTableProps {
  repositories: Repository[]
}

export function RepositoryTable({ repositories }: RepositoryTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary/50 border-b border-border">
            <th className="px-6 py-4 text-left font-semibold text-foreground">Repository</th>
            <th className="px-6 py-4 text-left font-semibold text-foreground">Health</th>
            <th className="px-6 py-4 text-left font-semibold text-foreground">Automation</th>
            <th className="px-6 py-4 text-left font-semibold text-foreground">Activity</th>
            <th className="px-6 py-4 text-right font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repo) => (
            <tr key={repo.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
              <td className="px-6 py-4">
                <div>
                  <Link
                    href={`/repositories/${repo.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {repo.owner}/{repo.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{repo.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stars.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {repo.forks}
                    </span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                      {repo.language}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <HealthBadge score={repo.healthScore} size="sm" />
              </td>
              <td className="px-6 py-4">
                <AutomationBadge
                  enabled={repo.automationEnabled}
                  issuesResolved={repo.automationIssuesResolved}
                  prsMerged={repo.automationPRsMerged}
                  size="sm"
                />
              </td>
              <td className="px-6 py-4">
                <div className="text-xs space-y-1">
                  <div className="text-muted-foreground">
                    Issues: <span className="font-semibold text-foreground">{repo.openIssues}</span>
                  </div>
                  <div className="text-muted-foreground">
                    PRs: <span className="font-semibold text-foreground">{repo.openPRs}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <Link href={`/repositories/${repo.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
