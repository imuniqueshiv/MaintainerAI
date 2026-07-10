'use client'

import { useState } from 'react'
import { Lightbulb, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { InsightCard } from '@/components/shared/insight-card'
import { mockAIInsights } from '@/lib/mock-data'

export default function InsightsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const filteredInsights = selectedSeverity === 'all'
    ? mockAIInsights
    : mockAIInsights.filter((insight) => insight.severity === selectedSeverity)

  const severityDistribution = {
    high: mockAIInsights.filter((i) => i.severity === 'high').length,
    medium: mockAIInsights.filter((i) => i.severity === 'medium').length,
    low: mockAIInsights.filter((i) => i.severity === 'low').length,
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Insights Panel"
        description="AI-powered recommendations to improve your repositories"
        action={
          <Button variant="outline" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Regenerate Insights
          </Button>
        }
      />

      {/* Severity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-muted-foreground">High Severity</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{severityDistribution.high}</p>
          <p className="text-xs text-muted-foreground mt-2">Require immediate attention</p>
        </div>
        <div className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-sm text-muted-foreground">Medium Severity</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{severityDistribution.medium}</p>
          <p className="text-xs text-muted-foreground mt-2">Should be addressed soon</p>
        </div>
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-muted-foreground">Low Severity</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{severityDistribution.low}</p>
          <p className="text-xs text-muted-foreground mt-2">Nice to have improvements</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by severity:</span>
        </div>
        {['all', 'high', 'medium', 'low'].map((severity) => (
          <Button
            key={severity}
            variant={selectedSeverity === severity ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setSelectedSeverity(severity as 'all' | 'low' | 'medium' | 'high')
            }
            className="capitalize"
          >
            {severity === 'all' ? 'All Insights' : `${severity} Severity`}
          </Button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            {...insight}
            onQuickFix={() => console.log(`Applying quick fix for: ${insight.title}`)}
          />
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No insights found with the selected filters</p>
        </div>
      )}
    </div>
  )
}
