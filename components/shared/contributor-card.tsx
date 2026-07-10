'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Crown } from 'lucide-react'

interface ContributorCardProps {
  name: string
  login: string
  avatar: string
  contributions: number
  isMainMaintainer: boolean
  averageReviewTime: string
  averageMergeTime: string
  openPRCount: number
  issuesSolved: number
}

export function ContributorCard({
  name,
  login,
  avatar,
  contributions,
  isMainMaintainer,
  averageReviewTime,
  averageMergeTime,
  openPRCount,
  issuesSolved,
}: ContributorCardProps) {
  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Image
              src={avatar}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
              unoptimized
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{name}</h3>
                {isMainMaintainer && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <Crown className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Maintainer</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{login}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Contributions</p>
              <p className="font-semibold text-foreground">{contributions}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Issues Solved</p>
              <p className="font-semibold text-foreground">{issuesSolved}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Review Time</p>
              <p className="font-semibold text-foreground">{averageReviewTime}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Merge Time</p>
              <p className="font-semibold text-foreground">{averageMergeTime}</p>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <div className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded px-2 py-1">
              <p className="text-blue-700 dark:text-blue-300 font-medium">{openPRCount} open PR{openPRCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
