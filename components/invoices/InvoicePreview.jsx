'use client'

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { ClassicProfessional } from '@/components/invoice-themes/ClassicProfessional'
import { ModernGradient } from '@/components/invoice-themes/ModernGradient'
import { MinimalBlackWhite } from '@/components/invoice-themes/MinimalBlackWhite'
import { AgencyCreative } from '@/components/invoice-themes/AgencyCreative'
import { RetailReceipt } from '@/components/invoice-themes/RetailReceipt'
import { ElegantArabicRTL } from '@/components/invoice-themes/ElegantArabicRTL'
import { calculateTotalsFromInvoice } from '@/lib/utils/invoice-calculations'

const themeComponents = {
  'classic-professional': ClassicProfessional,
  'modern-gradient': ModernGradient,
  'minimal-black-white': MinimalBlackWhite,
  'agency-creative': AgencyCreative,
  'retail-receipt': RetailReceipt,
  'elegant-arabic-rtl': ElegantArabicRTL,
}

export const InvoicePreview = forwardRef(function InvoicePreview({
  invoice,
  brand,
  client,
  items,
  selectedTheme = 'classic-professional',
  zoom = 100,
  onZoomChange,
}, ref) {
  const ThemeComponent = themeComponents[selectedTheme] || ClassicProfessional
  const containerRef = useRef(null)
  const pageRef = useRef(null)
  const [previewSize, setPreviewSize] = useState({
    width: 0,
    height: 0,
    contentHeight: 842,
  })

  const invoiceData = useMemo(() => {
    const totals = calculateTotalsFromInvoice(invoice, items)
    const taxEnabled = invoice?.tax_enabled ?? (Number(invoice?.tax_rate || invoice?.tax_total) > 0)
    const invoiceWithTotals = {
      ...invoice,
      tax_enabled: taxEnabled,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax_total: totals.taxTotal,
      shipping_total: totals.shippingTotal,
      grand_total: totals.grandTotal,
      paid_amount: invoice?.status === 'paid' ? totals.grandTotal : totals.paidAmount,
      remaining_amount: invoice?.status === 'paid' ? 0 : totals.remainingAmount,
    }

    return {
      brand,
      client,
      items,
      invoice: invoiceWithTotals,
      totals,
      currency: invoice?.currency || brand?.default_currency || 'EGP',
    }
  }, [brand, client, items, invoice])

  const setPageRefs = useCallback((node) => {
    pageRef.current = node

    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }, [ref])

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const page = pageRef.current
      if (!container || !page) return

      const containerRect = container.getBoundingClientRect()
      const nextSize = {
        width: Math.round(containerRect.width),
        height: Math.round(containerRect.height),
        contentHeight: Math.round(page.scrollHeight || 842),
      }

      setPreviewSize((current) => (
        current.width === nextSize.width &&
        current.height === nextSize.height &&
        current.contentHeight === nextSize.contentHeight
          ? current
          : nextSize
      ))
    }

    const frame = requestAnimationFrame(measure)
    const resizeObserver = new ResizeObserver(measure)

    if (containerRef.current) resizeObserver.observe(containerRef.current)
    if (pageRef.current) resizeObserver.observe(pageRef.current)
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [invoiceData, selectedTheme])

  const pageWidth = 595
  const safeWidth = Math.max(0, previewSize.width - 8)
  const safeHeight = Math.max(0, previewSize.height - 8)
  const fitScale = safeWidth && safeHeight
    ? Math.min(safeWidth / pageWidth, safeHeight / previewSize.contentHeight, 1)
    : zoom / 100
  const scale = Math.max(0.35, Math.min(zoom / 100, fitScale))
  const displayZoom = Math.round(scale * 100)

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Zoom Controls */}
      <div className="mb-3 flex items-center justify-between px-2">
        <span className="text-sm text-muted-foreground">معاينة</span>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => onZoomChange?.(Math.max(50, zoom - 25))}
            disabled={zoom <= 50}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{displayZoom}%</span>
          <button
            onClick={() => onZoomChange?.(Math.min(150, zoom + 25))}
            disabled={zoom >= 150}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div ref={containerRef} className="flex-1 overflow-hidden rounded-2xl bg-muted/30 p-2 md:p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto shadow-2xl"
          style={{
            width: `${pageWidth * scale}px`,
            height: `${previewSize.contentHeight * scale}px`,
          }}
        >
          <div
            ref={setPageRefs}
            id="invoice-print-area"
            data-invoice-export-area="true"
            className="invoice-export-area overflow-hidden rounded-lg bg-white break-words [overflow-wrap:anywhere]"
            style={{
              width: `${pageWidth}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            <ThemeComponent invoice={invoiceData} />
          </div>
        </motion.div>
      </div>
    </div>
  )
})
