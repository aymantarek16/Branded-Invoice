'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'

export function ModernGradient({ invoice }) {
  const { brand, client, items, invoice: inv, currency } = invoice

  return (
    <div className="invoice-theme-modern bg-white text-gray-900">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            {brand?.logo_url ? (
              <img src={brand.logo_url} alt={brand.brand_name} className="h-14 w-auto brightness-0 invert mb-3" />
            ) : (
              <h1 className="text-2xl font-bold mb-1">{brand?.brand_name || 'اسم البراند'}</h1>
            )}
            <div className="text-white/80 text-sm space-y-0.5">
              {brand?.address && <p>{brand.address}</p>}
              {brand?.email && <p>{brand.email}</p>}
              {brand?.phone && <p>{brand.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black tracking-tight mb-2">فاتورة</h2>
            <p className="text-white/80">{inv?.invoice_number}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="flex justify-between px-8 py-6">
        <div className="bg-gray-50 rounded-2xl p-5 flex-1 mr-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">بيانات العميل</h3>
          <p className="font-bold text-gray-900">{client?.name}</p>
          {client?.company_name && <p className="text-gray-600 text-sm">{client.company_name}</p>}
          {client?.address && <p className="text-gray-500 text-sm">{client.address}</p>}
          {client?.email && <p className="text-gray-500 text-sm">{client.email}</p>}
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 w-48">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">تاريخ الإصدار</p>
              <p className="font-semibold text-gray-900">{formatDateShort(inv?.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">تاريخ الاستحقاق</p>
              <p className="font-semibold text-gray-900">{formatDateShort(inv?.due_date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-3 text-left text-sm font-bold text-gray-900">الوصف</th>
              <th className="py-3 text-center text-sm font-bold text-gray-900 w-16">الكمية</th>
              <th className="py-3 text-right text-sm font-bold text-gray-900 w-28">السعر</th>
              <th className="py-3 text-right text-sm font-bold text-gray-900 w-28">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 text-sm">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.description && <p className="text-gray-400 text-xs mt-1">{item.description}</p>}
                </td>
                <td className="py-4 text-sm text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 text-sm text-right text-gray-600">{formatCurrency(item.unit_price, currency)}</td>
                <td className="py-4 text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(item.line_total || (item.quantity * item.unit_price), currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-8 py-6">
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <div className="flex justify-end">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">المجموع الفرعي</span>
                <span>{formatCurrency(inv?.subtotal || 0, currency)}</span>
              </div>
              {inv?.discount_value > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>الخصم</span>
                  <span>-{formatCurrency(inv?.discount_total || 0, currency)}</span>
                </div>
              )}
              {inv?.tax_enabled && inv?.tax_rate > 0 && inv?.tax_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span>ضريبة القيمة المضافة ({inv?.tax_rate}%)</span>
                  <span>{formatCurrency(inv?.tax_total || 0, currency)}</span>
                </div>
              )}
              {inv?.shipping_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span>الشحن</span>
                  <span>{formatCurrency(inv?.shipping_total || 0, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-white/20">
                <span>الإجمالي النهائي</span>
                <span>{formatCurrency(inv?.grand_total || 0, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(inv?.notes || inv?.payment_info) && (
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
            {inv?.notes && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 mb-2">ملاحظات</h4>
                <p className="text-sm text-gray-600">{inv.notes}</p>
              </div>
            )}
            {inv?.payment_info && (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">بيانات الدفع</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{inv.payment_info}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
