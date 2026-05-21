// Invoice calculation utilities

function toNumber(value) {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

export function calculateLineTotal(quantity, unitPrice) {
  const qty = parseFloat(quantity) || 0
  const price = parseFloat(unitPrice) || 0

  return roundToTwo(qty * price)
}

export function calculateSubtotal(items) {
  if (!items || !Array.isArray(items)) return 0

  return items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unit_price) || 0
    return sum + (qty * price)
  }, 0)
}

export function calculateTaxableAmount(items) {
  if (!items || !Array.isArray(items)) return 0

  return items.reduce((sum, item) => {
    if (item.taxable !== false) {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unit_price) || 0
      return sum + (qty * price)
    }
    return sum
  }, 0)
}

export function calculateDiscount(subtotal, discountType, discountValue) {
  const type = discountType || 'fixed'
  const value = Math.max(0, toNumber(discountValue))
  const sub = Math.max(0, toNumber(subtotal))

  if (type === 'percentage') {
    return (sub * Math.min(value, 100)) / 100
  }

  return value
}

export function calculateTax(subtotal, discountTotal, taxRate, items = [], taxEnabled = true) {
  if (!taxEnabled) return 0

  const sub = Math.max(0, toNumber(subtotal))
  const discount = Math.max(0, toNumber(discountTotal))
  const rate = Math.max(0, toNumber(taxRate))
  if (rate === 0) return 0

  const taxableSubtotal = items.length > 0 ? calculateTaxableAmount(items) : sub
  const taxableDiscount = sub > 0 ? discount * (taxableSubtotal / sub) : 0
  const taxableAmount = Math.max(0, taxableSubtotal - taxableDiscount)

  return taxableAmount * (rate / 100)
}

export function calculateInvoiceTotals(items, options = {}) {
  const {
    discountType = 'fixed',
    discountValue = 0,
    taxEnabled = false,
    taxRate = 0,
    shippingTotal = 0,
    paidAmount = 0,
  } = options

  // Calculate subtotal from items
  const subtotal = roundToTwo(calculateSubtotal(items))

  // Discount cannot be bigger than the invoice subtotal.
  const discountTotal = roundToTwo(Math.min(
    calculateDiscount(subtotal, discountType, discountValue),
    subtotal
  ))

  // Calculate tax on taxable items after applying a proportional discount.
  const taxableSubtotal = roundToTwo(calculateTaxableAmount(items))
  const taxableDiscount = subtotal > 0 ? discountTotal * (taxableSubtotal / subtotal) : 0
  const taxableAmount = roundToTwo(Math.max(0, taxableSubtotal - taxableDiscount))
  const taxTotal = taxEnabled && Number(taxRate) > 0
    ? roundToTwo(taxableAmount * (Math.max(0, toNumber(taxRate)) / 100))
    : 0

  // Calculate grand total
  const baseTotal = Math.max(0, subtotal - discountTotal)
  const normalizedShippingTotal = roundToTwo(Math.max(0, toNumber(shippingTotal)))
  const grandTotal = roundToTwo(baseTotal + taxTotal + normalizedShippingTotal)
  const normalizedPaidAmount = roundToTwo(Math.min(Math.max(0, toNumber(paidAmount)), grandTotal))
  const remainingAmount = roundToTwo(Math.max(0, grandTotal - normalizedPaidAmount))

  return {
    subtotal,
    discountTotal,
    taxableAmount,
    taxTotal,
    shippingTotal: normalizedShippingTotal,
    grandTotal,
    paidAmount: normalizedPaidAmount,
    remainingAmount,
  }
}

export function calculateTotalsFromInvoice(invoice = {}, items = []) {
  return calculateInvoiceTotals(items, {
    discountType: invoice.discount_type,
    discountValue: invoice.discount_value,
    taxEnabled: invoice.tax_enabled ?? (Number(invoice.tax_rate || invoice.tax_total) > 0),
    taxRate: invoice.tax_rate,
    shippingTotal: invoice.shipping_total,
    paidAmount: invoice.status === 'paid'
      ? invoice.grand_total
      : invoice.paid_amount,
  })
}

export function shouldShowTax(invoice = {}, totals = {}) {
  const taxEnabled = invoice.tax_enabled ?? (Number(invoice.tax_rate || invoice.tax_total) > 0)
  return Boolean(taxEnabled) && Number(invoice.tax_rate) > 0 && Number(totals.taxTotal) > 0
}

export function recalculateItemTotals(items) {
  return items.map((item, index) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unit_price) || 0
    const lineTotal = qty * price

    return {
      ...item,
      line_total: roundToTwo(lineTotal),
      sort_order: index,
    }
  })
}

export function roundToTwo(num) {
  return Math.round((parseFloat(num) || 0) * 100) / 100
}

export function validateInvoiceData(data) {
  const errors = []

  if (!data.invoice_number) {
    errors.push('رقم الفاتورة مطلوب.')
  }

  if (!data.issue_date) {
    errors.push('تاريخ الإصدار مطلوب.')
  }

  if (!data.items || data.items.length === 0) {
    errors.push('يجب إضافة بند واحد على الأقل قبل حفظ الفاتورة.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
