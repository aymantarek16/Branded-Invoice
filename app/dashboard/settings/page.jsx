'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Monitor, Globe, CreditCard, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormPageSkeleton } from '@/components/common/EmptyState'
import { CURRENCY_LIST } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const THEMES = [
  { value: 'light', label: 'فاتح', icon: Sun },
  { value: 'dark', label: 'غامق', icon: Moon },
  { value: 'system', label: 'حسب الجهاز', icon: Monitor },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية المصرية' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState('en')
  const [defaultCurrency, setDefaultCurrency] = useState('EGP')
  const [pageLoading, setPageLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load settings from localStorage
        const savedLanguage = localStorage.getItem('language') || 'en'
        setLanguage(savedLanguage)

        // Fetch brand to get default currency
        const { data: brand } = await supabase
          .from('brand_profiles')
          .select('default_currency')
          .eq('user_id', user.id)
          .single()

        if (brand?.default_currency) {
          setDefaultCurrency(brand.default_currency)
        }
      } catch {
      } finally {
        setPageLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleLanguageChange = (value) => {
    setLanguage(value)
    localStorage.setItem('language', value)
    toast.success('اللغة اتحدثت')
  }

  const handleCurrencyChange = async (value) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: brand } = await supabase
        .from('brand_profiles')
        .select('id, brand_name, email')
        .eq('user_id', user.id)
        .maybeSingle()

      if (brand) {
        const { error } = await supabase
          .from('brand_profiles')
          .update({ default_currency: value })
          .eq('id', brand.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('brand_profiles')
          .insert([{
            user_id: user.id,
            brand_name: user.user_metadata?.full_name || user.email || 'براند جديد',
            email: user.email,
            default_currency: value,
          }])
        if (error) throw error
      }

      setDefaultCurrency(value)
      toast.success('العملة الافتراضية اتحدثت')
    } catch (error) {
      toast.error('معرفناش نحدّث العملة')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (pageLoading) {
    return <FormPageSkeleton />
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground">ظبط تفضيلاتك بسرعة</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            الشكل
          </CardTitle>
          <CardDescription>اختار شكل الداشبورد المريح ليك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">الثيم</Label>
            <div className="flex gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === t.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            اللغة
          </CardTitle>
          <CardDescription>اختار لغة الواجهة</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            العملة الافتراضية
          </CardTitle>
          <CardDescription>العملة اللي هتظهر تلقائيًا في الفواتير الجديدة</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={defaultCurrency} onValueChange={handleCurrencyChange} disabled={loading}>
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
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>الحساب</CardTitle>
          <CardDescription>إدارة حسابك الحالي</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="gap-2 text-red-500 hover:text-red-500 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
