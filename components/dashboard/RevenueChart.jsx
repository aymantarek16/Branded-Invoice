'use client'

import { useMemo } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatCurrency(entry.value, currency)}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function RevenueChart({ data, currency = 'EGP' }) {
  const chartData = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        name: new Intl.DateTimeFormat('ar-EG', { month: 'short' }).format(date),
        revenue: 0,
        invoices: 0,
      }
    })

    const monthMap = new Map(months.map((month) => [month.key, month]))

    ;(data || []).forEach((invoice) => {
      const invoiceDate = invoice.issue_date || invoice.created_at
      if (!invoiceDate || invoice.status !== 'paid') return

      const date = new Date(invoiceDate)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const month = monthMap.get(key)
      if (!month) return

      month.revenue += Number(invoice.grand_total) || 0
      month.invoices += 1
    })

    return months
  }, [data])

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">نظرة على الإيرادات</h3>
          <p className="text-sm text-muted-foreground">متابعة شهرية بسيطة للمدفوع</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
