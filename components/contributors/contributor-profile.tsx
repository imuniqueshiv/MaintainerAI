'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  Award,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import type { ContributorProfile } from '@/lib/contributor-types'

interface ContributorProfileProps {
  contributor: ContributorProfile
}

export function ContributorProfile({ contributor }: ContributorProfileProps) {
  const contributionRate = (
    (contributor.contributions /
      (Math.ceil((new Date().getTime() - contributor.joinedAt.getTime()) / (1000 * 60 * 60 * 24)) || 1)) *
    100
  ).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {contributor.avatar && (
            <Image
              src={contributor.avatar}
              alt={contributor.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-lg border-2 border-border"
              unoptimized
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{contributor.name}</h1>
            <p className="text-muted-foreground">@{contributor.login}</p>
            {contributor.bio && (
              <p className="text-sm text-foreground mt-2">{contributor.bio}</p>
            )}
            <div className="flex gap-4 mt-3 text-sm">
              {contributor.location && (
                <span className="text-muted-foreground">📍 {contributor.location}</span>
              )}
              {contributor.company && (
                <span className="text-muted-foreground">💼 {contributor.company}</span>
              )}
              {contributor.followers > 0 && (
                <span className="text-muted-foreground">👥 {contributor.followers} followers</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Role</p>
            <Badge className={contributor.isMaintainer ? 'bg-purple-100 text-purple-800' : ''}>
              {contributor.isMaintainer ? 'Maintainer' : 'Contributor'}
            </Badge>
            {contributor.isBotAccount && (
              <Badge className="bg-gray-100 text-gray-800 ml-2">Bot</Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Contributions</p>
              <p className="text-2xl font-bold text-foreground">{contributor.contributions}</p>
              <p className="text-xs text-muted-foreground mt-1">{contributionRate}/day avg</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Repositories</p>
              <p className="text-2xl font-bold text-foreground">{contributor.repositories.length}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">PRs Merged</p>
              <p className="text-2xl font-bold text-primary">{contributor.prMerged}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((contributor.prMerged / contributor.prOpened) * 100).toFixed(0)}% merge rate
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Review Time</p>
              <p className="text-lg font-bold text-foreground">{contributor.averageReviewTime}</p>
              <p className="text-xs text-muted-foreground mt-1">avg per PR</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contribution Breakdown */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Contribution Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground">Issues Closed</span>
                    <span className="font-semibold">{contributor.issuesClosed}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground">PRs Merged</span>
                    <span className="font-semibold">{contributor.prMerged}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground">Code Reviews</span>
                    <span className="font-semibold">{contributor.reviewCount}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Areas */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {contributor.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-green-600">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {contributor.areasToImprove.map((area, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-yellow-600">→</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Activity Graph */}
          {contributor.activityByMonth.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contributor.activityByMonth.map((month) => (
                    <div key={month.month}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{month.month}</span>
                        <span className="font-medium">{month.contributions}</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(month.contributions / Math.max(...contributor.activityByMonth.map((m) => m.contributions))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Badges */}
          {contributor.badges.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {contributor.badges.map((badge) => (
                    <div
                      key={badge.name}
                      className="p-3 bg-secondary rounded-lg text-center hover:bg-secondary/80 transition-colors"
                    >
                      <p className="text-xl mb-1">{badge.icon}</p>
                      <p className="text-xs font-medium text-secondary-foreground">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mentorship */}
          {contributor.mentorStatus && contributor.mentorStatus !== 'none' && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Status: {contributor.mentorStatus === 'both' ? 'Mentor & Mentee' : contributor.mentorStatus === 'mentor' ? 'Mentor' : 'Mentee'}
                </p>
                {contributor.mentees && contributor.mentees.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-2">Mentees ({contributor.mentees.length})</p>
                    <div className="space-y-1">
                      {contributor.mentees.map((mentee) => (
                        <p key={mentee} className="text-sm text-muted-foreground">
                          👤 {mentee}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Suggested Issues */}
          {contributor.suggestedFirstIssues.length > 0 && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Good First Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contributor.suggestedFirstIssues.map((issue) => (
                  <div
                    key={issue.issueId}
                    className="p-2 bg-secondary rounded hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-medium text-secondary-foreground truncate">
                      {issue.title}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
