'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseErrorMessage } from '@/lib/utils/supabase-errors'
import { toast } from 'sonner'

const clientSchema = z.object({
  name: z.string().min(1, 'اسم العميل مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح.').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
})

export function ClientForm({ client, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      name: '',
      email: '',
      phone: '',
      address: '',
      company_name: '',
      notes: '',
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

      if (client?.id) {
        const { error } = await supabase
          .from('clients')
          .update(data)
          .eq('id', client.id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('تم تحديث بيانات العميل.')
      } else {
        const { error } = await supabase.from('clients').insert([
          {
            ...data,
            user_id: user.id,
          },
        ])

        if (error) throw error
        toast.success('تمت إضافة العميل.')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'تعذر حفظ العميل.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم العميل *</label>
            <Input
              {...register('name')}
              placeholder="اسم العميل"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الشركة</label>
            <Input {...register('company_name')} placeholder="اسم الشركة" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">الإيميل</label>
            <Input
              {...register('email')}
              type="email"
              placeholder="اكتب البريد الإلكتروني"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الموبايل</label>
            <Input {...register('phone')} placeholder="+20 xxx xxx xxxx" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">العنوان</label>
          <Input {...register('address')} placeholder="العنوان بالكامل" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">ملاحظات</label>
          <Textarea {...register('notes')} placeholder="أي ملاحظات عن العميل..." rows={3} />
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
            ) : client?.id ? (
              'تحديث العميل'
            ) : (
              'إضافة العميل'
            )}
          </Button>
        </div>
      </motion.form>
    </AnimatePresence>
  )
}
