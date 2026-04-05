import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'
import { ExpensesTable } from './ExpensesTable'
import { formatCurrency } from '@/lib/utils/currency'
import { isPro } from '@/lib/plan'
import { ProGate } from '@/components/ProGate'
import type { Expense, Currency } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  software: 'Software', equipment: 'Equipment', travel: 'Travel',
  meals: 'Meals', marketing: 'Marketing', office: 'Office',
  professional: 'Professional', other: 'Other',
}

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tenant } = await supabase.from('tenants').select('plan').eq('id', user.id).single()
  if (!isPro(tenant?.plan)) {
    return (
      <div>
        <Header title="Expenses" />
        <div className="p-6">
          <ProGate feature="Expense Tracking" description="Log business costs, track by category, and see your net profit in the Reports dashboard." />
        </div>
      </div>
    )
  }

  let expenses: Expense[] = []
  if (user) {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('tenant_id', user.id)
      .order('date', { ascending: false })
    expenses = (data ?? []) as Expense[]
  }

  const defaultCurrency: Currency = 'SGD'
  const totalThisMonth = expenses
    .filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + e.amount_cents, 0)
  const totalAllTime = expenses.reduce((s, e) => s + e.amount_cents, 0)

  const byCategory = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    label,
    total: expenses.filter(e => e.category === key).reduce((s, e) => s + e.amount_cents, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div>
      <Header title="Expenses" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Expenses"
          description="Track business costs for tax and P&L reporting"
          action={
            <Link href="/expenses/new">
              <Button><Plus className="h-4 w-4" /> Add Expense</Button>
            </Link>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalThisMonth, defaultCurrency)}</p>
            <p className="mt-0.5 text-xs text-gray-500">This month</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-700">{formatCurrency(totalAllTime, defaultCurrency)}</p>
            <p className="mt-0.5 text-xs text-gray-500">All time</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-700">{expenses.length}</p>
            <p className="mt-0.5 text-xs text-gray-500">Total entries</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-700">{byCategory[0]?.label ?? '—'}</p>
            <p className="mt-0.5 text-xs text-gray-500">Top category</p>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Receipt className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No expenses yet</h3>
            <p className="mt-1 text-sm text-gray-500">Track business costs to calculate your net profit</p>
            <Link href="/expenses/new" className="mt-4">
              <Button size="sm"><Plus className="h-4 w-4" /> Add Expense</Button>
            </Link>
          </div>
        ) : (
          <ExpensesTable expenses={expenses} />
        )}
      </div>
    </div>
  )
}
