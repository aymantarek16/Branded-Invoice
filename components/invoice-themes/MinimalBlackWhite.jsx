'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'

export function MinimalBlackWhite({ invoice }) {
  const { brand, client, items, invoice: inv, currency } = invoice

  return (
    <div className="invoice-theme-minimal bg-white p-8 text-black font-light">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          {brand?.logo_url ? (
            <img src={brand.logo_url} alt={brand.brand_name} className="h-12 w-auto" />
          ) : (
            <h1 className="text-xl font-light tracking-tight">{brand?.brand_name || 'اسم البراند'}</h1>
          )}
        </div>
        <div className="text-right">
          <p className="text-5xl font-thin tracking-tight uppercase">Invoice</p>
          <p className="text-sm mt-2">{inv?.invoice_number}</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">From</p>
          <div className="text-sm space-y-1">
            <p>{brand?.brand_name}</p>
            {brand?.address && <p className="text-gray-600">{brand.address}</p>}
            {brand?.email && <p className="text-gray-600">{brand.email}</p>}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
          <div className="text-sm space-y-1">
            <p>{client?.name}</p>
            {client?.company_name && <p className="text-gray-600">{client.company_name}</p>}
            {client?.address && <p className="text-gray-600">{client.address}</p>}
            {client?.email && <p className="text-gray-600">{client.email}</p>}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Date</p>
          <p className="text-sm">{formatDateShort(inv?.issue_date)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Due Date</p>
          <p className="text-sm">{formatDateShort(inv?.due_date)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="py-3 text-left text-xs uppercase tracking-widest font-medium">Item</th>
              <th className="py-3 text-center text-xs uppercase tracking-widest font-medium w-20">Qty</th>
              <th className="py-3 text-right text-xs uppercase tracking-widest font-medium w-28">Price</th>
              <th className="py-3 text-right text-xs uppercase tracking-widest font-medium w-28">Total</th>
            </tr>
          </thead>
          <tbody className="border-b border-black">
            {items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-4 text-sm">
                  <p>{item.name}</p>
                  {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                </td>
                <td className="py-4 text-sm text-center">{item.quantity}</td>
                <td className="py-4 text-sm text-right">{formatCurrency(item.unit_price, currency)}</td>
                <td className="py-4 text-sm text-right">{formatCurrency(item.line_total || (item.quantity * item.unit_price), currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm py-2 border-b border-gray-200">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(inv?.subtotal || 0, currency)}</span>
          </div>
          {inv?.discount_value > 0 && (
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-500">Discount</span>
              <span>-{formatCurrency(inv?.discount_total || 0, currency)}</span>
            </div>
          )}
          {inv?.tax_rate > 0 && (
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-500">Tax ({inv?.tax_rate}%)</span>
              <span>{formatCurrency(inv?.tax_total || 0, currency)}</span>
            </div>
          )}
          {inv?.shipping_total > 0 && (
            <div className="flex justify-between text-sm py-2 border-b border-gray-200">
              <span className="text-gray-500">Shipping</span>
              <span>{formatCurrency(inv?.shipping_total || 0, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-medium py-3 border-t-2 border-black">
            <span>Total</span>
            <span>{formatCurrency(inv?.grand_total || 0, currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(inv?.notes || inv?.terms || inv?.payment_info) && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-8 text-sm">
            {inv?.notes && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Notes</p>
                <p className="text-gray-600">{inv.notes}</p>
              </div>
            )}
            {(inv?.terms || inv?.payment_info) && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Payment</p>
                <p className="text-gray-600 whitespace-pre-wrap">{inv?.payment_info}{inv?.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
