'use client'

import Image from 'next/image'
import { Users, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ContributorCard } from '@/components/shared/contributor-card'
import { mockContributors } from '@/lib/mock-data'

export default function ContributorsPage() {
  const topContributors = mockContributors.sort((a, b) => b.contributions - a.contributions)
  const maintainers = mockContributors.filter((c) => c.isMainMaintainer)
  const totalContributions = mockContributors.reduce((sum, c) => sum + c.contributions, 0)
  const avgContributions = Math.round(totalContributions / mockContributors.length)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contributor Analytics"
        description="Track and analyze contribution patterns across your team"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Contributors</p>
          <p className="text-3xl font-bold text-foreground mt-1">{mockContributors.length}</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Maintainers</p>
          <p className="text-3xl font-bold text-foreground mt-1">{maintainers.length}</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Contributions</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalContributions}</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Average/Contributor</p>
          <p className="text-3xl font-bold text-foreground mt-1">{avgContributions}</p>
        </div>
      </div>

      {/* Maintainers Section */}
      {maintainers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Maintainers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maintainers.map((contributor) => (
              <ContributorCard key={contributor.id} {...contributor} />
            ))}
          </div>
        </div>
      )}

      {/* All Contributors */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Top Contributors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topContributors.map((contributor) => (
            <ContributorCard key={contributor.id} {...contributor} />
          ))}
        </div>
      </div>

      {/* Contribution Leaderboard */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-sidebar px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Contribution Leaderboard</h3>
        </div>
        <div className="divide-y divide-border">
          {topContributors.map((contributor, idx) => (
            <div key={contributor.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {idx + 1}
                </div>
                <Image
                  src={contributor.avatar}
                  alt={contributor.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  unoptimized
                />
                <div>
                  <p className="font-medium text-foreground">{contributor.name}</p>
                  <p className="text-xs text-muted-foreground">@{contributor.login}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{contributor.contributions}</p>
                <p className="text-xs text-muted-foreground">contributions</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
