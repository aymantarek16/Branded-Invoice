'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BrandSettingsForm } from '@/components/brand/BrandSettingsForm'
import { FormPageSkeleton } from '@/components/common/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function BrandPage() {
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setBrand(data || { user_id: user.id, brand_name: '', default_currency: 'EGP' })
      } catch {
        setBrand({ brand_name: '', default_currency: 'EGP' })
      } finally {
        setLoading(false)
      }
    }

    fetchBrand()
  }, [supabase])

  const handleSuccess = () => {
    toast.success('بيانات البراند اتحفظت')
    // Refresh brand data
    window.location.reload()
  }

  if (loading) {
    return <FormPageSkeleton />
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">البراند</h1>
        <p className="text-muted-foreground">ظبط اسم شركتك، اللوجو، وبيانات الفواتير الافتراضية</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <BrandSettingsForm brand={brand} onSuccess={handleSuccess} />
      </motion.div>
    </div>
  )
}
