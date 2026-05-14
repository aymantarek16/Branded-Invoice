// Invoice calculation utilities

export function calculateLineTotal(quantity, unitPrice, taxable = true, taxRate = 0) {
  const qty = parseFloat(quantity) || 0
  const price = parseFloat(unitPrice) || 0
  const base = qty * price

  if (!taxable) return base

  const rate = parseFloat(taxRate) || 0
  const tax = base * (rate / 100)

  return base + tax
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
  const value = parseFloat(discountValue) || 0
  const sub = parseFloat(subtotal) || 0

  if (type === 'percentage') {
    return (sub * value) / 100
  }

  return value
}

export function calculateTax(subtotal, discountTotal, taxRate, items = []) {
  const sub = parseFloat(subtotal) || 0
  const discount = parseFloat(discountTotal) || 0
  const rate = parseFloat(taxRate) || 0

  // Calculate taxable amount based on items if provided
  const taxableAmount = items.length > 0 ? calculateTaxableAmount(items) : sub - discount

  return taxableAmount * (rate / 100)
}

export function calculateInvoiceTotals(items, options = {}) {
  const {
    discountType = 'fixed',
    discountValue = 0,
    taxRate = 0,
    shippingTotal = 0,
  } = options

  // Calculate subtotal from items
  const subtotal = calculateSubtotal(items)

  // Discount cannot be bigger than the invoice subtotal.
  const discountTotal = Math.min(
    calculateDiscount(subtotal, discountType, discountValue),
    subtotal
  )

  // Calculate tax based on taxable items only
  const taxableAmount = calculateTaxableAmount(items)
  const afterDiscount = taxableAmount - (discountType === 'fixed' ? discountTotal : (subtotal * discountValue) / 100)
  const taxTotal = Math.max(0, afterDiscount) * (taxRate / 100)

  // Calculate grand total
  const baseTotal = Math.max(0, subtotal - discountTotal)
  const grandTotal = baseTotal + taxTotal + (parseFloat(shippingTotal) || 0)

  return {
    subtotal: roundToTwo(subtotal),
    discountTotal: roundToTwo(discountTotal),
    taxTotal: roundToTwo(taxTotal),
    shippingTotal: roundToTwo(shippingTotal),
    grandTotal: roundToTwo(grandTotal),
    taxableAmount: roundToTwo(taxableAmount),
  }
}

export function recalculateItemTotals(items, taxRate = 0) {
  return items.map((item, index) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unit_price) || 0
    const taxable = item.taxable !== false
    const lineTotal = qty * price

    let lineTaxTotal = 0
    if (taxable && taxRate > 0) {
      lineTaxTotal = lineTotal * (taxRate / 100)
    }

    return {
      ...item,
      line_total: roundToTwo(lineTotal + lineTaxTotal),
      sort_order: index,
    }
  })
}

export function roundToTwo(num) {
  return Math.round((parseFloat(num) || 0) * 100) / 100
}

export function validateInvoiceData(data) {
  const errors = []

  if (!data.client_id) {
    errors.push('Client is required')
  }

  if (!data.invoice_number) {
    errors.push('Invoice number is required')
  }

  if (!data.issue_date) {
    errors.push('Issue date is required')
  }

  if (!data.items || data.items.length === 0) {
    errors.push('At least one item is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
