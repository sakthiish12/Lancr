'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, FileSignature, Receipt,
  Users, Settings, Zap, X, ChevronRight, Target, BarChart2, CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/quotes', label: 'Quotes', icon: FileText },
  { href: '/contracts', label: 'Contracts', icon: FileSignature },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/leads', label: 'Leads', icon: Target },
  { href: '/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300',
          'lg:translate-x-0 lg:flex',
          sidebarOpen ? 'flex translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">WorkInvoice</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    {item.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 text-violet-400" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Upgrade CTAs */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <Link href="/upgrade" className="block rounded-lg bg-violet-50 p-3 hover:bg-violet-100 transition-colors">
            <p className="text-xs font-semibold text-violet-900">WorkInvoice Pro</p>
            <p className="mt-0.5 text-xs text-violet-600">Reports, expenses, leads & more</p>
            <div className="mt-2 w-full rounded-md bg-violet-600 px-3 py-1.5 text-center text-xs font-medium text-white">
              Upgrade — S$5/mo
            </div>
          </Link>
          <Link href="/org/new" className="block rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition-colors border border-gray-200">
            <p className="text-xs font-semibold text-gray-800">🏢 Agency Plan</p>
            <p className="mt-0.5 text-xs text-gray-500">Team dashboard & white-label portal</p>
            <div className="mt-2 w-full rounded-md bg-gray-800 px-3 py-1.5 text-center text-xs font-medium text-white">
              Start agency — S$49/mo
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
