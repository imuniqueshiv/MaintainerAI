'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  TrendingDown,
  FileText,
  MessageCircle,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react'
import type { PRReviewDetail } from '@/lib/pr-review-types'
import { riskColors } from '@/lib/pr-review-types'

interface PRReviewScreenProps {
  pr: PRReviewDetail
}

export function PRReviewScreen({ pr }: PRReviewScreenProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'timeline' | 'checks' | 'review' | 'analysis'>('files')
  const [expandedFile, setExpandedFile] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{pr.title}</h1>
              <Badge className="bg-blue-100 text-blue-800">#{pr.number}</Badge>
            </div>
            <p className="text-muted-foreground">
              {pr.author} • {pr.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <ThumbsUp className="w-4 h-4" />
              Approve
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Comment
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Changes</p>
              <p className="font-semibold text-foreground">
                {pr.additions > 0 && <span className="text-green-600">+{pr.additions}</span>}{' '}
                {pr.deletions > 0 && <span className="text-red-600">-{pr.deletions}</span>}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Files</p>
              <p className="font-semibold text-foreground">{pr.changedFiles.length}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Commits</p>
              <p className="font-semibold text-foreground">{pr.commits}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">CI Status</p>
              <div className="flex items-center gap-2 mt-1">
                {pr.ciStatus === 'success' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Pass</span>
                  </>
                )}
                {pr.ciStatus === 'failure' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-600">Fail</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Readiness</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pr.mergeReadiness.score}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{pr.mergeReadiness.score}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {['files', 'timeline', 'checks', 'review', 'analysis'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Changed Files */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            {pr.changedFiles.map((file) => (
              <Card
                key={file.id}
                className="border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{file.file}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-600">+{file.additions}</span>
                        <span className="text-xs text-red-600">-{file.deletions}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{file.changes} changes</div>
                  </div>
                  {expandedFile === file.id && file.diff && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <pre className="bg-muted p-3 rounded text-xs text-muted-foreground overflow-x-auto">
                        {file.diff.split('\n').slice(0, 15).join('\n')}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Checks */}
        {activeTab === 'checks' && (
          <div className="space-y-3">
            {pr.checks.map((check) => (
              <Card key={check.id} className="border border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {check.status === 'passed' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {check.status === 'failed' && (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        {check.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-yellow-600 border-t-transparent animate-spin" />
                        )}
                        <h3 className="font-medium text-foreground">{check.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {check.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {check.url && <Button variant="outline" size="sm">View</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review & Analysis */}
        {activeTab === 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Security Analysis */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldAlert className="w-5 h-5" />
                    Security Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`px-3 py-2 rounded-lg ${riskColors[pr.securityAnalysis.risk]}`}>
                    <p className="font-medium text-sm capitalize">{pr.securityAnalysis.risk} Risk</p>
                  </div>
                  {pr.securityAnalysis.issues.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="font-medium text-sm text-red-900">{issue.title}</p>
                      <p className="text-xs text-red-800 mt-1">{issue.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Impact */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="w-5 h-5" />
                    Performance Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pr.performanceAnalysis.bundleSizeChange && (
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="text-sm font-medium text-secondary-foreground">
                        Bundle Size:{' '}
                        <span
                          className={
                            pr.performanceAnalysis.bundleSizeChange.delta > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {pr.performanceAnalysis.bundleSizeChange.delta > 0 ? '+' : ''}
                          {pr.performanceAnalysis.bundleSizeChange.delta}KB (
                          {pr.performanceAnalysis.bundleSizeChange.percentage}%)
                        </span>
                      </p>
                    </div>
                  )}
                  {pr.performanceAnalysis.issues.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="font-medium text-sm text-yellow-900">{issue.title}</p>
                      <p className="text-xs text-yellow-800 mt-1">{issue.suggestion}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Test Coverage */}
              {pr.testCoverage && (
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Test Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Coverage</p>
                        <p className="text-2xl font-bold text-foreground">{pr.testCoverage.current}%</p>
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          pr.testCoverage.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {pr.testCoverage.change > 0 ? '+' : ''}
                        {pr.testCoverage.change}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* AI Review Summary */}
            <div>
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="text-lg">AI Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Summary</p>
                    <p className="text-sm text-foreground">{pr.aiReview.summary}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Key Findings</p>
                    <ul className="space-y-2">
                      {pr.aiReview.keyFindings.map((finding, idx) => (
                        <li key={idx} className="text-xs text-foreground flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Badge
                      className={
                        pr.aiReview.approvalRecommendation === 'approve'
                          ? 'bg-green-100 text-green-800'
                          : pr.aiReview.approvalRecommendation === 'request-changes'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {pr.aiReview.approvalRecommendation === 'approve'
                        ? 'Ready to Approve'
                        : pr.aiReview.approvalRecommendation === 'request-changes'
                          ? 'Changes Requested'
                          : 'Review Comment'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Merge Readiness */}
        {activeTab === 'analysis' && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5" />
                Merge Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Overall Score</span>
                  <span className="text-2xl font-bold text-primary">{pr.mergeReadiness.score}%</span>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pr.mergeReadiness.score}%` }}
                  />
                </div>
              </div>

              {pr.mergeReadiness.blockers.length > 0 && (
                <div>
                  <h3 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Blockers
                  </h3>
                  <ul className="space-y-1">
                    {pr.mergeReadiness.blockers.map((blocker, idx) => (
                      <li key={idx} className="text-sm text-red-700 flex gap-2">
                        <span>•</span> {blocker}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pr.mergeReadiness.warnings.length > 0 && (
                <div>
                  <h3 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Warnings
                  </h3>
                  <ul className="space-y-1">
                    {pr.mergeReadiness.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 flex gap-2">
                        <span>•</span> {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pr.mergeReadiness.suggestions.length > 0 && (
                <div>
                  <h3 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Suggestions
                  </h3>
                  <ul className="space-y-1">
                    {pr.mergeReadiness.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-blue-700 flex gap-2">
                        <span>•</span> {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
