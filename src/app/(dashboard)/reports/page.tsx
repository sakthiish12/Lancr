import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { PageHeader } from '@/components/layout/PageHeader'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { isPro } from '@/lib/plan'
import { ProGate } from '@/components/ProGate'
import type { Currency } from '@/types'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CATEGORY_LABELS: Record<string, string> = {
  software: 'Software', equipment: 'Equipment', travel: 'Travel',
  meals: 'Meals', marketing: 'Marketing', office: 'Office',
  professional: 'Professional', other: 'Other',
}

function getLast12Months(): { year: number; month: number; label: string }[] {
  const months = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` })
  }
  return months
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase.from('tenants').select('currency, plan').eq('id', user.id).single()
  const currency: Currency = (tenant?.currency as Currency) ?? 'SGD'

  if (!isPro(tenant?.plan)) {
    return (
      <div>
        <Header title="Reports" />
        <div className="p-6">
          <ProGate feature="Reports & P&L" description="See your revenue trends, profit & loss, tax summary, and top clients — all in one place." />
        </div>
      </div>
    )
  }

  const thisYear = new Date().getFullYear()
  const thisMonth = new Date().getMonth() + 1

  // Fetch all paid invoices this year
  const [invoicesRes, expensesRes, clientsRes] = await Promise.all([
    supabase.from('invoices').select('total_cents, tax_cents, subtotal_cents, paid_at, client_id, client:clients(name, company), currency').eq('tenant_id', user.id).eq('status', 'paid').gte('paid_at', `${thisYear}-01-01`).order('paid_at'),
    supabase.from('expenses').select('amount_cents, category, date, currency').eq('tenant_id', user.id).gte('date', `${thisYear}-01-01`).order('date'),
    supabase.from('clients').select('id, name, company').eq('tenant_id', user.id),
  ])

  const invoices = invoicesRes.data ?? []
  const expenses = expensesRes.data ?? []

  // Monthly revenue breakdown
  const months = getLast12Months()
  const monthlyRevenue = months.map(m => {
    const revenue = invoices
      .filter(inv => {
        if (!inv.paid_at) return false
        const d = new Date(inv.paid_at)
        return d.getFullYear() === m.year && d.getMonth() + 1 === m.month
      })
      .reduce((s, inv) => s + (inv.total_cents ?? 0), 0)
    const spent = expenses
      .filter(exp => {
        const d = new Date(exp.date)
        return d.getFullYear() === m.year && d.getMonth() + 1 === m.month
      })
      .reduce((s, exp) => s + (exp.amount_cents ?? 0), 0)
    return { ...m, revenue, spent }
  })

  const maxVal = Math.max(...monthlyRevenue.map(m => Math.max(m.revenue, m.spent)), 1)

  // YTD totals
  const ytdRevenue = invoices.reduce((s, i) => s + i.total_cents, 0)
  const ytdExpenses = expenses.reduce((s, e) => s + e.amount_cents, 0)
  const ytdTax = invoices.reduce((s, i) => s + i.tax_cents, 0)
  const ytdNet = ytdRevenue - ytdExpenses

  // This month
  const thisMonthRevenue = invoices.filter(i => {
    if (!i.paid_at) return false
    const d = new Date(i.paid_at)
    return d.getFullYear() === thisYear && d.getMonth() + 1 === thisMonth
  }).reduce((s, i) => s + i.total_cents, 0)

  // Top clients
  const clientRevenue: Record<string, { name: string; revenue: number }> = {}
  for (const inv of invoices) {
    const clientId = inv.client_id
    const clientName = (inv.client as unknown as { name: string; company: string | null } | null)?.company
      || (inv.client as unknown as { name: string } | null)?.name
      || 'Unknown'
    if (!clientRevenue[clientId]) clientRevenue[clientId] = { name: clientName, revenue: 0 }
    clientRevenue[clientId].revenue += inv.total_cents
  }
  const topClients = Object.values(clientRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  // Expenses by category
  const expenseByCategory: Record<string, number> = {}
  for (const exp of expenses) {
    expenseByCategory[exp.category] = (expenseByCategory[exp.category] ?? 0) + exp.amount_cents
  }
  const expenseCategories = Object.entries(expenseByCategory)
    .map(([cat, total]) => ({ label: CATEGORY_LABELS[cat] ?? cat, total }))
    .sort((a, b) => b.total - a.total)

  return (
    <div>
      <Header title="Reports" />
      <div className="p-6 space-y-8">
        <PageHeader
          title="Reports"
          description={`Financial overview for ${thisYear}`}
        />

        {/* YTD Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'YTD Revenue', value: formatCurrency(ytdRevenue, currency), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'YTD Expenses', value: formatCurrency(ytdExpenses, currency), icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Net Profit', value: formatCurrency(ytdNet, currency), icon: DollarSign, color: ytdNet >= 0 ? 'text-violet-600' : 'text-red-600', bg: 'bg-violet-50' },
            { label: 'Tax Collected', value: formatCurrency(ytdTax, currency), icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                </div>
                <div className={`rounded-lg p-2 ${m.bg}`}>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue vs Expenses Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-900">Revenue vs Expenses (12 months)</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" /> Expenses</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {monthlyRevenue.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                <div className="w-full flex items-end gap-0.5 h-40">
                  <div
                    className="flex-1 bg-violet-200 hover:bg-violet-400 rounded-t transition-colors relative"
                    style={{ height: `${Math.max((m.revenue / maxVal) * 100, m.revenue > 0 ? 2 : 0)}%` }}
                  >
                    {m.revenue > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                        {formatCurrency(m.revenue, currency)}
                      </div>
                    )}
                  </div>
                  <div
                    className="flex-1 bg-red-200 hover:bg-red-400 rounded-t transition-colors relative"
                    style={{ height: `${Math.max((m.spent / maxVal) * 100, m.spent > 0 ? 2 : 0)}%` }}
                  >
                    {m.spent > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                        -{formatCurrency(m.spent, currency)}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate w-full text-center">
                  {m.label.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Clients */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Top Clients by Revenue</h2>
            </div>
            {topClients.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No paid invoices yet this year</p>
            ) : (
              <div className="space-y-3">
                {topClients.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300 w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-violet-400"
                          style={{ width: `${(c.revenue / (topClients[0]?.revenue ?? 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(c.revenue, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses by Category */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Expenses by Category</h2>
            </div>
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No expenses recorded this year</p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700">{c.label}</p>
                        <p className="text-sm font-semibold text-red-600">-{formatCurrency(c.total, currency)}</p>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-red-300"
                          style={{ width: `${(c.total / (expenseCategories[0]?.total ?? 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tax Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Tax Summary — {thisYear}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Total billed</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(ytdRevenue, currency)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Tax collected</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(ytdTax, currency)}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Net (excl. tax)</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(ytdRevenue - ytdTax, currency)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Export your invoices as PDF for tax filing. Always consult an accountant for GST/SST/PPN filing requirements.
          </p>
        </div>

        {/* This month highlight */}
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-violet-900">{MONTH_NAMES[thisMonth - 1]} {thisYear} Revenue</p>
            <p className="text-2xl font-bold text-violet-700 mt-1">{formatCurrency(thisMonthRevenue, currency)}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-violet-300" />
        </div>
      </div>
    </div>
  )
}
