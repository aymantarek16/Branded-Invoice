'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder'
import { FormPageSkeleton } from '@/components/common/EmptyState'

export default function EditInvoicePage() {
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [clients, setClients] = useState([])
  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        // Fetch invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', params.id)
          .single()

        if (invoiceError) throw invoiceError
        setInvoice(invoiceData)

        // Fetch invoice items
        const { data: itemsData } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', params.id)
          .order('sort_order')

        if (invoiceData) {
          invoiceData.items = itemsData || []
        }

        // Fetch brand
        const { data: brandData } = await supabase
          .from('brand_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setBrand(brandData || {
          brand_name: '',
          default_currency: 'EGP',
        })

        // Fetch clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        setClients(clientsData || [])

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        setProducts(productsData || [])
      } catch {
        router.push('/dashboard/invoices')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase, router])

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
