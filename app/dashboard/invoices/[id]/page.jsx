'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Ban, CheckCircle2, Copy, Download, Edit, FileCheck2, FileText, Image, Printer, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormPageSkeleton } from '@/components/common/EmptyState'
import { InvoicePreview } from '@/components/invoices/InvoicePreview'
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { exportToPDF, generatePDFFilename } from '@/lib/utils/export-pdf'
import { exportToPNG, generatePNGFilename } from '@/lib/utils/export-png'
import { calculateTotalsFromInvoice } from '@/lib/utils/invoice-calculations'
import { getNextInvoiceNumber } from '@/lib/utils/invoice-number'
import {
  buildInvoiceLifecyclePatch,
  getActivityActionForStatus,
  getInvoiceActivityLabel,
  getInvoiceStatusLabel,
  getStatusActionLabel,
} from '@/lib/utils/invoice-status'
import { printInvoice } from '@/lib/utils/print-invoice'
import { toast } from 'sonner'

function formatActivityDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function InvoiceViewPage() {
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [brand, setBrand] = useState(null)
  const [client, setClient] = useState(null)
  const [activityLogs, setActivityLogs] = useState([])
  const [exporting, setExporting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(null)
  const previewRef = useRef(null)
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const [
          { data: invoiceData, error: invoiceError },
          { data: itemsData, error: itemsError },
        ] = await Promise.all([
          supabase
            .from('invoices')
            .select('*')
            .eq('id', params.id)
            .single(),
          supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', params.id)
            .order('sort_order'),
        ])

        if (invoiceError) throw invoiceError
        if (!invoiceData) {
          router.push('/dashboard/invoices')
          return
        }

        if (itemsError) throw itemsError

        setInvoice(invoiceData)
        setItems(itemsData || [])
        setBrand(invoiceData.brand_snapshot || { brand_name: '', default_currency: 'EGP' })
        setClient(invoiceData.client_snapshot)

        const { data: logsData } = await supabase
          .from('invoice_activity_logs')
          .select('*')
          .eq('invoice_id', params.id)
          .order('created_at', { ascending: false })

        setActivityLogs(logsData || [])
      } catch {
        router.push('/dashboard/invoices')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchInvoice()
    }
  }, [params.id, router, supabase])

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const filename = generatePDFFilename(invoice.invoice_number, client?.name)
      await exportToPDF(previewRef, filename)
      toast.success('تم تصدير PDF')
    } catch (error) {
      toast.error(error.message || 'تعذر تصدير PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPNG = async () => {
    setExporting(true)
    try {
      const filename = generatePNGFilename(invoice.invoice_number, client?.name)
      await exportToPNG(previewRef, filename)
      toast.success('تم تصدير PNG')
    } catch (error) {
      toast.error(error.message || 'تعذر تصدير PNG')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    try {
      printInvoice(previewRef)
    } catch (error) {
      toast.error(error.message || 'تعذر طباعة الفاتورة')
    }
  }

  const logInvoiceActivity = async (nextStatus, action, note) => {
    const { error } = await supabase
      .from('invoice_activity_logs')
      .insert([{
        invoice_id: invoice.id,
        user_id: invoice.user_id,
        action,
        old_status: invoice.status,
        new_status: nextStatus,
        note,
      }])

    if (error) {
      console.warn('Invoice activity log failed:', error.message)
    }
  }

  const handleStatusChange = async (nextStatus) => {
    if (!invoice || nextStatus === invoice.status) return

    setStatusUpdating(nextStatus)
    try {
      const totals = calculateTotalsFromInvoice(invoice, items)
      const patch = buildInvoiceLifecyclePatch(nextStatus, totals, invoice)

      const { data: updatedInvoice, error } = await supabase
        .from('invoices')
        .update(patch)
        .eq('id', invoice.id)
        .select()
        .single()

      if (error) throw error

      const action = getActivityActionForStatus(nextStatus)
      await logInvoiceActivity(nextStatus, action, getStatusActionLabel(nextStatus))

      const newLog = {
        id: `local-${Date.now()}`,
        invoice_id: invoice.id,
        user_id: invoice.user_id,
        action,
        old_status: invoice.status,
        new_status: nextStatus,
        note: getStatusActionLabel(nextStatus),
        created_at: new Date().toISOString(),
      }

      setInvoice(updatedInvoice)
      setActivityLogs((current) => [newLog, ...current])
      toast.success('تم تحديث حالة الفاتورة.')
    } catch (error) {
      toast.error(error.message || 'تعذر تحديث حالة الفاتورة.')
    } finally {
      setStatusUpdating(null)
    }
  }

  const handleDuplicate = async () => {
    try {
      const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { id, created_at, updated_at, issued_at, finalized_at, paid_at, cancelled_at, ...invoiceCopy } = invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceCopy,
          invoice_number: getNextInvoiceNumber(lastInvoice?.invoice_number),
          status: 'draft',
          issued_at: null,
          finalized_at: null,
          paid_at: null,
          cancelled_at: null,
          paid_amount: 0,
          remaining_amount: Number(invoice.grand_total) || 0,
        }])
        .select()
        .single()

      if (error) throw error

      if (items?.length) {
        const copiedItems = items.map((item, index) => ({
          invoice_id: newInvoice.id,
          user_id: item.user_id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable,
          line_total: item.line_total,
          sort_order: index,
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(copiedItems)

        if (itemsError) throw itemsError
      }

      await supabase.from('invoice_activity_logs').insert([{
        invoice_id: newInvoice.id,
        user_id: newInvoice.user_id,
        action: 'created',
        new_status: 'draft',
        note: 'تم إنشاء الفاتورة كنسخة من فاتورة أخرى.',
      }])

      toast.success('تم إنشاء نسخة جديدة كمسودة.')
      router.push(`/dashboard/invoices/${newInvoice.id}`)
    } catch (error) {
      toast.error(error.message || 'تعذر نسخ الفاتورة')
    }
  }

  if (loading) {
    return <FormPageSkeleton />
  }

  if (!invoice) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-muted-foreground">
              تاريخ الإصدار {formatDateShort(invoice.issue_date)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleStatusChange('draft')}
            disabled={Boolean(statusUpdating) || invoice.status === 'draft'}
          >
            <RotateCcw className="h-4 w-4" />
            حفظ كمسودة
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleStatusChange('sent')}
            disabled={Boolean(statusUpdating) || invoice.status === 'sent'}
          >
            <FileCheck2 className="h-4 w-4" />
            إصدار الفاتورة
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={() => handleStatusChange('paid')}
            disabled={Boolean(statusUpdating) || invoice.status === 'paid'}
          >
            <CheckCircle2 className="h-4 w-4" />
            تحديد كمدفوعة
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-red-500/40 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => handleStatusChange('cancelled')}
            disabled={Boolean(statusUpdating) || invoice.status === 'cancelled'}
          >
            <Ban className="h-4 w-4" />
            إلغاء الفاتورة
          </Button>
          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            نسخ
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2" disabled={exporting}>
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPNG}>
                <Image className="mr-2 h-4 w-4" />
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                طباعة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <InvoicePreview
            ref={previewRef}
            invoice={invoice}
            brand={brand}
            client={client}
            items={items}
            selectedTheme={invoice.selected_theme || 'classic-professional'}
            zoom={80}
          />
        </div>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 font-semibold">تفاصيل الفاتورة</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">رقم الفاتورة</span>
                <span className="font-medium">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">الحالة</span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">تاريخ الإصدار</span>
                <span className="font-medium">{formatDateShort(invoice.issue_date)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">تاريخ الاستحقاق</span>
                <span className="font-medium">{formatDateShort(invoice.due_date)}</span>
              </div>
              {invoice.issued_at && (
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">تاريخ الإصدار الفعلي</span>
                  <span className="font-medium">{formatDateShort(invoice.issued_at)}</span>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">تاريخ الدفع</span>
                  <span className="font-medium">{formatDateShort(invoice.paid_at)}</span>
                </div>
              )}
              {invoice.cancelled_at && (
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">تاريخ الإلغاء</span>
                  <span className="font-medium">{formatDateShort(invoice.cancelled_at)}</span>
                </div>
              )}
              {invoice.tax_enabled && Number(invoice.tax_total) > 0 && (
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">ضريبة القيمة المضافة</span>
                  <span className="font-medium">{formatCurrency(invoice.tax_total || 0, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">المدفوع</span>
                <span className="font-medium">{formatCurrency(invoice.paid_amount || 0, invoice.currency)}</span>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <span className="text-muted-foreground">المتبقي</span>
                <span className="font-medium">{formatCurrency(invoice.remaining_amount || 0, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">الإجمالي</span>
                <span className="text-xl font-bold">
                  {formatCurrency(invoice.grand_total || 0, invoice.currency)}
                </span>
              </div>
            </div>
          </motion.div>

          {client && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="mb-4 font-semibold">العميل</h3>
              <div className="space-y-2">
                <p className="font-medium">{client.name}</p>
                {client.company_name && <p className="text-sm text-muted-foreground">{client.company_name}</p>}
                {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
                {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
                {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 font-semibold">سجل الفاتورة</h3>
            {activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-border bg-background/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{getInvoiceActivityLabel(log.action)}</p>
                      <span className="text-xs text-muted-foreground">{formatActivityDate(log.created_at)}</span>
                    </div>
                    {(log.old_status || log.new_status) && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {log.old_status ? getInvoiceStatusLabel(log.old_status) : 'بداية السجل'}
                        {' '}←{' '}
                        {log.new_status ? getInvoiceStatusLabel(log.new_status) : '-'}
                      </p>
                    )}
                    {log.note && (
                      <p className="mt-2 text-sm text-muted-foreground">{log.note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد أحداث مسجلة لهذه الفاتورة حتى الآن.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
