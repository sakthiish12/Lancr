import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'
import { InvoicesTable } from './InvoicesTable'
import { formatCurrency } from '@/lib/utils/currency'
import type { Invoice, Currency } from '@/types'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let invoices: Invoice[] = []
  if (user) {
    const { data } = await supabase
      .from('invoices')
      .select('*, client:clients(name, company)')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false })
    invoices = (data ?? []) as Invoice[]
  }

  const defaultCurrency: Currency = 'SGD'

  const draftInvoices = invoices.filter((i) => i.status === 'draft')
  const sentInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'viewed')
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue')
  const paidInvoices = invoices.filter((i) => i.status === 'paid')

  const draftTotal = draftInvoices.reduce((s, i) => s + i.total_cents, 0)
  const sentTotal = sentInvoices.reduce((s, i) => s + i.total_cents, 0)
  const overdueTotal = overdueInvoices.reduce((s, i) => s + i.total_cents, 0)
  const paidTotal = paidInvoices.reduce((s, i) => s + i.total_cents, 0)

  const summaryCards = [
    { label: 'Draft', count: draftInvoices.length, amount: draftTotal, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Sent', count: sentInvoices.length, amount: sentTotal, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Overdue', count: overdueInvoices.length, amount: overdueTotal, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Paid', count: paidInvoices.length, amount: paidTotal, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div>
      <Header title="Invoices" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Invoices"
          description="Track and collect payments from clients"
          action={
            <Link href="/dashboard/invoices/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          }
        />

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryCards.map((item) => (
            <div key={item.label} className={`rounded-lg border border-gray-200 bg-white p-4`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
              <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
              <p className={`mt-1.5 text-xs font-medium ${item.color}`}>
                {formatCurrency(item.amount, defaultCurrency)}
              </p>
            </div>
          ))}
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Receipt className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No invoices yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create an invoice to start collecting payments</p>
            <Link href="/dashboard/invoices/new" className="mt-4">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <InvoicesTable invoices={invoices} />
        )}
      </div>
    </div>
  )
}
