export const INVOICE_STATUS_OPTIONS = [
  { value: 'draft', label: 'مسودة' },
  { value: 'sent', label: 'صادرة' },
  { value: 'paid', label: 'مدفوعة' },
  { value: 'cancelled', label: 'ملغاة' },
]

export const INVOICE_STATUS_LABELS = INVOICE_STATUS_OPTIONS.reduce((labels, status) => {
  labels[status.value] = status.label
  return labels
}, {})

export const INVOICE_ACTIVITY_LABELS = {
  created: 'تم إنشاء الفاتورة',
  updated: 'تم تعديل الفاتورة',
  issued: 'تم إصدار الفاتورة',
  marked_paid: 'تم تحويل الفاتورة إلى مدفوعة',
  cancelled: 'تم إلغاء الفاتورة',
}

export function getInvoiceStatusLabel(status) {
  return INVOICE_STATUS_LABELS[status] || INVOICE_STATUS_LABELS.draft
}

export function getInvoiceActivityLabel(action) {
  return INVOICE_ACTIVITY_LABELS[action] || action || 'حدث في الفاتورة'
}

export function getStatusActionLabel(status) {
  const labels = {
    draft: 'حفظ كمسودة',
    sent: 'إصدار الفاتورة',
    paid: 'تحديد كمدفوعة',
    cancelled: 'إلغاء الفاتورة',
  }

  return labels[status] || 'حفظ الفاتورة'
}

export function getActivityActionForStatus(status) {
  const actions = {
    sent: 'issued',
    paid: 'marked_paid',
    cancelled: 'cancelled',
  }

  return actions[status] || 'updated'
}

export function buildInvoiceLifecyclePatch(status, totals = {}, currentInvoice = {}) {
  const now = new Date().toISOString()
  const grandTotal = Number(totals.grandTotal ?? currentInvoice.grand_total) || 0

  const patch = {
    status,
    paid_amount: 0,
    remaining_amount: status === 'cancelled' ? 0 : grandTotal,
  }

  if (status === 'sent') {
    patch.issued_at = currentInvoice.issued_at || now
    patch.finalized_at = currentInvoice.finalized_at || now
    patch.paid_at = null
    patch.cancelled_at = null
  }

  if (status === 'paid') {
    patch.issued_at = currentInvoice.issued_at || now
    patch.finalized_at = currentInvoice.finalized_at || now
    patch.paid_at = now
    patch.cancelled_at = null
    patch.paid_amount = grandTotal
    patch.remaining_amount = 0
  }

  if (status === 'cancelled') {
    patch.cancelled_at = now
    patch.paid_at = null
    patch.remaining_amount = 0
  }

  if (status === 'draft') {
    patch.issued_at = null
    patch.finalized_at = null
    patch.paid_at = null
    patch.cancelled_at = null
    patch.paid_amount = 0
    patch.remaining_amount = grandTotal
  }

  return patch
}
