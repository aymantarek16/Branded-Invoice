'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Copy,
  Edit,
  Eye,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge'
import { EmptyState, ListPageSkeleton } from '@/components/common/EmptyState'
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { getNextInvoiceNumber } from '@/lib/utils/invoice-number'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'draft', label: 'مسودة' },
  { value: 'sent', label: 'مبعوتة' },
  { value: 'paid', label: 'مدفوعة' },
  { value: 'overdue', label: 'متأخرة' },
  { value: 'cancelled', label: 'ملغية' },
]

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('لازم تسجل دخول الأول')

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch {
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        invoice.invoice_number?.toLowerCase().includes(query) ||
        invoice.client_snapshot?.name?.toLowerCase().includes(query)

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [invoices, searchQuery, statusFilter])

  const visibleSummary = useMemo(() => {
    const total = filteredInvoices.reduce(
      (sum, invoice) => sum + (Number(invoice.grand_total) || 0),
      0
    )
    const paid = filteredInvoices.filter((invoice) => invoice.status === 'paid').length

    return {
      count: filteredInvoices.length,
      total,
      paid,
    }
  }, [filteredInvoices])

  const handleDelete = async () => {
    if (!deleteDialog) return
    setDeleting(true)

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', deleteDialog.id)

      if (error) throw error

      toast.success('الفاتورة اتمسحت')
      setDeleteDialog(null)
      fetchInvoices()
    } catch (error) {
      toast.error(error.message || 'معرفناش نمسح الفاتورة')
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (invoice) => {
    try {
      const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('sort_order')

      if (itemsError) throw itemsError

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

        const { error: copyItemsError } = await supabase
          .from('invoice_items')
          .insert(copiedItems)

        if (copyItemsError) throw copyItemsError
      }

      toast.success('الفاتورة اتنسخت كمسودة')
      fetchInvoices()
    } catch (error) {
      toast.error(error.message || 'معرفناش ننسخ الفاتورة')
    }
  }

  if (loading) {
    return <ListPageSkeleton rows={6} columns={6} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">الفواتير</h1>
          <p className="text-muted-foreground">كل فواتيرك، حالتها، وقيمتها</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            فاتورة جديدة
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="دور برقم الفاتورة أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon="file"
          title="مفيش فواتير"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'جرب تغير البحث أو الفلتر'
              : 'اعمل أول فاتورة وابدأ البيع بشكل محترف'
          }
          actionLabel="عمل فاتورة"
          onAction={() => router.push('/dashboard/invoices/new')}
        />
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">الفواتير المعروضة</p>
                  <p className="text-2xl font-black">{visibleSummary.count}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Eye className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">المدفوعة</p>
                  <p className="text-2xl font-black">{visibleSummary.paid}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">إجمالي المعروض</p>
                  <p className="text-xl font-black">
                    {formatCurrency(visibleSummary.total, filteredInvoices[0]?.currency || 'EGP')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:hidden">
            {filteredInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="border-b border-border bg-muted/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black">{invoice.invoice_number}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <UserRound className="h-4 w-4" />
                        <span className="truncate">{invoice.client_snapshot?.name || 'عميل غير محدد'}</span>
                      </div>
                    </div>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">الإصدار</p>
                    <p className="font-medium">{formatDateShort(invoice.issue_date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الاستحقاق</p>
                    <p className="font-medium">{formatDateShort(invoice.due_date)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">الإجمالي</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(invoice.grand_total || 0, invoice.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 border-t border-border p-3">
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    title="عرض"
                    aria-label="عرض الفاتورة"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}/edit`}
                    title="تعديل"
                    aria-label="تعديل الفاتورة"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(invoice)}
                    title="نسخ"
                    aria-label="نسخ الفاتورة"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteDialog(invoice)}
                    title="حذف"
                    aria-label="حذف الفاتورة"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl shadow-black/10 lg:block"
        >
          <div className="flex items-center justify-between border-b border-border bg-muted/25 px-6 py-4">
            <div>
              <p className="text-sm font-black">سجل الفواتير</p>
              <p className="mt-1 text-xs text-muted-foreground">إدارة، متابعة، ونسخ الفواتير من مكان واحد</p>
            </div>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-bold text-muted-foreground">
              {visibleSummary.count} نتيجة
            </span>
          </div>

          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[18%] text-right text-xs font-bold">الفاتورة</TableHead>
                <TableHead className="w-[18%] text-right text-xs font-bold">العميل</TableHead>
                <TableHead className="w-[13%] text-right text-xs font-bold">الإصدار</TableHead>
                <TableHead className="w-[13%] text-right text-xs font-bold">الاستحقاق</TableHead>
                <TableHead className="w-[12%] text-right text-xs font-bold">الحالة</TableHead>
                <TableHead className="w-[12%] text-right text-xs font-bold">الإجمالي</TableHead>
                <TableHead className="w-[14%] text-left text-xs font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/70">
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="group transition-colors hover:bg-white/[0.035]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                        <ReceiptText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-black">{invoice.invoice_number}</p>
                        <p className="mt-1 text-xs text-muted-foreground">فاتورة</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate font-medium">{invoice.client_snapshot?.name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateShort(invoice.issue_date)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateShort(invoice.due_date)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right font-black">
                    {formatCurrency(invoice.grand_total || 0, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        title="عرض"
                        aria-label="عرض الفاتورة"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        title="تعديل"
                        aria-label="تعديل الفاتورة"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(invoice)}
                        title="نسخ"
                        aria-label="نسخ الفاتورة"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-colors hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDialog(invoice)}
                        title="حذف"
                        aria-label="حذف الفاتورة"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/5 text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
        </>
      )}

      <DeleteConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        itemName={deleteDialog?.invoice_number}
        onDelete={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
