'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CURRENCY_LIST } from '@/lib/utils/currency'

const brandSchema = z.object({
  brand_name: z.string().min(1, 'اسم البراند مطلوب'),
  logo_url: z.string().nullable().optional(),
  email: z.string().email('الإيميل مش صحيح').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional(),
  default_currency: z.string().default('EGP'),
  default_notes: z.string().optional(),
  default_terms: z.string().optional(),
  payment_info: z.string().optional(),
})

export function BrandSettingsForm({ brand, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: brand || {
      brand_name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      tax_number: '',
      logo_url: null,
      default_currency: 'EGP',
      default_notes: '',
      default_terms: '',
      payment_info: '',
    },
  })

  const logoUrl = watch('logo_url')
  const currency = watch('default_currency')

  const getLogoPathFromUrl = useCallback((url) => {
    if (!url) return null
    const marker = '/brand-assets/'
    const markerIndex = url.indexOf(marker)
    if (markerIndex === -1) return null
    return decodeURIComponent(url.slice(markerIndex + marker.length).split('?')[0])
  }, [])

  const handleLogoUpload = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('ارفع صورة بس')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة لازم يبقى أقل من ٢ ميجا')
      return
    }

    setUploading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) throw new Error('لازم تسجل دخول الأول')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath)

      setValue('logo_url', publicData.publicUrl)
      toast.success('اللوجو اترفع')
    } catch (error) {
      toast.error(error.message || 'معرفناش نرفع اللوجو')
    } finally {
      setUploading(false)
    }
  }, [supabase, setValue])

  const handleRemoveLogo = useCallback(async () => {
    if (!logoUrl) return

    try {
      const filePath = getLogoPathFromUrl(logoUrl)
      if (filePath) {
        await supabase.storage.from('brand-assets').remove([filePath])
      }
      setValue('logo_url', null)
      toast.success('اللوجو اتمسح')
    } catch (error) {
      toast.error('معرفناش نمسح اللوجو')
    }
  }, [getLogoPathFromUrl, logoUrl, supabase, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (brand?.id) {
        const { data: savedBrand, error } = await supabase
          .from('brand_profiles')
          .update(data)
          .eq('id', brand.id)
          .select()
          .single()

        if (error) throw error
        toast.success('بيانات البراند اتحدثت')
        onSuccess?.(savedBrand)
      } else {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) throw new Error('لازم تسجل دخول الأول')

        const { data: savedBrand, error } = await supabase.from('brand_profiles').insert([
          {
            ...data,
            user_id: user.id,
          },
        ]).select().single()

        if (error) throw error
        toast.success('بيانات البراند اتعملت')
        onSuccess?.(savedBrand)
      }
    } catch (error) {
      toast.error(error.message || 'معرفناش نحفظ بيانات البراند')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">لوجو البراند</label>
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <div className="relative">
              <img
                src={logoUrl}
                alt="لوجو البراند"
                className="w-32 h-32 object-contain rounded-xl border border-border bg-white p-2"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center cursor-pointer">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">رفع</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
          <div className="text-sm text-muted-foreground">
            <p>ارفع لوجو البراند</p>
            <p className="text-xs mt-1">PNG أو JPG لحد ٢ ميجا</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">اسم البراند *</label>
          <Input
            {...register('brand_name')}
            placeholder="اسم شركتك أو مشروعك"
            className={errors.brand_name ? 'border-red-500' : ''}
          />
          {errors.brand_name && (
            <p className="text-sm text-red-500 mt-1">{errors.brand_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">الإيميل</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="اكتب البريد الإلكتروني"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">الموبايل</label>
          <Input {...register('phone')} placeholder="+20 xxx xxx xxxx" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">الموقع</label>
          <Input {...register('website')} placeholder="رابط الموقع" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">العنوان</label>
        <Input {...register('address')} placeholder="عنوان الشركة بالكامل" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">الرقم الضريبي / التجاري</label>
        <Input {...register('tax_number')} placeholder="الرقم الضريبي" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">العملة الافتراضية</label>
        <Select
          value={currency}
          onValueChange={(value) => setValue('default_currency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_LIST.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} - {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Default Invoice Settings */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4">إعدادات الفاتورة الافتراضية</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">ملاحظات افتراضية</label>
            <Textarea
              {...register('default_notes')}
              placeholder="ملاحظات تظهر في كل الفواتير..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الشروط والأحكام</label>
            <Textarea
              {...register('default_terms')}
              placeholder="الشروط والأحكام..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">بيانات الدفع</label>
            <Textarea
              {...register('payment_info')}
              placeholder="بيانات البنك، رقم المحفظة، إنستاباي..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'حفظ بيانات البراند'
          )}
        </Button>
      </div>
    </form>
  )
}
