// PDF Export utility
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

export async function exportToPDF(target, filename = 'invoice.pdf', options = {}) {
  const {
    scale = 2,
    margin = 10,
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

    const pageWidth = 210
    const pageHeight = 297
    const renderWidth = pageWidth - margin * 2
    const renderHeight = (canvas.height * renderWidth) / canvas.width

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png')

    // Handle multi-page if content is longer than one page
    let heightLeft = renderHeight
    let position = margin

    // First page
    pdf.addImage(imgData, 'PNG', margin, position, renderWidth, renderHeight)
    heightLeft -= pageHeight

    // Additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - renderHeight + margin
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, position, renderWidth, renderHeight)
      heightLeft -= pageHeight
    }

    // Save the PDF
    pdf.save(filename)

    return true
  } catch (error) {
    throw error
  }
}

export function generatePDFFilename(invoiceNumber, clientName) {
  const safeInvoiceNum = (invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9-]/g, '')
  const safeClientName = (clientName || 'client').replace(/[^a-zA-Z0-9]/g, '_')
  return `invoice-${safeInvoiceNum}-${safeClientName}.pdf`
}
