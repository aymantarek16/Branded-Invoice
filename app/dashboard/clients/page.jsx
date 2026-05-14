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
import { ClientsTable } from '@/components/clients/ClientsTable'
import { ClientForm } from '@/components/clients/ClientForm'
import { EmptyState, ListPageSkeleton } from '@/components/common/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseErrorMessage } from '@/lib/utils/supabase-errors'
import { toast } from 'sonner'

export default function ClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('لازم تسجل دخول الأول')

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error, 'معرفناش نجيب العملاء'))
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.company_name?.toLowerCase().includes(query)
    )
  })

  const handleAddClient = () => {
    setEditingClient(null)
    setDialogOpen(true)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    setDialogOpen(false)
    setEditingClient(null)
    fetchClients()
  }

  if (loading) {
    return <ListPageSkeleton rows={6} columns={5} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">العملاء</h1>
          <p className="text-muted-foreground">كل بيانات عملاءك في مكان واحد</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleAddClient}>
              <Plus className="w-4 h-4" />
              إضافة عميل
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'تعديل عميل' : 'إضافة عميل جديد'}
              </DialogTitle>
            </DialogHeader>
            <ClientForm
              client={editingClient}
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
          placeholder="دور على عميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Table */}
      {clients.length === 0 ? (
        <EmptyState
          icon="users"
          title="لسه مفيش عملاء"
          description="ضيف أول عميل عشان تبدأ تعمل فواتير أسرع"
          actionLabel="إضافة عميل"
          onAction={handleAddClient}
        />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon="users"
          title="مفيش نتائج"
          description="جرّب كلمة بحث مختلفة"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ClientsTable
            clients={filteredClients}
            onRefresh={fetchClients}
            onEdit={handleEditClient}
          />
        </motion.div>
      )}
    </div>
  )
}
