'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BrandSettingsForm } from '@/components/brand/BrandSettingsForm'
import { FormPageSkeleton } from '@/components/common/EmptyState'
import { useDashboard } from '@/components/dashboard/DashboardContext'

export default function BrandPage() {
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState(null)
  const { user, brand: dashboardBrand, setBrand: setDashboardBrand } = useDashboard()

  useEffect(() => {
    setBrand(
      dashboardBrand || {
        user_id: user?.id,
        brand_name: '',
        default_currency: 'EGP',
      }
    )
    setLoading(false)
  }, [dashboardBrand, user?.id])

  const handleSuccess = (savedBrand) => {
    if (!savedBrand) return
    setBrand(savedBrand)
    setDashboardBrand(savedBrand)
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
