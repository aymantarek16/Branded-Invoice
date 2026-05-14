'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge'

export function RecentInvoices({ invoices, currency = 'EGP' }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">آخر الفواتير</h3>
          <p className="text-sm text-muted-foreground">أحدث فواتير على حسابك</p>
        </div>
        <Link
          href="/dashboard/invoices"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          عرض الكل
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="space-y-3">
          {invoices.slice(0, 5).map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client_snapshot?.name || 'عميل غير محدد'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(invoice.grand_total || 0, invoice.currency || currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(invoice.issue_date)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">لسه مفيش فواتير</p>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
          >
            اعمل أول فاتورة
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
