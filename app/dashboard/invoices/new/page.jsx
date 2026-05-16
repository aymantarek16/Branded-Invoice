'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder'
import { FormPageSkeleton } from '@/components/common/EmptyState'
import { useDashboard } from '@/components/dashboard/DashboardContext'

export default function NewInvoicePage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const supabase = createClient()
  const { user, brand: dashboardBrand } = useDashboard()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return

        setBrand(dashboardBrand || {
          brand_name: '',
          default_currency: 'EGP',
        })

        const [{ data: clientsData }, { data: productsData }] = await Promise.all([
          supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .order('name'),
          supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('name'),
        ])

        setClients(clientsData || [])
        setProducts(productsData || [])
      } catch {
        setBrand({ brand_name: '', default_currency: 'EGP' })
        setClients([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dashboardBrand, supabase, user])

  if (loading) {
    return <FormPageSkeleton />
  }

  return (
    <div>
      <InvoiceBuilder
        invoice={null}
        clients={clients}
        brand={brand}
        products={products}
        user={user}
      />
    </div>
  )
}
