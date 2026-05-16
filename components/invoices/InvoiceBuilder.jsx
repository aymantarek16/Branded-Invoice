'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InvoiceItemsEditor } from './InvoiceItemsEditor'
import { InvoiceTotals } from './InvoiceTotals'
import { InvoiceThemeSelector } from './InvoiceThemeSelector'
import { InvoicePreview } from './InvoicePreview'
import { InvoiceForm } from './InvoiceForm'
import { createClient } from '@/lib/supabase/client'
import { calculateInvoiceTotals } from '@/lib/utils/invoice-calculations'
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
    tax_rate: invoice?.tax_rate || 0,
    shipping_total: invoice?.shipping_total || 0,
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
    return calculateInvoiceTotals(items, {
      discountType: formData.discount_type,
      discountValue: formData.discount_value,
      taxRate: formData.tax_rate,
      shippingTotal: formData.shipping_total,
    })
  }, [items, formData.discount_type, formData.discount_value, formData.tax_rate, formData.shipping_total])

  const previewInvoice = useMemo(() => ({
    ...formData,
    subtotal: totals.subtotal,
    discount_total: totals.discountTotal,
    tax_total: totals.taxTotal,
    shipping_total: totals.shippingTotal,
    grand_total: totals.grandTotal,
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

  const saveInvoice = async (status = 'draft') => {
    setLoading(true)
    try {
      if (!user?.id) {
        throw new Error('لازم تسجل دخول الأول')
      }

      const normalizedClientData = clientData?.name?.trim()
        ? { ...clientData, name: clientData.name.trim() }
        : null
      const normalizedItems = items
        .filter((item) => item?.name?.trim() || Number(item?.unit_price) > 0)
        .map((item, index) => {
          const quantity = Number(item.quantity) || 1
          const unitPrice = Number(item.unit_price) || 0

          return {
            name: item.name?.trim() || 'بند',
            description: item.description || '',
            quantity,
            unit_price: unitPrice,
            taxable: item.taxable !== false,
            line_total: quantity * unitPrice,
            sort_order: index,
          }
        })

      if (!formData.invoice_number?.trim()) {
        throw new Error('رقم الفاتورة مطلوب')
      }

      if (!normalizedClientData?.name) {
        throw new Error('اسم العميل مطلوب')
      }

      if (normalizedItems.length === 0) {
        throw new Error('ضيف بند واحد على الأقل في الفاتورة')
      }

      const invoiceData = {
        ...formData,
        invoice_number: formData.invoice_number.trim(),
        client_id: formData.client_id || null,
        user_id: user.id,
        status,
        subtotal: totals.subtotal,
        discount_total: totals.discountTotal,
        tax_total: totals.taxTotal,
        shipping_total: totals.shippingTotal,
        grand_total: totals.grandTotal,
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

        // Update items
        const { error: deleteItemsError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id)

        if (deleteItemsError) throw deleteItemsError

        if (normalizedItems.length > 0) {
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

        toast.success('الفاتورة اتحدثت')
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

        toast.success('الفاتورة اتعملت')
        router.push(`/dashboard/invoices/${newInvoice.id}`)
      }
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'معرفناش نحفظ الفاتورة'))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = () => saveInvoice('draft')
  const handleSaveAndSend = () => saveInvoice('sent')

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
          <InvoiceForm
            formData={formData}
            onChange={updateFormData}
            clients={clients}
            brand={brandData}
            client={clientData}
            onBrandChange={updateBrandData}
            onClientChange={updateClientData}
            onSelectClient={selectSavedClient}
          />

          <InvoiceItemsEditor
            items={items}
            onChange={setItems}
            products={products}
            currency={formData.currency}
          />

          <InvoiceTotals
            totals={totals}
            currency={formData.currency}
            discountType={formData.discount_type}
            discountValue={formData.discount_value}
            taxRate={formData.tax_rate}
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
              onClick={handleSaveAndSend}
              disabled={loading}
              className="h-12 gap-2"
            >
              <Send className="h-4 w-4" />
              حفظ كمبعتة
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
