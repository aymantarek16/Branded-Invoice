'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder'
import { FormPageSkeleton } from '@/components/common/EmptyState'
import { useDashboard } from '@/components/dashboard/DashboardContext'

export default function EditInvoicePage() {
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [clients, setClients] = useState([])
  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const { user, brand: dashboardBrand } = useDashboard()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return

        const [
          { data: invoiceData, error: invoiceError },
          { data: itemsData },
          { data: clientsData },
          { data: productsData },
        ] = await Promise.all([
          supabase
            .from('invoices')
            .select('*')
            .eq('id', params.id)
            .single(),
          supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', params.id)
            .order('sort_order'),
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

        if (invoiceError) throw invoiceError

        if (invoiceData) {
          invoiceData.items = itemsData || []
        }

        setInvoice(invoiceData)
        setBrand(dashboardBrand || {
          brand_name: '',
          default_currency: 'EGP',
        })
        setClients(clientsData || [])
        setProducts(productsData || [])
      } catch {
        router.push('/dashboard/invoices')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dashboardBrand, params.id, router, supabase, user])

  if (loading) {
    return <FormPageSkeleton />
  }

  return (
    <div>
      <InvoiceBuilder
        invoice={invoice}
        clients={clients}
        brand={brand}
        products={products}
        user={user}
      />
    </div>
  )
}
