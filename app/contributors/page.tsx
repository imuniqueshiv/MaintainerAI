'use client'

import Image from 'next/image'
import { Users, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { useSyncedContributors } from '@/lib/hooks/use-synced-data'

export default function ContributorsPage() {
  const { contributors, loading, error } = useSyncedContributors()
  const topContributors = [...contributors].sort((a, b) => b.contributions - a.contributions)
  const maintainers = contributors.filter((c) => c.isMainMaintainer)
  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0)
  const avgContributions =
    contributors.length === 0 ? 0 : Math.round(totalContributions / contributors.length)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contributor Analytics"
        description="Track synchronized contribution patterns across your team"
      />

      {error ? (
        <Card className="border border-border">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Contributors</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {loading ? '—' : contributors.length}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Maintainers</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {loading ? '—' : maintainers.length}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Contributions</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {loading ? '—' : totalContributions}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Average/Contributor</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {loading ? '—' : avgContributions}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading synchronized contributors…</p>
      ) : contributors.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
            No synchronized contributors yet. Run a repository sync to populate this view.
          </CardContent>
        </Card>
      ) : (
        <>
          {maintainers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Maintainers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintainers.map((c) => (
                  <Card key={c.id} className="border border-border">
                    <CardContent className="pt-6 flex items-center gap-3">
                      {c.avatar ? (
                        <Image
                          src={c.avatar}
                          alt={c.login}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary" />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{c.name ?? c.login}</p>
                        <p className="text-sm text-muted-foreground">@{c.login}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {c.contributions} contributions
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Top Contributors</h2>
            </div>
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
              {topContributors.map((contributor, idx) => (
                <div
                  key={contributor.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {idx + 1}
                    </div>
                    {contributor.avatar ? (
                      <Image
                        src={contributor.avatar}
                        alt={contributor.login}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : null}
                    <div>
                      <p className="font-medium text-foreground">
                        {contributor.name ?? contributor.login}
                      </p>
                      <p className="text-xs text-muted-foreground">@{contributor.login}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{contributor.contributions}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
