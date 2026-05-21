'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'

export function AgencyCreative({ invoice }) {
  const { brand, client, items, invoice: inv, currency } = invoice

  return (
    <div className="invoice-theme-agency overflow-hidden bg-white text-gray-900">
      {/* Decorative Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-2" />
        <div className="p-8 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {brand?.logo_url ? (
                <img src={brand.logo_url} alt={brand.brand_name} className="h-14 w-auto" />
              ) : (
                <div>
                  <h1 className="text-2xl font-black text-gray-900">{brand?.brand_name || 'اسم البراند'}</h1>
                  <p className="text-sm text-gray-500">فاتورة خدمات</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="bg-gray-900 text-white px-6 py-4 rounded-bl-2xl rounded-tr-2xl">
                <p className="text-xs text-gray-400 mb-1">فاتورة</p>
                <p className="text-lg font-bold">{inv?.invoice_number}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {/* Info Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">من</p>
            <p className="font-bold text-gray-900">{brand?.brand_name}</p>
            {brand?.address && <p className="text-sm text-gray-500 mt-1">{brand.address}</p>}
            {brand?.email && <p className="text-sm text-gray-500">{brand.email}</p>}
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">بيانات العميل</p>
            <p className="font-bold text-gray-900">{client?.name}</p>
            {client?.company_name && <p className="text-sm text-gray-500">{client.company_name}</p>}
            {client?.address && <p className="text-sm text-gray-500 mt-1">{client.address}</p>}
            {client?.email && <p className="text-sm text-gray-500">{client.email}</p>}
          </div>
          <div className="bg-indigo-50 rounded-2xl p-5">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">تاريخ الاستحقاق</p>
            <p className="font-bold text-gray-900 text-lg">{formatDateShort(inv?.due_date)}</p>
            <p className="text-sm text-gray-500 mt-1">الإصدار: {formatDateShort(inv?.issue_date)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="py-4 px-6 text-left text-sm font-bold">الوصف</th>
                <th className="py-4 px-4 text-center text-sm font-bold w-20">الكمية</th>
                <th className="py-4 px-4 text-right text-sm font-bold w-28">السعر</th>
                <th className="py-4 px-6 text-right text-sm font-bold w-32">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-600">{formatCurrency(item.unit_price, currency)}</td>
                  <td className="py-4 px-6 text-right font-bold text-gray-900">
                    {formatCurrency(item.line_total || (item.quantity * item.unit_price), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="bg-gray-900 text-white rounded-2xl p-6 w-80">
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(inv?.subtotal || 0, currency)}</span>
              </div>
              {inv?.discount_value > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>الخصم</span>
                  <span>-{formatCurrency(inv?.discount_total || 0, currency)}</span>
                </div>
              )}
              {inv?.tax_enabled && inv?.tax_rate > 0 && inv?.tax_total > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>ضريبة القيمة المضافة ({inv?.tax_rate}%)</span>
                  <span>{formatCurrency(inv?.tax_total || 0, currency)}</span>
                </div>
              )}
              {inv?.shipping_total > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>الشحن</span>
                  <span>{formatCurrency(inv?.shipping_total || 0, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black pt-3 border-t border-white/20">
                <span>الإجمالي النهائي</span>
                <span className="text-cyan-400">{formatCurrency(inv?.grand_total || 0, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {(inv?.notes || inv?.payment_info) && (
          <div className="mt-8 grid grid-cols-2 gap-6">
            {inv?.notes && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5">
                <h4 className="font-bold text-gray-900 mb-2">ملاحظات</h4>
                <p className="text-sm text-gray-600">{inv.notes}</p>
              </div>
            )}
            {inv?.payment_info && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5">
                <h4 className="font-bold text-gray-900 mb-2">بيانات الدفع</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{inv.payment_info}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-2 mt-auto" />
    </div>
  )
}
