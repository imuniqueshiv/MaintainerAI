'use client'

import { AlertCircle, AlertTriangle, Minus } from 'lucide-react'

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high'
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = {
    low: { label: 'Low', color: 'bg-blue-50 text-blue-700', icon: Minus },
    medium: { label: 'Medium', color: 'bg-yellow-50 text-yellow-700', icon: AlertTriangle },
    high: { label: 'High', color: 'bg-red-50 text-red-700', icon: AlertCircle },
  }

  const { label, color, icon: Icon } = config[priority]
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium ${color} ${sizeClasses}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
