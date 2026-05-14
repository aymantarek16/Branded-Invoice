'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Edit,
  Trash2,
  Copy,
  Tag,
} from 'lucide-react'
import { DeleteConfirmDialog } from '@/components/common/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseErrorMessage } from '@/lib/utils/supabase-errors'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/currency'

export function ProductsTable({ products, onRefresh, onEdit }) {
  const [deleteDialog, setDeleteDialog] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteDialog) return
    setDeleting(true)

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteDialog.id)

      if (error) throw error

      toast.success('المنتج اتمسح')
      setDeleteDialog(null)
      onRefresh?.()
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'معرفناش نمسح المنتج'))
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (product) => {
    try {
      const { error } = await supabase.from('products').insert([
        {
          name: `${product.name} - نسخة`,
          description: product.description,
          category: product.category,
          price: product.price,
          currency: product.currency,
          user_id: product.user_id,
        },
      ])

      if (error) throw error

      toast.success('المنتج اتنسخ')
      onRefresh?.()
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'معرفناش ننسخ المنتج'))
    }
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Tag className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">لسه مفيش منتجات</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-3 lg:hidden">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{product.name}</p>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                )}
              </div>
              <p className="shrink-0 font-bold">
                {formatCurrency(product.price || 0, product.currency || 'EGP')}
              </p>
            </div>

            {product.category && (
              <span className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {product.category}
              </span>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(product)}
                title="تعديل"
                aria-label="تعديل المنتج"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(product)}
                title="نسخ"
                aria-label="نسخ المنتج"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteDialog(product)}
                title="حذف"
                aria-label="حذف المنتج"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/15"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl shadow-black/10 lg:block">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="w-[46%] px-6 py-4 text-right text-xs font-bold text-muted-foreground">المنتج</th>
              <th className="w-[20%] px-6 py-4 text-right text-xs font-bold text-muted-foreground">التصنيف</th>
              <th className="w-[18%] px-6 py-4 text-right text-xs font-bold text-muted-foreground">السعر</th>
              <th className="w-[16%] px-6 py-4 text-left text-xs font-bold text-muted-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {products.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group transition-colors hover:bg-white/[0.035]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Tag className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{product.name}</p>
                    {product.description && (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {product.category ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-black">
                    {formatCurrency(product.price || 0, product.currency || 'EGP')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit?.(product)}
                      title="تعديل"
                      aria-label="تعديل المنتج"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(product)}
                      title="نسخ"
                      aria-label="نسخ المنتج"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-colors hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteDialog(product)}
                      title="حذف"
                      aria-label="حذف المنتج"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/5 text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        itemName={deleteDialog?.name}
        onDelete={handleDelete}
        loading={deleting}
      />
    </>
  )
}
