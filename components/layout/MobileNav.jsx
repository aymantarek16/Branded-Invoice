'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Building2,
  Settings,
  Menu,
  X,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/helpers'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'الفواتير', icon: FileText },
  { href: '/dashboard/clients', label: 'العملاء', icon: Users },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/brand', label: 'البراند', icon: Building2 },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
]

export function MobileNav({ user, brand }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const displayName =
    brand?.brand_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')?.[0] ||
    'حسابي'
  const avatarUrl = brand?.logo_url || user?.user_metadata?.avatar_url

  const isItemActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href
    }

    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <>
      {/* Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">فاتورتي</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/invoices/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">فاتورة جديدة</span>
            </Button>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-[min(22rem,calc(100vw-1rem))] bg-card shadow-xl"
          >
            <div className="flex h-20 items-center justify-between gap-3 border-b border-border px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-primary">{displayName?.[0]?.toUpperCase() || 'ح'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{displayName}</p>
                  {user?.email && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = isItemActive(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        </div>
      )}
    </>
  )
}
