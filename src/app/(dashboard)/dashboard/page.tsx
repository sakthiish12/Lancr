import { TrendingUp, FileText, Receipt, Users, ArrowUpRight, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
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

  type ActivityItem = {
    id: string
    type: 'invoice_paid' | 'invoice_sent' | 'quote_sent' | 'contract_signed'
    label: string
    sub: string
    date: string
    href: string
  }
  let recentActivity: ActivityItem[] = []

  type UpcomingItem = {
    id: string
    invoice_number: string
    client: string
    total_cents: number
    currency: Currency
    due_date: string
    status: string
  }
  let upcomingPayments: UpcomingItem[] = []

  if (user) {
    const today = new Date().toISOString().split('T')[0]

    // Auto-mark overdue invoices
    await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('tenant_id', user.id)
      .in('status', ['sent', 'viewed'])
      .lt('due_date', today)
      .not('due_date', 'is', null)

    const [paidRes, sentRes, quotesRes, clientsRes, recentInvRes, recentQuoteRes, upcomingRes] = await Promise.all([
      supabase.from('invoices').select('total_cents').eq('tenant_id', user.id).eq('status', 'paid'),
      supabase.from('invoices').select('total_cents').eq('tenant_id', user.id).in('status', ['sent', 'viewed', 'overdue']),
      supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('tenant_id', user.id).in('status', ['draft', 'sent']),
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('tenant_id', user.id),
      supabase.from('invoices').select('id, invoice_number, status, total_cents, currency, paid_at, created_at, client:clients(name)').eq('tenant_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('quotes').select('id, quote_number, status, created_at, client:clients(name)').eq('tenant_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('invoices').select('id, invoice_number, total_cents, currency, due_date, status, client:clients(name)').eq('tenant_id', user.id).in('status', ['sent', 'viewed', 'overdue']).not('due_date', 'is', null).order('due_date').limit(5),
    ])

    totalRevenueCents = (paidRes.data ?? []).reduce((s, i) => s + (i.total_cents ?? 0), 0)
    outstandingCents = (sentRes.data ?? []).reduce((s, i) => s + (i.total_cents ?? 0), 0)
    outstandingCount = sentRes.data?.length ?? 0
    activeQuotesCount = quotesRes.count ?? 0
    totalClientsCount = clientsRes.count ?? 0

    // Build activity feed
    const invActivities: ActivityItem[] = (recentInvRes.data ?? []).map(inv => ({
      id: inv.id,
      type: inv.status === 'paid' ? 'invoice_paid' : 'invoice_sent',
      label: inv.status === 'paid' ? `${inv.invoice_number} paid` : `${inv.invoice_number} created`,
      sub: (inv.client as unknown as { name: string } | null)?.name ?? 'Unknown client',
      date: inv.status === 'paid' && inv.paid_at ? inv.paid_at : inv.created_at,
      href: `/invoices/${inv.id}`,
    }))
    const quoteActivities: ActivityItem[] = (recentQuoteRes.data ?? []).map(q => ({
      id: q.id,
      type: 'quote_sent',
      label: `${q.quote_number} ${q.status}`,
      sub: (q.client as unknown as { name: string } | null)?.name ?? 'Unknown client',
      date: q.created_at,
      href: `/quotes/${q.id}`,
    }))
    recentActivity = [...invActivities, ...quoteActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)

    upcomingPayments = (upcomingRes.data ?? []).map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      client: (inv.client as unknown as { name: string } | null)?.name ?? 'Unknown',
      total_cents: inv.total_cents,
      currency: inv.currency as Currency,
      due_date: inv.due_date,
      status: inv.status,
    }))
  }

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <PageHeader title="Welcome to Lancr" description="Your freelance business command center" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenueCents, defaultCurrency), change: 'Paid invoices', icon: TrendingUp, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
            { label: 'Outstanding', value: formatCurrency(outstandingCents, defaultCurrency), change: `${outstandingCount} invoice${outstandingCount !== 1 ? 's' : ''}`, icon: Receipt, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
            { label: 'Active Quotes', value: String(activeQuotesCount), change: 'Draft & sent', icon: FileText, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
            { label: 'Total Clients', value: String(totalClientsCount), change: 'All time', icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
          ].map((metric) => {
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
              <a key={action.label} href={action.href} className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-violet-300 hover:shadow-sm transition-all">
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">{action.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <Link href="/invoices" className="text-xs text-violet-600 hover:text-violet-800">View all</Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No activity yet</p>
                <p className="mt-1 text-xs text-gray-400">Create your first quote to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <Link key={`${item.type}-${item.id}`} href={item.href} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      item.type === 'invoice_paid' ? 'bg-green-100' :
                      item.type === 'invoice_sent' ? 'bg-blue-100' : 'bg-violet-100'
                    }`}>
                      {item.type === 'invoice_paid' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                       item.type === 'invoice_sent' ? <Receipt className="h-4 w-4 text-blue-600" /> :
                       <FileText className="h-4 w-4 text-violet-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(item.date)}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Payments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Payments</h3>
              </div>
              <Link href="/invoices" className="text-xs text-violet-600 hover:text-violet-800">View all</Link>
            </div>
            {upcomingPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Receipt className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No upcoming payments</p>
                <p className="mt-1 text-xs text-gray-400">Send invoices to start collecting payments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map((inv) => {
                  const isOverdue = inv.status === 'overdue'
                  const dueDate = new Date(inv.due_date)
                  const today = new Date()
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-orange-100'}`}>
                        {isOverdue ? <AlertCircle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{inv.invoice_number} · {inv.client}</p>
                        <p className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                          {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` : daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(inv.total_cents, inv.currency)}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Reports shortcut */}
        <Link href="/reports" className="group flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 p-5 hover:bg-violet-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">View Reports</p>
              <p className="text-xs text-violet-600">Revenue trends, P&L, tax summary, top clients</p>
            </div>
          </div>
          <ArrowUpRight className="h-5 w-5 text-violet-400 group-hover:text-violet-700" />
        </Link>
      </div>
    </div>
  )
}
