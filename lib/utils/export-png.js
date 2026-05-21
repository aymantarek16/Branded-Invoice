// PNG Export utility
import html2canvas from 'html2canvas'

function resolveElement(target) {
  if (target instanceof HTMLElement) {
    return target
  }

  if (typeof target === 'string') {
    return document.getElementById(target)
  }

  return target?.current || null
}

function prepareExportClone(documentClone, element) {
  const selector = element.id
    ? `#${element.id}`
    : '[data-invoice-export-area="true"]'
  const clonedElement = documentClone.querySelector(selector)

  if (!clonedElement) return

  clonedElement.style.transform = 'none'
  clonedElement.style.transformOrigin = 'top left'
  clonedElement.style.width = `${element.scrollWidth}px`
  clonedElement.style.minHeight = `${element.scrollHeight}px`
  clonedElement.style.background = '#ffffff'
  clonedElement.style.color = '#111827'
  clonedElement.style.boxShadow = 'none'
  clonedElement.style.borderRadius = '0'
}

export async function exportToPNG(target, filename = 'invoice.png', options = {}) {
  const {
    scale = 2,
    backgroundColor = '#ffffff',
  } = options

  const element = resolveElement(target)

  if (!element) {
    throw new Error('Invoice preview was not found')
  }

  try {
    // Configure canvas options
    const canvasOptions = {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (documentClone) => prepareExportClone(documentClone, element),
    }

    // Capture the element
    const canvas = await html2canvas(element, canvasOptions)

    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()

    return true
  } catch (error) {
    throw error
  }
}

export function generatePNGFilename(invoiceNumber, clientName) {
  const safeInvoiceNum = (invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9-]/g, '')
  const safeClientName = (clientName || 'client').replace(/[^a-zA-Z0-9]/g, '_')
  return `invoice-${safeInvoiceNum}-${safeClientName}.png`
}
