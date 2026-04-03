import { TrendingUp, FileText, Receipt, Users, ArrowUpRight, Clock } from 'lucide-react'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import type { Currency } from '@/types'

const quickActions = [
  { label: 'New Quote', href: '/quotes/new', description: 'Create a proposal for a client' },
  { label: 'New Invoice', href: '/invoices/new', description: 'Bill a client for work done' },
  { label: 'New Contract', href: '/contracts/new', description: 'Draft a service agreement' },
  { label: 'Add Client', href: '/clients/new', description: 'Add a new client record' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultCurrency: Currency = 'SGD'

  let totalRevenueCents = 0
  let outstandingCents = 0
  let activeQuotesCount = 0
  let totalClientsCount = 0
  let outstandingCount = 0

  if (user) {
    const [paidRes, sentRes, quotesRes, clientsRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('total_cents')
        .eq('tenant_id', user.id)
        .eq('status', 'paid'),
      supabase
        .from('invoices')
        .select('total_cents')
        .eq('tenant_id', user.id)
        .in('status', ['sent', 'viewed', 'overdue']),
      supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .in('status', ['draft', 'sent']),
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', user.id),
    ])

    totalRevenueCents = (paidRes.data ?? []).reduce((s, i) => s + (i.total_cents ?? 0), 0)
    outstandingCents = (sentRes.data ?? []).reduce((s, i) => s + (i.total_cents ?? 0), 0)
    outstandingCount = sentRes.data?.length ?? 0
    activeQuotesCount = quotesRes.count ?? 0
    totalClientsCount = clientsRes.count ?? 0
  }

  const metrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenueCents, defaultCurrency),
      change: 'Paid invoices',
      changeType: 'neutral' as const,
      icon: TrendingUp,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(outstandingCents, defaultCurrency),
      change: `${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}`,
      changeType: 'neutral' as const,
      icon: Receipt,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Active Quotes',
      value: String(activeQuotesCount),
      change: 'Draft & sent',
      changeType: 'neutral' as const,
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Clients',
      value: String(totalClientsCount),
      change: 'All time',
      changeType: 'neutral' as const,
      icon: Users,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ]

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Welcome to Lancr"
          description="Your freelance business command center"
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{metric.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{metric.change}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${metric.iconBg}`}>
                    <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">{action.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No activity yet</p>
              <p className="mt-1 text-xs text-gray-400">Create your first quote to get started</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Payments</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Receipt className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No upcoming payments</p>
              <p className="mt-1 text-xs text-gray-400">Send invoices to start collecting payments</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
