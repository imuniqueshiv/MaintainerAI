'use client'

import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'

interface HealthBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function HealthBadge({ score, size = 'md' }: HealthBadgeProps) {
  const getHealth = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 70) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 50) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const health = getHealth(score)
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium ${health.bg} ${health.color} ${sizeClasses[size]}`}
    >
      {score >= 70 ? (
        <CheckCircle2 className={iconSize[size]} />
      ) : score >= 50 ? (
        <TrendingUp className={iconSize[size]} />
      ) : (
        <AlertCircle className={iconSize[size]} />
      )}
      <span>{health.label}</span>
      {size !== 'sm' && <span className="ml-1">({score}%)</span>}
    </div>
  )
}
