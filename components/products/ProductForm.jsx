'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseErrorMessage } from '@/lib/utils/supabase-errors'
import { toast } from 'sonner'
const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().default('EGP'),
})

export function ProductForm({ product, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: '',
      description: '',
      category: '',
      price: '',
      currency: 'EGP',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) throw new Error('يجب تسجيل الدخول أولاً.')

      const productData = {
        ...data,
        price: parseFloat(data.price) || 0,
      }

      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('تم تحديث المنتج.')
      } else {
        const { error } = await supabase.from('products').insert([
          {
            ...productData,
            user_id: user.id,
          },
        ])

        if (error) throw error
        toast.success('تمت إضافة المنتج.')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'تعذر حفظ المنتج.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">اسم المنتج أو الخدمة *</label>
        <Input
          {...register('name')}
          placeholder="مثال: تصميم لوجو"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <Textarea {...register('description')} placeholder="وصف مختصر..." rows={3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">التصنيف</label>
          <Input {...register('category')} placeholder="مثال: تصميم، صيانة، توريد" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">السعر</label>
          <Input
            {...register('price')}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : product?.id ? (
            'تحديث المنتج'
          ) : (
            'إضافة المنتج'
          )}
        </Button>
      </div>
    </form>
  )
}
