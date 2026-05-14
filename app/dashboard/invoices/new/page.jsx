'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder'
import { FormPageSkeleton } from '@/components/common/EmptyState'

export default function NewInvoicePage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [brand, setBrand] = useState(null)
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        // Fetch brand profile
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
        setBrand({ brand_name: '', default_currency: 'EGP' })
        setClients([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

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
