// Invoice number generation utilities

export function generateInvoiceNumber(year, sequence) {
  const paddedSequence = String(sequence).padStart(4, '0')
  return `INV-${year}-${paddedSequence}`
}

export function getNextInvoiceNumber(lastInvoiceNumber) {
  const currentYear = new Date().getFullYear()

  if (!lastInvoiceNumber) {
    return generateInvoiceNumber(currentYear, 1)
  }

  // Try to extract year and sequence from existing number
  const match = lastInvoiceNumber.match(/INV-(\d{4})-(\d+)/)

  if (match) {
    const [, year, seqStr] = match
    const yearNum = parseInt(year, 10)
    const sequence = parseInt(seqStr, 10) + 1

    // If year changed, reset sequence
    if (yearNum !== currentYear) {
      return generateInvoiceNumber(currentYear, 1)
    }

    return generateInvoiceNumber(yearNum, sequence)
  }

  // Fallback: create new number with current year
  return generateInvoiceNumber(currentYear, 1)
}

export function parseInvoiceNumber(invoiceNumber) {
  if (!invoiceNumber) return null

  const match = invoiceNumber.match(/INV-(\d{4})-(\d+)/)

  if (match) {
    return {
      year: parseInt(match[1], 10),
      sequence: parseInt(match[2], 10),
    }
  }

  return null
}

export function isValidInvoiceNumber(invoiceNumber) {
  if (!invoiceNumber) return false
  return /INV-\d{4}-\d{4}/.test(invoiceNumber) || /^[A-Z0-9-]+$/.test(invoiceNumber)
}
