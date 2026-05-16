'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ProductsTable } from '@/components/products/ProductsTable'
import { ProductForm } from '@/components/products/ProductForm'
import { EmptyState, ListPageSkeleton } from '@/components/common/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { getSupabaseErrorMessage } from '@/lib/utils/supabase-errors'
import { toast } from 'sonner'

export default function ProductsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const supabase = createClient()
  const { user } = useDashboard()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      if (!user) throw new Error('لازم تسجل دخول الأول')

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'معرفناش نجيب المنتجات'))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    )
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    fetchProducts()
  }

  if (loading) {
    return <ListPageSkeleton rows={6} columns={5} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">المنتجات والخدمات</h1>
          <p className="text-muted-foreground">احفظ الخدمات والأسعار اللي بتستخدمها كتير</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleAddProduct}>
              <Plus className="w-4 h-4" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSuccess={handleSuccess}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="دور على منتج أو خدمة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <EmptyState
          icon="package"
          title="لسه مفيش منتجات"
          description="ضيف أول خدمة أو منتج عشان تختاره بسرعة في الفاتورة"
          actionLabel="إضافة منتج"
          onAction={handleAddProduct}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon="package"
          title="مفيش نتائج"
          description="جرّب كلمة بحث مختلفة"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProductsTable
            products={filteredProducts}
            onRefresh={fetchProducts}
            onEdit={handleEditProduct}
          />
        </motion.div>
      )}
    </div>
  )
}
