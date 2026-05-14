'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { formatDateShort } from '@/lib/utils/dates'

export function ClassicProfessional({ invoice }) {
  const { brand, client, items, invoice: inv, currency } = invoice

  return (
    <div className="invoice-theme-classic bg-white p-10 text-gray-900">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          {brand?.logo_url ? (
            <img src={brand.logo_url} alt={brand.brand_name} className="h-16 w-auto mb-4" />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand?.brand_name || 'اسم البراند'}</h1>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            {brand?.address && <p>{brand.address}</p>}
            {brand?.email && <p>{brand.email}</p>}
            {brand?.phone && <p>{brand.phone}</p>}
            {brand?.website && <p>{brand.website}</p>}
            {brand?.tax_number && <p>Tax: {brand.tax_number}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">INVOICE</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-semibold">Invoice #:</span> {inv?.invoice_number}</p>
            <p><span className="font-semibold">Date:</span> {formatDateShort(inv?.issue_date)}</p>
            <p><span className="font-semibold">Due Date:</span> {formatDateShort(inv?.due_date)}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-900 pb-2">Bill To</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-900 text-base">{client?.name}</p>
          {client?.company_name && <p>{client.company_name}</p>}
          {client?.address && <p>{client.address}</p>}
          {client?.email && <p>{client.email}</p>}
          {client?.phone && <p>{client.phone}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-4 text-left text-sm font-medium">Description</th>
              <th className="py-3 px-4 text-center text-sm font-medium w-20">Qty</th>
              <th className="py-3 px-4 text-right text-sm font-medium w-28">Unit Price</th>
              <th className="py-3 px-4 text-right text-sm font-medium w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3 px-4 text-sm">
                  <p className="font-medium">{item.name}</p>
                  {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                </td>
                <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.unit_price, currency)}</td>
                <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(item.line_total || (item.quantity * item.unit_price), currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-5 flex justify-end">
        <div className="w-72">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(inv?.subtotal || 0, currency)}</span>
          </div>
          {inv?.discount_value > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">
                Discount {inv?.discount_type === 'percentage' ? `(${inv.discount_value}%)` : ''}
              </span>
              <span className="font-medium text-red-600">-{formatCurrency(inv?.discount_total || 0, currency)}</span>
            </div>
          )}
          {inv?.tax_rate > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Tax ({inv?.tax_rate}%)</span>
              <span className="font-medium">{formatCurrency(inv?.tax_total || 0, currency)}</span>
            </div>
          )}
          {inv?.shipping_total > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{formatCurrency(inv?.shipping_total || 0, currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-gray-900 text-white px-4 -mx-4 mt-2 rounded-lg">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-lg">{formatCurrency(inv?.grand_total || 0, currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(inv?.notes || inv?.terms || inv?.payment_info) && (
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200">
          {inv?.notes && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{inv.notes}</p>
            </div>
          )}
          {(inv?.terms || inv?.payment_info) && (
            <div>
              {(inv?.terms || inv?.payment_info) && (
                <>
                  <h4 className="font-bold text-gray-900 mb-2">Payment Details</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {inv?.payment_info}{inv?.payment_info && inv?.terms ? '\n\n' : ''}{inv?.terms}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}
