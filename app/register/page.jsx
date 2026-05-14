'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, FileText, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function getRegisterErrorMessage(error) {
  if (error?.message === 'Failed to fetch' || error instanceof TypeError) {
    return 'مش قادرين نوصل لـ Supabase. اتأكد إن رابط Supabase والمفتاح صح، واعمل Refresh للصفحة.'
  }

  return error?.message || 'معرفناش نعمل الحساب'
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('الباسوردين مش زي بعض')
      return
    }

    if (formData.password.length < 6) {
      toast.error('الباسورد لازم يبقى ٦ حروف على الأقل')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      })

      if (error) throw error

      if (!data.session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (loginError) throw loginError
      }

      toast.success('تم إنشاء الحساب')
      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(getRegisterErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#071018] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 text-slate-950">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl font-black">فاتورتي</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black">حساب جديد</h1>
          <p className="mt-3 text-slate-400">اكتب بياناتك وابدأ استخدام الداشبورد.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="full_name">الاسم</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="اسمك أو اسم البراند"
                className="mt-2 h-14 rounded-2xl"
              />
            </div>

            <div>
              <Label htmlFor="email">الإيميل</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="اكتب البريد الإلكتروني"
                required
                className="mt-2 h-14 rounded-2xl"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="password">الباسورد</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="h-14 rounded-2xl pl-12"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? 'إخفاء الباسورد' : 'إظهار الباسورد'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد الباسورد</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="mt-2 h-14 rounded-2xl"
                dir="ltr"
              />
            </div>

            <Button type="submit" className="h-14 w-full rounded-2xl bg-lime-300 text-base font-black text-slate-950 hover:bg-lime-200" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'إنشاء الحساب'}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            عندك حساب؟{' '}
            <Link href="/login" className="inline-flex items-center gap-1 font-black text-lime-200 hover:underline">
              سجل دخول
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
