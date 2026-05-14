'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText,
  Edit,
  Copy,
  Trash2,
  Download,
  Printer,
  Eye,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmDialog, DuplicateConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from 'sonner'

export function InvoiceActions({
  invoice,
  onDelete,
  onDuplicate,
  onExportPDF,
  onExportPNG,
  onPrint,
}) {
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [duplicateDialog, setDuplicateDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete?.()
      setDeleteDialog(false)
    } catch (error) {
      toast.error(error.message || 'معرفناش نمسح الفاتورة')
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      await onDuplicate?.()
      setDuplicateDialog(false)
    } catch (error) {
      toast.error(error.message || 'معرفناش ننسخ الفاتورة')
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await onExportPDF?.()
    } catch (error) {
      toast.error(error.message || 'معرفناش نصدر PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleExportPNG = async () => {
    setExporting(true)
    try {
      await onExportPNG?.()
    } catch (error) {
      toast.error(error.message || 'معرفناش نصدر PNG')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = async () => {
    try {
      await onPrint?.()
    } catch (error) {
      toast.error(error.message || 'معرفناش نطبع الفاتورة')
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/dashboard/invoices/${invoice.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            عرض
          </Button>
        </Link>

        <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            تعديل
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setDuplicateDialog(true)}
        >
          <Copy className="w-4 h-4" />
          نسخ
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportPDF} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" />
              تصدير PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPNG} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" />
              تصدير PNG
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              طباعة الفاتورة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={() => setDeleteDialog(true)}
        >
          <Trash2 className="w-4 h-4" />
          حذف
        </Button>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        itemName={invoice?.invoice_number}
        onDelete={handleDelete}
        loading={deleting}
      />

      <DuplicateConfirmDialog
        open={duplicateDialog}
        onOpenChange={setDuplicateDialog}
        invoiceNumber={invoice?.invoice_number}
        onDuplicate={handleDuplicate}
        loading={false}
      />
    </>
  )
}
