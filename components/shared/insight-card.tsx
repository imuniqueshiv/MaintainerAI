'use client'

import { AlertCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface InsightCardProps {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  suggestedAction: string
  quickFixAvailable: boolean
  onQuickFix?: () => void
  category: string
}

export function InsightCard({
  title,
  description,
  severity,
  confidence,
  suggestedAction,
  quickFixAvailable,
  onQuickFix,
  category,
}: InsightCardProps) {
  const severityConfig = {
    low: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: Info, color: 'text-blue-600 dark:text-blue-400' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400' },
    high: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
  }

  const config = severityConfig[severity]
  const IconComponent = config.icon

  return (
    <Card className={`border ${config.border} ${config.bg}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 mt-1 flex-shrink-0 ${config.color}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">AI Confidence:</span>
              <span className="font-medium text-foreground ml-2">{confidence}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium text-foreground ml-2 capitalize">{category}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-black/20 rounded p-3 text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Suggested Action:</span> {suggestedAction}
            </p>
          </div>

          {quickFixAvailable && (
            <Button size="sm" onClick={onQuickFix} className="w-full">
              <Lightbulb className="w-4 h-4 mr-2" />
              Apply Quick Fix
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
