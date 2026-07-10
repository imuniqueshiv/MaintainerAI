export interface ContributorProfile {
  id: string
  login: string
  name: string
  avatar?: string
  bio?: string
  location?: string
  company?: string
  joinedAt: Date
  lastActive: Date
  
  // Statistics
  contributions: number
  repositories: string[]
  followers: number
  following: number
  
  // Contribution Analytics
  issuesOpened: number
  issuesClosed: number
  prOpened: number
  prMerged: number
  prRejected: number
  
  // Review Metrics
  averageReviewTime: string
  averageMergeTime: string
  reviewCount: number
  
  // Achievements
  badges: { name: string; icon: string; date: Date }[]
  isMaintainer: boolean
  isBotAccount: boolean
  
  // Strengths & Areas
  strengths: string[]
  areasToImprove: string[]
  suggestedFirstIssues: { issueId: number; title: string }[]
  
  // Activity Graph
  activityByMonth: { month: string; contributions: number }[]
  
  // Mentor Status
  mentorStatus?: 'mentor' | 'mentee' | 'both' | 'none'
  mentees?: string[]
  mentors?: string[]
}

export interface ContributorBadge {
  name: string
  description: string
  icon: string
  earnedAt: Date
}

export const badgeTypes: Record<string, ContributorBadge> = {
  'first-contribution': {
    name: 'First Contribution',
    description: 'Made your first contribution',
    icon: '🎉',
    earnedAt: new Date(),
  },
  'code-contributor': {
    name: 'Code Contributor',
    description: '50+ merged pull requests',
    icon: '💻',
    earnedAt: new Date(),
  },
  'issue-master': {
    name: 'Issue Master',
    description: '50+ issues resolved',
    icon: '🎯',
    earnedAt: new Date(),
  },
  'reviewer': {
    name: 'Reviewer',
    description: '100+ reviews submitted',
    icon: '👀',
    earnedAt: new Date(),
  },
  'maintainer': {
    name: 'Maintainer',
    description: 'Core team member',
    icon: '⭐',
    earnedAt: new Date(),
  },
}
