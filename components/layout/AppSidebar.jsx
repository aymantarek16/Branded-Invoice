'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/helpers'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'الفواتير', icon: FileText },
  { href: '/dashboard/clients', label: 'العملاء', icon: Users },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/brand', label: 'البراند', icon: Building2 },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
]

export function AppSidebar({ user, brand, onLogout }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout?.()
  }

  const prefetchRoute = (href) => {
    if (href !== pathname) {
      router.prefetch(href)
    }
  }

  return (
    <aside className="fixed right-0 top-0 z-40 hidden h-screen w-[280px] flex-col border-l border-border bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link
          href="/dashboard"
          onMouseEnter={() => prefetchRoute('/dashboard')}
          onFocus={() => prefetchRoute('/dashboard')}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="truncate text-lg font-black">فاتورتي</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = isItemActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => prefetchRoute(item.href)}
              onFocus={() => prefetchRoute(item.href)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-bold">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/20">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-black text-primary">
                {displayName?.[0]?.toUpperCase() || 'ح'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black">{displayName}</p>
            {user?.email && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          <span>خروج</span>
        </button>
      </div>
    </aside>
  )
}
