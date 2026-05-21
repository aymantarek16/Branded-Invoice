'use client'

import { Input, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label, Switch } from '@/components/ui/label'
import { ClientPicker } from './ClientPicker'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { CURRENCY_LIST } from '@/lib/utils/currency'

export function InvoiceForm({
  formData,
  onChange,
  clients,
  brand,
  client,
  onBrandChange,
  onClientChange,
  onSelectClient,
  financialLocked = false,
}) {
  const handleChange = (field, value) => {
    onChange(field, value)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black">بيانات الفاتورة</h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          املأ البيانات الأساسية
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="brand_name">اسم البراند / المحل</Label>
          <Input
            id="brand_name"
            value={brand?.brand_name || ''}
            onChange={(e) => onBrandChange?.('brand_name', e.target.value)}
            placeholder="مثال: اسم المحل"
            className="mt-2 h-12"
          />
        </div>

        <div>
          <Label htmlFor="client_name">اسم العميل</Label>
          <ClientPicker
            clients={clients}
            value={client?.name || ''}
            selectedClientId={formData.client_id || ''}
            onQuickNameChange={(value) => onClientChange?.('name', value)}
            onSelectClient={onSelectClient}
            disabled={financialLocked}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="invoice_number">رقم الفاتورة</Label>
            <Input
              id="invoice_number"
              value={formData.invoice_number}
              onChange={(e) => handleChange('invoice_number', e.target.value)}
              placeholder="رقم الفاتورة"
              className="mt-2 h-12"
              dir="ltr"
              disabled={financialLocked}
            />
          </div>

          <div>
            <Label>الحالة الحالية</Label>
            <div className="mt-2 flex h-12 items-center rounded-xl border border-input bg-background px-4">
              <InvoiceStatusBadge status={formData.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="issue_date">تاريخ الإصدار</Label>
            <Input
              id="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={(e) => handleChange('issue_date', e.target.value)}
              className="mt-2 h-12"
              disabled={financialLocked}
            />
          </div>

          <div>
            <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
              className="mt-2 h-12"
              disabled={financialLocked}
            />
          </div>

          <div>
            <Label htmlFor="currency">العملة</Label>
            <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
              <SelectTrigger id="currency" className="mt-2 h-12" disabled={financialLocked}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_LIST.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <details className="rounded-2xl border border-border bg-background/40 p-4">
          <summary className="cursor-pointer select-none text-sm font-black text-primary">
            إعدادات إضافية: الخصم، الضريبة، الشحن، الملاحظات
          </summary>

          <div className="mt-5 space-y-5">
            <div className="grid gap-4 rounded-xl border border-border bg-background/50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0 space-y-1 text-right">
                <Label htmlFor="tax_enabled" className="text-sm font-bold">تفعيل الضريبة</Label>
                <p className="text-xs leading-6 text-muted-foreground">
                  عند التفعيل تظهر الضريبة في المعاينة والطباعة والتصدير.
                </p>
              </div>
              <div className="flex justify-start sm:justify-end">
                <Switch
                  id="tax_enabled"
                  checked={Boolean(formData.tax_enabled)}
                  onCheckedChange={(checked) => handleChange('tax_enabled', checked)}
                  disabled={financialLocked}
                  aria-label="تفعيل الضريبة"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="discount_type">نوع الخصم</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => handleChange('discount_type', v)}
                >
                  <SelectTrigger id="discount_type" className="mt-2 h-12" disabled={financialLocked}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">قيمة الخصم</Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => handleChange('discount_value', Number.parseFloat(e.target.value) || 0)}
                  className="mt-2 h-12"
                  disabled={financialLocked}
                />
              </div>

              <div>
                <Label htmlFor="tax_rate">نسبة الضريبة (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => handleChange('tax_rate', Number.parseFloat(e.target.value) || 0)}
                  className="mt-2 h-12"
                  disabled={financialLocked || !formData.tax_enabled}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="shipping_total">شحن / مصاريف إضافية</Label>
              <Input
                id="shipping_total"
                type="number"
                min="0"
                step="0.01"
                value={formData.shipping_total}
                onChange={(e) => handleChange('shipping_total', Number.parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-2 h-12"
                disabled={financialLocked}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="terms">الشروط والأحكام</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleChange('terms', e.target.value)}
                  placeholder="الشروط والأحكام..."
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="payment_info">بيانات الدفع</Label>
                <Textarea
                  id="payment_info"
                  value={formData.payment_info}
                  onChange={(e) => handleChange('payment_info', e.target.value)}
                  placeholder="بيانات البنك، المحفظة، إنستاباي..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
