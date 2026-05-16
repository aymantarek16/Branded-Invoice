'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentInvoices } from '@/components/dashboard/RecentInvoices'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useDashboard } from '@/components/dashboard/DashboardContext'
import { DashboardPageSkeleton } from '@/components/common/EmptyState'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [invoices, setInvoices] = useState([])
  const [currency, setCurrency] = useState('EGP')
  const supabase = createClient()
  const { user, brand } = useDashboard()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return

        setCurrency(brand?.default_currency || 'EGP')

        // Fetch all invoices
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setInvoices(invoicesData || [])

        // Calculate stats
        const invoices = invoicesData || []
        const paid = invoices.filter(i => i.status === 'paid')
        const unpaid = invoices.filter(i => ['sent', 'draft'].includes(i.status))
        const overdue = invoices.filter(i => i.status === 'overdue')

        setStats({
          totalInvoices: invoices.length,
          totalRevenue: paid.reduce((sum, i) => sum + (Number(i.grand_total) || 0), 0),
          paidInvoices: paid.length,
          unpaidInvoices: unpaid.length,
          overdueInvoices: overdue.length,
        })

        setRecentInvoices(invoices.slice(0, 5))
      } catch {
        setInvoices([])
        setRecentInvoices([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [brand?.default_currency, supabase, user])

  if (loading) {
    return <DashboardPageSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">الرئيسية</h1>
          <p className="text-muted-foreground">نظرة سريعة على الفواتير والمبيعات</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            فاتورة جديدة
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="كل الفواتير"
          value={stats.totalInvoices}
          icon={FileText}
        />
        <StatsCard
          title="إجمالي المدفوع"
          value={stats.totalRevenue}
          icon={DollarSign}
          format="currency"
          currency={currency}
        />
        <StatsCard
          title="فواتير مدفوعة"
          value={stats.paidInvoices}
          icon={TrendingUp}
        />
        <StatsCard
          title="غير مدفوع"
          value={stats.unpaidInvoices + stats.overdueInvoices}
          icon={Clock}
        />
      </div>

      {/* Charts & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 lg:col-span-2">
          <RevenueChart data={invoices} currency={currency} />
        </div>
        <div className="min-w-0 lg:col-span-1">
          <RecentInvoices invoices={recentInvoices} currency={currency} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/invoices/new">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">اعمل فاتورة</h3>
                <p className="text-sm text-muted-foreground">ابدأ فاتورة جديدة</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/clients">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">العملاء</h3>
                <p className="text-sm text-muted-foreground">شوف وعدّل بيانات العملاء</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
            </div>
          </motion.div>
        </Link>

        <Link href="/dashboard/brand">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">البراند</h3>
                <p className="text-sm text-muted-foreground">ظبط بيانات شركتك</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
