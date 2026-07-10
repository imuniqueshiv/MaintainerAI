export interface CodeChange {
  id: string
  file: string
  additions: number
  deletions: number
  changes: number
  status: 'added' | 'modified' | 'deleted'
  diff?: string
}

export interface ReviewCheck {
  id: string
  name: string
  status: 'passed' | 'failed' | 'pending'
  description: string
  timestamp: Date
  url?: string
}

export interface SecurityAnalysis {
  risk: 'critical' | 'high' | 'medium' | 'low' | 'none'
  issues: { title: string; description: string; severity: string }[]
  hasSecretDetection: boolean
  hasDependencyVulnerabilities: boolean
}

export interface PerformanceAnalysis {
  issues: { title: string; impact: string; suggestion: string }[]
  bundleSizeChange?: { delta: number; percentage: number }
}

export interface ReviewComment {
  id: string
  author: string
  avatar?: string
  content: string
  file?: string
  line?: number
  replies: ReviewComment[]
  timestamp: Date
}

export interface AIReviewSummary {
  summary: string
  keyFindings: string[]
  suggestedChanges: { file: string; suggestion: string }[]
  approvalRecommendation: 'approve' | 'request-changes' | 'comment'
  confidence: number
}

export interface PRReviewDetail {
  id: number
  number: number
  title: string
  author: string
  authorAvatar?: string
  description: string
  state: 'draft' | 'open' | 'merged' | 'closed'
  createdAt: Date
  updatedAt: Date
  changedFiles: CodeChange[]
  additions: number
  deletions: number
  commits: number
  checks: ReviewCheck[]
  ciStatus: 'success' | 'failure' | 'pending'
  testCoverage?: { current: number; change: number }
  documentationCoverage?: boolean
  breakingChanges: { description: string; impact: string }[]
  securityAnalysis: SecurityAnalysis
  performanceAnalysis: PerformanceAnalysis
  reviewComments: ReviewComment[]
  approvals: string[]
  changesRequested: string[]
  aiReview: AIReviewSummary
  mergeReadiness: {
    score: number
    blockers: string[]
    warnings: string[]
    suggestions: string[]
  }
  relatedIssues: number[]
  repository: string
}

export const riskColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  none: 'bg-green-100 text-green-800',
}
