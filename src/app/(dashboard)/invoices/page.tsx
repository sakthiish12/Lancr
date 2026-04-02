import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'

export default function InvoicesPage() {
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
          {[
            { label: 'Draft', value: '0', color: 'text-gray-600' },
            { label: 'Sent', value: '0', color: 'text-blue-600' },
            { label: 'Overdue', value: '0', color: 'text-red-600' },
            { label: 'Paid', value: '0', color: 'text-green-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
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
      </div>
    </div>
  )
}
