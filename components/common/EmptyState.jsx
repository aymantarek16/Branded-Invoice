'use client'

import { motion } from 'framer-motion'
import { FileX, Inbox, Users, Package, Receipt, Plus } from 'lucide-react'

const icons = {
  file: FileX,
  inbox: Inbox,
  users: Users,
  package: Package,
  receipt: Receipt,
  plus: Plus,
}

export function EmptyState({
  icon = 'inbox',
  title = 'مفيش بيانات',
  description = 'ابدأ بإضافة أول عنصر.',
  actionLabel = 'إضافة جديد',
  onAction,
  className = '',
}) {
  const IconComponent = icons[icon] || Inbox

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
        <div className="relative bg-primary/10 rounded-full p-6">
          <IconComponent className="w-12 h-12 text-primary/60" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-card rounded-2xl p-6 border border-border ${className}`}>
      <div className="space-y-4">
        <div className="h-4 w-1/3 skeleton rounded" />
        <div className="h-8 w-2/3 skeleton rounded" />
        <div className="h-4 w-1/2 skeleton rounded" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 w-1/4 skeleton rounded" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 w-full skeleton rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-3">
        <div className="h-8 w-44 skeleton rounded-lg" />
        <div className="h-4 w-72 max-w-full skeleton rounded-lg" />
      </div>
      <div className="h-12 w-36 skeleton rounded-xl" />
    </div>
  )
}

export function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="h-12 flex-1 skeleton rounded-xl" />
      <div className="h-12 w-full skeleton rounded-xl sm:w-44" />
    </div>
  )
}

export function ListPageSkeleton({ rows = 6, columns = 6 }) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FiltersSkeleton />
      <SkeletonTable rows={rows} columns={columns} />
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} className="h-40" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SkeletonCard className="h-80 lg:col-span-2" />
        <SkeletonCard className="h-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} className="h-28" />
        ))}
      </div>
    </div>
  )
}

export function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard className="h-[640px]" />
        <SkeletonCard className="h-[640px]" />
      </div>
    </div>
  )
}
