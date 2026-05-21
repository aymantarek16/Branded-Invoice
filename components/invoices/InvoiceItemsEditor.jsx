'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, Search, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { calculateLineTotal } from '@/lib/utils/invoice-calculations'
import { formatCurrency } from '@/lib/utils/currency'

const currencyLabels = {
  EGP: 'ج.م',
  USD: '$',
  EUR: 'يورو',
  SAR: 'ر.س',
  AED: 'د.إ',
}

function createEmptyItem() {
  return {
    id: `temp-${Date.now()}`,
    product_id: null,
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    taxable: true,
    line_total: 0,
  }
}

function normalizeSearchValue(value) {
  return (value || '').toString().trim().toLowerCase()
}

function getProductSearchText(product) {
  return [
    product?.name,
    product?.description,
    product?.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function ProductNameInput({
  products = [],
  value = '',
  selectedProductId,
  currency,
  onChange,
  onSelectProduct,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const query = normalizeSearchValue(value)

  const filteredProducts = useMemo(() => {
    if (!products.length) return []
    if (!query) return products.slice(0, 6)

    return products
      .filter((product) => getProductSearchText(product).includes(query))
      .slice(0, 6)
  }, [products, query])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleSelect = (product) => {
    if (disabled) return
    onSelectProduct?.(product)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => {
          if (disabled) return
          onChange?.(event.target.value)
          setOpen(true)
        }}
        onFocus={() => !disabled && setOpen(true)}
        placeholder="اكتب اسم المنتج أو الخدمة"
        className="h-12 pr-11 pl-20 font-bold"
        autoComplete="off"
        disabled={disabled}
      />

      <div className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="مسح اسم المنتج"
            title="مسح اسم المنتج"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {selectedProductId && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">
            محفوظ
          </span>
        )}
      </div>

      {open && !disabled && products.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
          {filteredProducts.length > 0 ? (
            <div className="max-h-72 overflow-auto p-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-right transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{product.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {formatCurrency(product.price || 0, product.currency || currency)}
                    </span>
                  </span>
                  {product.id === selectedProductId && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              اكتب المنتج يدويًا
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function InvoiceItemsEditor({
  items,
  onChange,
  products = [],
  currency = 'EGP',
  disabled = false,
  taxEnabled = false,
}) {
  const initializedRef = useRef(false)
  const currencyLabel = currencyLabels[currency] || currency

  useEffect(() => {
    if (initializedRef.current) return

    initializedRef.current = true
    if (items.length === 0) {
      onChange([createEmptyItem()])
    }
  }, [items.length, onChange])

  const addItem = () => {
    if (disabled) return
    onChange([...items, createEmptyItem()])
  }

  const updateItem = (index, field, value) => {
    if (disabled) return
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'name') {
      newItems[index].product_id = null
    }

    const item = newItems[index]
    newItems[index].line_total = calculateLineTotal(item.quantity, item.unit_price)

    onChange(newItems)
  }

  const selectProductForItem = (index, product) => {
    if (disabled) return
    const newItems = [...items]
    const quantity = parseFloat(newItems[index]?.quantity) || 1
    const unitPrice = Number(product.price) || 0

    newItems[index] = {
      ...newItems[index],
      product_id: product.id,
      name: product.name || '',
      description: product.description || '',
      quantity,
      unit_price: unitPrice,
      line_total: calculateLineTotal(quantity, unitPrice),
    }

    onChange(newItems)
  }

  const removeItem = (index) => {
    if (disabled) return
    onChange(items.filter((_, i) => i !== index))
  }

  const toggleTaxable = (index) => {
    if (disabled || !taxEnabled) return
    const newItems = [...items]
    newItems[index].taxable = !newItems[index].taxable
    onChange(newItems)
  }

  return (
    <div dir="rtl" className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black">بنود الفاتورة</h3>
        <Button type="button" onClick={addItem} disabled={disabled} className="h-11 gap-2 whitespace-nowrap px-5">
          <Plus className="h-4 w-4" />
          بند جديد
        </Button>
      </div>

      {disabled && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm font-medium text-amber-700 dark:text-amber-200">
          هذه الفاتورة مدفوعة. تعديل البنود قد يؤثر على السجلات المالية.
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <button
            type="button"
            onClick={addItem}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            إضافة بند
          </button>
        ) : (
          items.map((item, index) => {
            const lineTotal = item.line_total || calculateLineTotal(item.quantity, item.unit_price)

            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-border bg-background/55 p-3 sm:p-4"
              >
                <div className="grid gap-3">
                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground">اسم المنتج أو الخدمة</span>
                    <ProductNameInput
                      products={products}
                      value={item.name || ''}
                      selectedProductId={item.product_id}
                      currency={currency}
                      onChange={(value) => updateItem(index, 'name', value)}
                      onSelectProduct={(product) => selectProductForItem(index, product)}
                      disabled={disabled}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground">وصف مختصر</span>
                    <Input
                      value={item.description || ''}
                      onChange={(event) => updateItem(index, 'description', event.target.value)}
                      placeholder="وصف اختياري للبند"
                      className="h-11"
                      disabled={disabled}
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="space-y-1.5">
                      <span className="text-xs font-bold text-muted-foreground">الكمية</span>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                        className="h-11 text-center font-bold"
                        disabled={disabled}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-bold text-muted-foreground">السعر</span>
                      <div className="relative" dir="ltr">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(event) => updateItem(index, 'unit_price', event.target.value)}
                          placeholder="0.00"
                          className="h-11 pr-14 text-left font-bold"
                          dir="ltr"
                          disabled={disabled}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">
                          {currencyLabel}
                        </span>
                      </div>
                    </label>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-muted-foreground">الإجمالي</span>
                      <div className="flex h-11 items-center rounded-xl border border-primary/20 bg-primary/10 px-4 text-sm font-black text-primary">
                        {formatCurrency(lineTotal, currency)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTaxable(index)}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition-colors ${
                      taxEnabled && item.taxable
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    aria-label={taxEnabled ? (item.taxable ? 'خاضع للضريبة' : 'غير خاضع للضريبة') : 'الضريبة غير مفعلة'}
                    title={taxEnabled ? (item.taxable ? 'خاضع للضريبة' : 'غير خاضع للضريبة') : 'الضريبة غير مفعلة'}
                    disabled={disabled || !taxEnabled}
                  >
                    {item.taxable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    {taxEnabled ? (item.taxable ? 'خاضع للضريبة' : 'غير خاضع للضريبة') : 'الضريبة غير مفعلة'}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-500/10"
                    aria-label="حذف البند"
                    title="حذف البند"
                    disabled={disabled}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
