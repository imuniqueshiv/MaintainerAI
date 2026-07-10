export type IssueState = 'draft' | 'open' | 'claimed' | 'in-progress' | 'review' | 'blocked' | 'ready-to-merge' | 'closed'

export interface IssueTimelineEvent {
  id: string
  type: 'status-change' | 'comment' | 'assignment' | 'label-change' | 'review'
  title: string
  description?: string
  actor: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface IssueChecklistItem {
  id: string
  title: string
  completed: boolean
  checkedAt?: Date
}

export interface IssueSuggestion {
  id: string
  type: 'label' | 'contributor' | 'related-issue' | 'related-pr'
  title: string
  description: string
  confidence: number
  action?: () => void
}

export interface IssueDetailExtended {
  id: number
  number: number
  title: string
  description: string
  state: IssueState
  assignees: string[]
  labels: string[]
  estimatedDifficulty: 'easy' | 'medium' | 'hard' | 'unknown'
  estimatedCompletionTime?: string
  potentialFilesAffected: string[]
  dependencies: { issueId: number; type: 'depends-on' | 'blocks' }[]
  timeline: IssueTimelineEvent[]
  checklist: IssueChecklistItem[]
  suggestions: IssueSuggestion[]
  relatedPRs: number[]
  relatedIssues: number[]
  createdAt: Date
  updatedAt: Date
  repository: string
}

export const issueStateColors: Record<IssueState, string> = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-blue-100 text-blue-800',
  claimed: 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  review: 'bg-orange-100 text-orange-800',
  blocked: 'bg-red-100 text-red-800',
  'ready-to-merge': 'bg-green-100 text-green-800',
  closed: 'bg-gray-500 text-white',
}

export const issueStateLabels: Record<IssueState, string> = {
  draft: 'Draft',
  open: 'Open',
  claimed: 'Claimed',
  'in-progress': 'In Progress',
  review: 'Review',
  blocked: 'Blocked',
  'ready-to-merge': 'Ready To Merge',
  closed: 'Closed',
}

export const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-800',
}
