'use client'

import { Card, CardContent } from '@/components/ui/card'

interface HealthMetricProps {
  label: string
  value: number | string
  unit?: string
  trend?: { value: number; isPositive: boolean }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export function HealthMetric({ label, value, unit, trend, color = 'blue' }: HealthMetricProps) {
  const colorMap = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
  }

  return (
    <Card className="border border-border">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
            {unit && <span className="text-muted-foreground text-sm">{unit}</span>}
          </div>
          {trend && (
            <div className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}% from last check
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
