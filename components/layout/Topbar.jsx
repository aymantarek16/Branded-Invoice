'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Moon, Sun, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'

export function Topbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className={cn('relative transition-all duration-300', searchOpen ? 'w-64' : 'w-40')}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-background/50"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/invoices/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </Button>
        </Link>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
