'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Download, Edit, FileText, Image, Printer } from 'lucide-react'
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
import { getNextInvoiceNumber } from '@/lib/utils/invoice-number'
import { printInvoice } from '@/lib/utils/print-invoice'
import { toast } from 'sonner'

export default function InvoiceViewPage() {
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [items, setItems] = useState([])
  const [brand, setBrand] = useState(null)
  const [client, setClient] = useState(null)
  const [exporting, setExporting] = useState(false)
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
      toast.error(error.message || 'معرفناش نصدر PDF')
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
      toast.error(error.message || 'معرفناش نصدر PNG')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    try {
      printInvoice(previewRef)
    } catch (error) {
      toast.error(error.message || 'معرفناش نطبع الفاتورة')
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

      const { id, created_at, updated_at, ...invoiceCopy } = invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceCopy,
          invoice_number: getNextInvoiceNumber(lastInvoice?.invoice_number),
          status: 'draft',
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

      toast.success('اتعملت نسخة جديدة كمسودة')
      router.push(`/dashboard/invoices/${newInvoice.id}`)
    } catch (error) {
      toast.error(error.message || 'معرفناش ننسخ الفاتورة')
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
        </div>
      </div>
    </div>
  )
}
