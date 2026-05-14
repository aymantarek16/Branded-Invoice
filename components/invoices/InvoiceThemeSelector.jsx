'use client'

import { motion } from 'framer-motion'
import { Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

const themes = [
  {
    id: 'classic-professional',
    name: 'كلاسيك',
    description: 'رسمي ومرتب',
    preview: 'bg-gray-100',
  },
  {
    id: 'modern-gradient',
    name: 'مودرن',
    description: 'عصري وشبابي',
    preview: 'bg-gradient-to-br from-indigo-500 to-purple-500',
  },
  {
    id: 'minimal-black-white',
    name: 'مينيمال',
    description: 'بسيط وواضح',
    preview: 'bg-white border border-black',
  },
  {
    id: 'agency-creative',
    name: 'وكالات',
    description: 'ألوان قوية',
    preview: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  {
    id: 'retail-receipt',
    name: 'إيصال',
    description: 'للمحلات',
    preview: 'bg-amber-100',
  },
  {
    id: 'elegant-arabic-rtl',
    name: 'عربي',
    description: 'مناسب لمصر',
    preview: 'bg-emerald-100',
  },
]

export function InvoiceThemeSelector({ selected, onChange }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-base font-black">شكل الفاتورة</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {themes.map((theme) => {
          const isSelected = selected === theme.id

          return (
            <motion.button
              key={theme.id}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onChange(theme.id)}
              className={cn(
                'relative flex min-h-[74px] items-center gap-3 rounded-xl border p-3 text-right transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-border bg-background/60 hover:border-primary/60 hover:bg-white/5'
              )}
            >
              <span className={cn('h-10 w-12 shrink-0 rounded-lg', theme.preview)} />
              <span className="min-w-0">
                <span className="block text-sm font-black">{theme.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{theme.description}</span>
              </span>

              {isSelected && (
                <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
