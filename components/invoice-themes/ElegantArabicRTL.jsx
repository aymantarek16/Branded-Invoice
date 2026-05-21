'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'

export function ElegantArabicRTL({ invoice }) {
  const { brand, client, items, invoice: inv, currency } = invoice

  return (
    <div dir="rtl" className="invoice-theme-arabic bg-white text-gray-900">
      {/* Decorative Border */}
      <div className="m-3 border-4 border-emerald-600 p-5">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b-2 border-emerald-600 pb-5">
          <div className="text-right">
            <h2 className="text-3xl font-bold text-emerald-700 mb-2">فاتورة</h2>
            <p className="text-lg text-gray-500">Invoice</p>
          </div>
          <div>
            {brand?.logo_url ? (
              <img src={brand.logo_url} alt={brand.brand_name} className="h-16 w-auto" />
            ) : (
              <h1 className="text-2xl font-bold text-emerald-700">{brand?.brand_name || 'اسم البراند'}</h1>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div className="bg-emerald-50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-emerald-700 mb-3 border-b border-emerald-200 pb-2">بيانات المورد / From</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold">{brand?.brand_name}</p>
              {brand?.address && <p>{brand.address}</p>}
              {brand?.email && <p>{brand.email}</p>}
              {brand?.phone && <p dir="ltr">{brand.phone}</p>}
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-amber-700 mb-3 border-b border-amber-200 pb-2">بيانات العميل / Bill To</h3>
            <div className="text-sm space-y-1">
              <p className="font-bold">{client?.name}</p>
              {client?.company_name && <p>{client.company_name}</p>}
              {client?.address && <p>{client.address}</p>}
              {client?.email && <p>{client.email}</p>}
              {client?.phone && <p dir="ltr">{client.phone}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-6 flex gap-6 rounded-xl bg-gray-50 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">رقم الفاتورة</p>
            <p className="font-bold text-lg">{inv?.invoice_number}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">تاريخ الإصدار</p>
            <p className="font-bold">{formatDateShort(inv?.issue_date)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">تاريخ الاستحقاق</p>
            <p className="font-bold">{formatDateShort(inv?.due_date)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="py-3 px-4 text-right text-sm font-medium">الوصف</th>
                <th className="py-3 px-4 text-center text-sm font-medium w-20">الكمية</th>
                <th className="py-3 px-4 text-right text-sm font-medium w-28">السعر</th>
                <th className="py-3 px-4 text-right text-sm font-medium w-28">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm">
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm text-center" dir="ltr">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right" dir="ltr">{formatCurrency(item.unit_price, currency)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium" dir="ltr">
                    {formatCurrency(item.line_total || (item.quantity * item.unit_price), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-6 flex justify-start">
          <div className="w-72">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span className="font-medium" dir="ltr">{formatCurrency(inv?.subtotal || 0, currency)}</span>
            </div>
            {inv?.discount_value > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">الخصم</span>
                <span className="font-medium text-red-600" dir="ltr">-{formatCurrency(inv?.discount_total || 0, currency)}</span>
              </div>
            )}
            {inv?.tax_enabled && inv?.tax_rate > 0 && inv?.tax_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">ضريبة القيمة المضافة ({inv?.tax_rate}%)</span>
                <span className="font-medium" dir="ltr">{formatCurrency(inv?.tax_total || 0, currency)}</span>
              </div>
            )}
            {inv?.shipping_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">الشحن</span>
                <span className="font-medium" dir="ltr">{formatCurrency(inv?.shipping_total || 0, currency)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-emerald-700 text-white px-4 -mx-4 mt-2 rounded-lg">
              <span className="font-bold text-lg">الإجمالي</span>
              <span className="font-bold text-lg" dir="ltr">{formatCurrency(inv?.grand_total || 0, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Payment */}
        {(inv?.notes || inv?.terms || inv?.payment_info) && (
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200">
            {inv?.notes && (
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-bold text-amber-700 mb-2">ملاحظات / Notes</h4>
                <p className="text-sm text-gray-600">{inv.notes}</p>
              </div>
            )}
            {(inv?.terms || inv?.payment_info) && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-bold text-emerald-700 mb-2">بيانات الدفع / Payment</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap" dir="ltr">{inv?.payment_info}{inv?.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 border-t-2 border-emerald-600 pt-4 text-center">
          <p className="text-emerald-700 font-bold">شكراً لتعاملكم معنا!</p>
          <p className="text-xs text-gray-500">هذا النظام مخصص لتنظيم وتصميم وتصدير وطباعة الفواتير فقط، وليس نظام ربط ضريبي رسمي.</p>
        </div>
      </div>
    </div>
  )
}
