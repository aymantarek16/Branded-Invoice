'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'

export function RetailReceipt({ invoice }) {
  const { brand, client, items, invoice: inv, currency } = invoice

  return (
    <div className="invoice-theme-retail bg-white p-5 font-mono text-gray-900">
      {/* Receipt Header */}
      <div className="mb-5 border-b-2 border-dashed border-gray-300 pb-5 text-center">
        {brand?.logo_url ? (
          <img src={brand.logo_url} alt={brand.brand_name} className="h-16 w-auto mx-auto mb-3" />
        ) : (
          <h1 className="text-xl font-bold tracking-widest">{brand?.brand_name || 'اسم البراند'}</h1>
        )}
        <div className="text-xs space-y-0.5">
          {brand?.address && <p>{brand.address}</p>}
          {brand?.phone && <p>الهاتف: {brand.phone}</p>}
          {brand?.email && <p>{brand.email}</p>}
          {brand?.tax_number && <p>الرقم الضريبي: {brand.tax_number}</p>}
        </div>
      </div>

      {/* Receipt Info */}
      <div className="mb-5 text-center">
        <p className="text-2xl font-bold">فاتورة</p>
        <p className="text-sm mt-1">#{inv?.invoice_number}</p>
        <div className="text-xs mt-3 space-y-0.5">
          <p>تاريخ الإصدار: {formatDateShort(inv?.issue_date)}</p>
          <p>تاريخ الاستحقاق: {formatDateShort(inv?.due_date)}</p>
        </div>
      </div>

      <div className="mb-5 border-y border-dashed border-gray-300 py-4">
        <div className="flex justify-between text-sm">
          <span>العميل: {client?.name}</span>
        </div>
        {client?.address && <p className="text-xs text-gray-500 mt-1">{client.address}</p>}
        {client?.company_name && <p className="text-xs text-gray-500">{client.company_name}</p>}
      </div>

      {/* Items */}
      <div className="mb-4 border-b border-dashed border-gray-300 pb-4">
        <div className="flex font-bold text-xs border-b border-gray-300 pb-2 mb-2">
          <span className="flex-1">البند</span>
          <span className="w-10 text-center">الكمية</span>
          <span className="w-20 text-right">السعر</span>
          <span className="w-20 text-right">الإجمالي</span>
        </div>
        {items?.map((item, index) => (
          <div key={index} className="flex text-xs py-1">
            <span className="flex-1">{item.name}</span>
            <span className="w-10 text-center">{item.quantity}</span>
            <span className="w-20 text-right">{formatCurrency(item.unit_price, currency)}</span>
            <span className="w-20 text-right">{formatCurrency(item.line_total || (item.quantity * item.unit_price), currency)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm border-b border-dashed border-gray-300 pb-4 mb-4">
        <div className="flex justify-between">
          <span>المجموع الفرعي:</span>
          <span>{formatCurrency(inv?.subtotal || 0, currency)}</span>
        </div>
        {inv?.discount_value > 0 && (
          <div className="flex justify-between text-green-600">
            <span>الخصم:</span>
            <span>-{formatCurrency(inv?.discount_total || 0, currency)}</span>
          </div>
        )}
        {inv?.tax_enabled && inv?.tax_rate > 0 && inv?.tax_total > 0 && (
          <div className="flex justify-between">
            <span>ضريبة القيمة المضافة ({inv?.tax_rate}%):</span>
            <span>{formatCurrency(inv?.tax_total || 0, currency)}</span>
          </div>
        )}
        {inv?.shipping_total > 0 && (
          <div className="flex justify-between">
            <span>الشحن:</span>
            <span>{formatCurrency(inv?.shipping_total || 0, currency)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-lg mb-6">
        <span className="text-lg font-bold">الإجمالي النهائي</span>
        <span className="text-2xl font-bold">{formatCurrency(inv?.grand_total || 0, currency)}</span>
      </div>

      {/* Payment Info */}
      {inv?.payment_info && (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4">
          <p className="text-xs font-bold mb-2">بيانات الدفع:</p>
          <p className="text-xs whitespace-pre-wrap">{inv.payment_info}</p>
        </div>
      )}

      {/* Notes */}
      {inv?.notes && (
        <div className="mb-4">
          <p className="text-xs font-bold mb-1">ملاحظات:</p>
          <p className="text-xs">{inv.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center border-t-2 border-dashed border-gray-300 pt-4">
        <p className="text-xs">شكراً لتعاملكم معنا</p>
        <p className="text-[10px] text-gray-400 mt-2">هذا النظام مخصص لتنظيم وتصميم وتصدير وطباعة الفواتير فقط، وليس نظام ربط ضريبي رسمي.</p>
      </div>
    </div>
  )
}
