'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Search, UserRound, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/helpers'

function normalizeSearchValue(value) {
  return (value || '').toString().trim().toLowerCase()
}

function getClientSearchText(client) {
  return [
    client?.name,
    client?.company_name,
    client?.email,
    client?.phone,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function ClientPicker({
  clients = [],
  value = '',
  selectedClientId = '',
  onQuickNameChange,
  onSelectClient,
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const query = normalizeSearchValue(value)

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId]
  )

  const filteredClients = useMemo(() => {
    if (!query) return clients.slice(0, 8)

    return clients
      .filter((client) => getClientSearchText(client).includes(query))
      .slice(0, 8)
  }, [clients, query])

  const hasExactMatch = useMemo(
    () => clients.some((client) => normalizeSearchValue(client.name) === query),
    [clients, query]
  )

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleInputChange = (event) => {
    onQuickNameChange?.(event.target.value)
    setOpen(true)
  }

  const handleSelectClient = (clientId) => {
    onSelectClient?.(clientId)
    setOpen(false)
  }

  const handleClear = () => {
    onQuickNameChange?.('')
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="client_name"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder="اكتب اسم العميل أو اختاره من العملاء"
          className="h-12 pr-11 pl-24"
          autoComplete="off"
        />

        <div className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="مسح اسم العميل"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {value && (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[11px] font-bold',
                selectedClientId
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {selectedClientId ? 'محفوظ' : 'سريع'}
            </span>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
          {clients.length > 0 && filteredClients.length > 0 && (
            <div className="max-h-72 overflow-auto p-1">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelectClient(client.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-right transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{client.name}</span>
                    {(client.company_name || client.email || client.phone) && (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {[client.company_name, client.email, client.phone].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                  {client.id === selectedClient?.id && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {query && !selectedClientId && !hasExactMatch && (
            <div className="border-t border-border px-4 py-3 text-sm">
              <p className="font-semibold">استخدام "{value.trim()}" كاسم سريع</p>
              <p className="mt-1 text-xs text-muted-foreground">
                الاسم هيتحفظ داخل الفاتورة فقط، ومش هيتضاف لقائمة العملاء.
              </p>
            </div>
          )}

          {clients.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              اكتب اسم العميل مباشرة. لما تضيف عملاء من قسم العملاء هيظهروا هنا.
            </div>
          )}

          {clients.length > 0 && filteredClients.length === 0 && query && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              مفيش عميل محفوظ مطابق. الاسم الحالي هيتعامل كاسم سريع.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
