'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/client'
import { DashboardPageSkeleton } from '@/components/common/EmptyState'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [brand, setBrand] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: brandData } = await supabase
        .from('brand_profiles')
        .select('brand_name, logo_url')
        .eq('user_id', user.id)
        .maybeSingle()

      setBrand(brandData || null)
      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  const handleLogout = () => {
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-16 lg:pt-0 lg:pr-[280px]">
          <div className="p-4 lg:p-8">
            <DashboardPageSkeleton />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        user={user}
        brand={brand}
        onLogout={handleLogout}
      />
      <MobileNav user={user} brand={brand} />

      <main
        className="min-w-0 overflow-x-hidden pt-16 lg:pt-0 lg:pr-[280px]"
      >
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
