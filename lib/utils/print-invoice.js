function resolveElement(target) {
  if (target instanceof HTMLElement) {
    return target
  }

  if (typeof target === 'string') {
    return document.getElementById(target)
  }

  return target?.current || null
}

export function printInvoice(target) {
  const element = resolveElement(target)

  if (!element) {
    throw new Error('Invoice preview was not found')
  }

  const existingContainer = document.getElementById('invoice-print-root')
  existingContainer?.remove()

  const printContainer = document.createElement('div')
  printContainer.id = 'invoice-print-root'

  const clone = element.cloneNode(true)
  clone.id = 'invoice-print-area'
  clone.classList.add('invoice-print-area')

  printContainer.appendChild(clone)
  document.body.appendChild(printContainer)

  const cleanup = () => {
    printContainer.remove()
    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)
  window.print()

  setTimeout(cleanup, 1000)
  return true
}
