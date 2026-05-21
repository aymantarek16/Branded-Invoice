'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Edit, Copy, FileWarning } from 'lucide-react'

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'تأكيد الإجراء',
  description = 'هل أنت متأكد من متابعة هذا الإجراء؟ لا يمكن التراجع عنه بعد التأكيد.',
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  variant = 'default',
  loading = false,
}) {
  const icons = {
    warning: AlertTriangle,
    delete: Trash2,
    edit: Edit,
    duplicate: Copy,
    default: FileWarning,
  }

  const IconComponent = icons[variant] || AlertTriangle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="space-y-0 border-b border-border px-6 pb-5 pt-6 text-right">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
              <IconComponent className="h-7 w-7 text-destructive" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-black leading-tight">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-7 text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-start sm:space-x-0">
          <Button
            variant={variant === 'delete' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
            className="h-11 min-w-28 px-6 font-bold"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-11 min-w-28 px-6 font-bold"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteConfirmDialog({ open, onOpenChange, itemName, onDelete, loading }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف العنصر"
      description={`هل أنت متأكد من حذف "${itemName || 'هذا العنصر'}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      variant="delete"
      onConfirm={onDelete}
      loading={loading}
    />
  )
}

export function DuplicateConfirmDialog({ open, onOpenChange, invoiceNumber, onDuplicate, loading }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="نسخ الفاتورة"
      description={`هل تريد إنشاء نسخة جديدة من الفاتورة ${invoiceNumber}؟`}
      confirmLabel="نسخ"
      cancelLabel="إلغاء"
      variant="duplicate"
      onConfirm={onDuplicate}
      loading={loading}
    />
  )
}
