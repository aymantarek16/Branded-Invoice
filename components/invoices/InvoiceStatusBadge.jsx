"use client"

import * as React from 'react'
import { cn } from '@/lib/utils/helpers'
import { getInvoiceStatusLabel } from '@/lib/utils/invoice-status'

export function InvoiceStatusBadge({ status, className }) {
  const statusConfig = {
    draft: {
      label: getInvoiceStatusLabel('draft'),
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    sent: {
      label: getInvoiceStatusLabel('sent'),
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    paid: {
      label: getInvoiceStatusLabel('paid'),
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    cancelled: {
      label: getInvoiceStatusLabel('cancelled'),
      className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
    },
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
