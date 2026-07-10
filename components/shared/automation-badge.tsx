'use client'

import { Zap, ZapOff } from 'lucide-react'

interface AutomationBadgeProps {
  enabled: boolean
  issuesResolved?: number
  prsMerged?: number
  size?: 'sm' | 'md'
}

export function AutomationBadge({
  enabled,
  issuesResolved = 0,
  prsMerged = 0,
  size = 'md',
}: AutomationBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  if (!enabled) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 ${sizeClasses[size]}`}
      >
        <ZapOff className={iconSize[size]} />
        <span>Automation off</span>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium bg-amber-50 text-amber-700 ${sizeClasses[size]}`}
    >
      <Zap className={iconSize[size]} />
      <span>
        {issuesResolved + prsMerged > 0
          ? `${issuesResolved + prsMerged} automated`
          : 'Automation on'}
      </span>
    </div>
  )
}
