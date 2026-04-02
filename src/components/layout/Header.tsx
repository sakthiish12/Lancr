'use client'

import { Menu, Bell, Search, LogOut } from 'lucide-react'
import { useUIStore } from '@/stores/ui'
import { useTransition } from 'react'
import { signOut } from '@/app/(auth)/actions'
import { useTenantStore } from '@/stores/tenant'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar } = useUIStore()
  const tenant = useTenantStore(s => s.tenant)
  const [isPending, startTransition] = useTransition()

  const initials = tenant?.name
    ? tenant.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  function handleSignOut() {
    startTransition(async () => { await signOut() })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Search className="h-5 w-5" />
        </button>
        <button className="relative rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-600" />
        </button>
        <div className="ml-1 h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
          <span className="text-xs font-semibold text-violet-700">{initials}</span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isPending}
          title="Sign out"
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
