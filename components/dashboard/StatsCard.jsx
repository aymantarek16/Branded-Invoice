'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { formatCurrency } from '@/lib/utils/currency'

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  format = 'number',
  currency = 'EGP',
  className = '',
}) {
  const isPositive = change > 0
  const isNegative = change < 0

  const displayValue = () => {
    if (format === 'currency') {
      return formatCurrency(Number(value) || 0, currency)
    }
    if (format === 'percentage') {
      return `${value}%`
    }
    return (Number(value) || 0).toLocaleString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositive && 'text-green-500',
              isNegative && 'text-red-500',
              !isPositive && !isNegative && 'text-gray-500'
            )}
          >
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{displayValue()}</p>
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  )
}
