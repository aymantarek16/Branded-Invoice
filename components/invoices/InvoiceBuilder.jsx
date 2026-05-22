'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CheckCircle2, FileCheck2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InvoiceItemsEditor } from './InvoiceItemsEditor'
import { InvoiceTotals } from './InvoiceTotals'
import { InvoiceThemeSelector } from './InvoiceThemeSelector'
import { InvoicePreview } from './InvoicePreview'
import { InvoiceForm } from './InvoiceForm'
import { createClient } from '@/lib/supabase/client'
import { calculateInvoiceTotals } from '@/lib/utils/invoice-calculations'
import {
  buildInvoiceLifecyclePatch,
  getActivityActionForStatus,
  getStatusActionLabel,
} from '@/lib/utils/invoice-status'
import { getNextInvoiceNumber } from '@/lib/utils/invoice-number'
import { getSupabaseErrorMessage } from '@/lib/utils/supabase-errors'
import { cn } from '@/lib/utils/helpers'

export function InvoiceBuilder({ invoice, clients, brand, products, user }) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const supabase = createClient()
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    client_id: invoice?.client_id || '',
    invoice_number: invoice?.invoice_number || '',
    issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date || '',
    status: invoice?.status || 'draft',
    currency: invoice?.currency || brand?.default_currency || 'EGP',
    selected_theme: invoice?.selected_theme || 'classic-professional',
    discount_type: invoice?.discount_type || 'fixed',
    discount_value: invoice?.discount_value || 0,
    tax_enabled: invoice?.tax_enabled ?? (Number(invoice?.tax_rate || invoice?.tax_total) > 0),
    tax_rate: invoice?.tax_rate || 0,
    shipping_total: invoice?.shipping_total || 0,
    paid_amount: invoice?.paid_amount || 0,
    remaining_amount: invoice?.remaining_amount || 0,
    notes: invoice?.notes || brand?.default_notes || '',
    terms: invoice?.terms || brand?.default_terms || '',
    payment_info: invoice?.payment_info || brand?.payment_info || '',
  })

  const [items, setItems] = useState(invoice?.items || [])
  const [clientData, setClientData] = useState(invoice?.client_snapshot || null)
  const [brandData, setBrandData] = useState(() => {
    const initialBrand = invoice?.brand_snapshot || brand || {}

    return {
      ...initialBrand,
      brand_name: initialBrand.brand_name || '',
      default_currency: initialBrand.default_currency || 'EGP',
    }
  })
  const financialLocked = invoice?.status === 'paid' && formData.status === 'paid'

  // Initialize invoice number
  useEffect(() => {
    if (!formData.invoice_number && !invoice) {
      // Fetch last invoice number
      const fetchLastInvoiceNumber = async () => {
        const { data } = await supabase
          .from('invoices')
          .select('invoice_number')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const nextNumber = getNextInvoiceNumber(data?.invoice_number)
        setFormData(prev => ({ ...prev, invoice_number: nextNumber }))
      }
      fetchLastInvoiceNumber()
    }
  }, [])

  // Update client data when client is selected
  useEffect(() => {
    if (formData.client_id) {
      const selectedClient = clients?.find(c => c.id === formData.client_id)
      if (selectedClient) {
        setClientData(selectedClient)
      }
    }
  }, [formData.client_id, clients])

  // Calculate totals
  const totals = useMemo(() => {
    const calculatedTotals = calculateInvoiceTotals(items, {
      discountType: formData.discount_type,
      discountValue: formData.discount_value,
      taxEnabled: formData.tax_enabled,
      taxRate: formData.tax_rate,
      shippingTotal: formData.shipping_total,
      paidAmount: formData.paid_amount,
    })

    if (formData.status === 'paid') {
      return {
        ...calculatedTotals,
        paidAmount: calculatedTotals.grandTotal,
        remainingAmount: 0,
      }
    }

    return calculatedTotals
  }, [items, formData.discount_type, formData.discount_value, formData.tax_enabled, formData.tax_rate, formData.shipping_total, formData.paid_amount, formData.status])

  const previewInvoice = useMemo(() => ({
    ...formData,
    subtotal: totals.subtotal,
    discount_total: totals.discountTotal,
    tax_total: totals.taxTotal,
    shipping_total: totals.shippingTotal,
    grand_total: totals.grandTotal,
    paid_amount: formData.status === 'paid' ? totals.grandTotal : totals.paidAmount,
    remaining_amount: formData.status === 'paid' ? 0 : totals.remainingAmount,
  }), [formData, totals])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateBrandData = (field, value) => {
    setBrandData(prev => ({ ...(prev || {}), [field]: value }))
  }

  const updateClientData = (field, value) => {
    if (field === 'name') {
      const nextName = value.trimStart()
      setClientData(nextName ? { name: nextName } : null)
      setFormData(prev => ({ ...prev, client_id: '' }))
      return
    }

    setClientData(prev => ({ ...(prev || {}), [field]: value }))
  }

  const selectSavedClient = (clientId) => {
    updateFormData('client_id', clientId)
    const selectedClient = clients?.find(client => client.id === clientId)
    setClientData(selectedClient || null)
  }

  const logInvoiceActivity = async (invoiceId, action, oldStatus, newStatus, note) => {
    if (!invoiceId || !user?.id) return

    const { error } = await supabase
      .from('invoice_activity_logs')
      .insert([{
        invoice_id: invoiceId,
        user_id: user.id,
        action,
        old_status: oldStatus || null,
        new_status: newStatus || null,
        note: note || null,
      }])

    if (error) {
      console.warn('Invoice activity log failed:', error.message)
    }
  }

  const normalizeItemsForSave = () => {
    if (!items.length) {
      throw new Error('يجب إضافة بند واحد على الأقل قبل حفظ الفاتورة.')
    }

    return items.map((item, index) => {
      const name = item.name?.trim() || ''
      const description = item.description?.trim() || ''
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unit_price)

      if (!name && !description) {
        throw new Error('يرجى إدخال اسم البند.')
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('يجب أن تكون الكمية أكبر من صفر.')
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error('سعر الوحدة لا يمكن أن يكون أقل من صفر.')
      }

      return {
        name,
        description,
        quantity,
        unit_price: unitPrice,
        taxable: item.taxable !== false,
        line_total: Number((quantity * unitPrice).toFixed(2)),
        sort_order: index,
      }
    })
  }

  const saveInvoice = async (targetStatus = formData.status || 'draft') => {
    setLoading(true)
    try {
      if (!user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً.')
      }

      const normalizedClientData = clientData?.name?.trim()
        ? { ...clientData, name: clientData.name.trim() }
        : null
      const normalizedItems = normalizeItemsForSave()
      const nextFormData = { ...formData, status: targetStatus }
      const nextTotals = targetStatus === 'paid'
        ? { ...totals, paidAmount: totals.grandTotal, remainingAmount: 0 }
        : totals
      const lifecyclePatch = buildInvoiceLifecyclePatch(targetStatus, nextTotals, invoice || {})

      if (!formData.invoice_number?.trim()) {
        throw new Error('رقم الفاتورة مطلوب.')
      }

      if (!normalizedClientData?.name) {
        throw new Error('اسم العميل مطلوب.')
      }

      if (normalizedItems.length === 0) {
        throw new Error('يجب إضافة بند واحد على الأقل قبل حفظ الفاتورة.')
      }

      const invoiceData = {
        ...nextFormData,
        invoice_number: formData.invoice_number.trim(),
        client_id: formData.client_id || null,
        user_id: user.id,
        subtotal: totals.subtotal,
        discount_total: totals.discountTotal,
        tax_total: totals.taxTotal,
        shipping_total: totals.shippingTotal,
        grand_total: totals.grandTotal,
        ...lifecyclePatch,
        client_snapshot: normalizedClientData,
        brand_snapshot: brandData,
      }

      if (invoice?.id) {
        // Update existing
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id)

        if (error) throw error

        if (invoice.status !== 'paid' || targetStatus !== 'paid') {
          const { error: deleteItemsError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', invoice.id)

          if (deleteItemsError) throw deleteItemsError

          const itemsData = normalizedItems.map((item) => ({
            invoice_id: invoice.id,
            user_id: user.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            taxable: item.taxable,
            line_total: item.line_total,
            sort_order: item.sort_order,
          }))
          const { error: itemsError } = await supabase.from('invoice_items').insert(itemsData)
          if (itemsError) throw itemsError
        }

        const statusChanged = invoice.status !== targetStatus
        await logInvoiceActivity(
          invoice.id,
          statusChanged ? getActivityActionForStatus(targetStatus) : 'updated',
          invoice.status,
          targetStatus,
          statusChanged ? getStatusActionLabel(targetStatus) : 'تم حفظ تعديلات الفاتورة.'
        )

        setFormData(prev => ({ ...prev, ...invoiceData }))
        toast.success(statusChanged ? 'تم تحديث حالة الفاتورة.' : 'تم تحديث الفاتورة.')
        router.replace(`/dashboard/invoices/${invoice.id}`)
      } else {
        // Create new
        const { data: newInvoice, error } = await supabase
          .from('invoices')
          .insert([invoiceData])
          .select()
          .single()

        if (error) throw error

        // Create items
        if (normalizedItems.length > 0) {
          const itemsData = normalizedItems.map((item) => ({
            invoice_id: newInvoice.id,
            user_id: user.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            taxable: item.taxable,
            line_total: item.line_total,
            sort_order: item.sort_order,
          }))
          const { error: itemsError } = await supabase.from('invoice_items').insert(itemsData)
          if (itemsError) throw itemsError
        }

        await logInvoiceActivity(newInvoice.id, 'created', null, targetStatus, 'تم إنشاء الفاتورة.')
        if (targetStatus !== 'draft') {
          await logInvoiceActivity(
            newInvoice.id,
            getActivityActionForStatus(targetStatus),
            'draft',
            targetStatus,
            getStatusActionLabel(targetStatus)
          )
        }

        toast.success('تم إنشاء الفاتورة.')
        router.replace(`/dashboard/invoices/${newInvoice.id}`)
      }
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'تعذر حفظ الفاتورة.'))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = () => saveInvoice('draft')
  const handleIssueInvoice = () => saveInvoice('sent')
  const handleMarkPaid = () => saveInvoice('paid')
  const handleCancelInvoice = () => saveInvoice('cancelled')

  return (
    <div className="space-y-4 xl:h-[calc(100vh-4rem)] xl:overflow-hidden xl:space-y-0">
      {/* Mobile Tabs */}
      <div className="grid grid-cols-2 gap-2 xl:hidden">
        <Button
          variant={activeTab === 'edit' ? 'default' : 'outline'}
          onClick={() => setActiveTab('edit')}
          className="h-11"
        >
          تعديل
        </Button>
        <Button
          variant={activeTab === 'preview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('preview')}
          className="h-11"
        >
          معاينة
        </Button>
      </div>

      <div className="grid gap-6 xl:h-full xl:grid-cols-[minmax(440px,640px)_minmax(520px,1fr)] xl:items-stretch">
      <section className={cn('min-w-0 space-y-5 xl:h-full xl:overflow-y-auto xl:pb-4 xl:pl-2 xl:pr-1', activeTab === 'preview' && 'hidden xl:block')}>
          {financialLocked && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold leading-7 text-amber-700 dark:text-amber-200">
              هذه الفاتورة مدفوعة. تعديل البنود أو الإجماليات قد يؤثر على السجلات المالية. يمكنك إرجاعها إلى مسودة قبل تعديل البنود.
            </div>
          )}

          <InvoiceForm
            formData={formData}
            onChange={updateFormData}
            clients={clients}
            brand={brandData}
            client={clientData}
            onBrandChange={updateBrandData}
            onClientChange={updateClientData}
            onSelectClient={selectSavedClient}
            financialLocked={financialLocked}
          />

          <InvoiceItemsEditor
            items={items}
            onChange={setItems}
            products={products}
            currency={formData.currency}
            disabled={financialLocked}
            taxEnabled={formData.tax_enabled}
          />

          <InvoiceTotals
            totals={totals}
            currency={formData.currency}
            discountType={formData.discount_type}
            discountValue={formData.discount_value}
            taxRate={formData.tax_rate}
            taxEnabled={formData.tax_enabled}
          />

          <InvoiceThemeSelector
            selected={formData.selected_theme}
            onChange={(theme) => updateFormData('selected_theme', theme)}
          />

          {/* Actions */}
          <div className="sticky bottom-3 z-20 grid gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl shadow-black/20 backdrop-blur sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
              className="h-12 gap-2"
            >
              <Save className="h-4 w-4" />
              حفظ كمسودة
            </Button>
            <Button
              onClick={handleIssueInvoice}
              disabled={loading}
              className="h-12 gap-2"
            >
              <FileCheck2 className="h-4 w-4" />
              إصدار الفاتورة
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={loading}
              className="h-12 gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
            >
              <CheckCircle2 className="h-4 w-4" />
              تحديد كمدفوعة
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelInvoice}
              disabled={loading}
              className="h-12 gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            >
              <Ban className="h-4 w-4" />
              إلغاء الفاتورة
            </Button>
          </div>
      </section>

      {/* Right Side - Preview */}
      <section className={cn('min-w-0 xl:h-full xl:overflow-hidden', activeTab === 'edit' && 'hidden xl:block')}>
        <InvoicePreview
          invoice={previewInvoice}
          brand={brandData}
          client={clientData}
          items={items}
          selectedTheme={formData.selected_theme}
          zoom={100}
        />
      </section>
      </div>
    </div>
  )
}
