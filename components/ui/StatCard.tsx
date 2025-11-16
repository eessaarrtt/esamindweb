import { type ReactNode } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

type StatCardProps = {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  trend?: 'up' | 'down'
  className?: string
}

export function StatCard({ title, value, change, icon, trend, className = '' }: StatCardProps) {
  return (
    <div className={`bg-card border border-card-border rounded-lg p-6 hover:shadow-md transition-all hover:border-accent/30 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted font-medium">{title}</p>
        {icon && <div className="text-accent">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {change !== undefined && trend && (
          <span className={`text-sm flex items-center gap-1 ${
            trend === 'up' ? 'text-success' : 'text-error'
          }`}>
            {trend === 'up' ? (
              <ArrowUpIcon width={14} height={14} />
            ) : (
              <ArrowDownIcon width={14} height={14} />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  )
}

