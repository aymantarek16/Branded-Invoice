'use client'

import { formatCurrency } from '@/lib/utils/currency'

export function InvoiceTotals({ totals, currency = 'EGP', discountType, discountValue, taxRate }) {
  const { subtotal = 0, discountTotal = 0, taxTotal = 0, shippingTotal = 0, grandTotal = 0 } = totals

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">إجماليات الفاتورة</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-muted-foreground">الإجمالي قبل الإضافات</span>
          <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
        </div>

        {discountValue > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">
              الخصم {discountType === 'percentage' && `(${discountValue}%)`}
            </span>
            <span className="font-medium text-red-500">
              -{formatCurrency(discountTotal, currency)}
            </span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">الضريبة ({taxRate}%)</span>
            <span className="font-medium">{formatCurrency(taxTotal, currency)}</span>
          </div>
        )}

        {shippingTotal > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">الشحن</span>
            <span className="font-medium">{formatCurrency(shippingTotal, currency)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-4 bg-primary text-primary-foreground rounded-xl px-4 -mx-4 mt-4">
          <span className="text-xl font-bold">الإجمالي النهائي</span>
          <span className="text-2xl font-bold">{formatCurrency(grandTotal, currency)}</span>
        </div>
      </div>
    </div>
  )
}
