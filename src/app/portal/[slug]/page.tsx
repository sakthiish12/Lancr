import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Zap, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import type { Currency } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

type Tenant = {
  id: string
  name: string
  business_name: string | null
  portal_slug: string
}

export default async function PortalPage({ params }: Props) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, business_name, portal_slug')
    .eq('portal_slug', slug)
    .single()

  if (!tenant) notFound()

  const t = tenant as Tenant
  const displayName = t.business_name ?? t.name

  // Fetch all unpaid invoices for this tenant (client-facing portal)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, client:clients(name, company)')
    .eq('tenant_id', t.id)
    .in('status', ['sent', 'viewed', 'overdue'])
    .order('created_at', { ascending: false })

  const unpaid = invoices ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">{displayName}</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and pay your outstanding invoices from {displayName}
          </p>
        </div>

        {unpaid.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No outstanding invoices</p>
            <p className="text-sm text-gray-400 mt-1">You&apos;re all up to date!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unpaid.map((inv) => {
              const client = inv.client as { name: string; company: string | null } | null
              const currency = inv.currency as Currency
              return (
                <Link
                  key={inv.id}
                  href={`/portal/${slug}/invoice/${inv.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
                >
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-violet-700">
                      {inv.invoice_number}
                    </p>
                    {client && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {client.name}{client.company ? ` · ${client.company}` : ''}
                      </p>
                    )}
                    {inv.due_date && (
                      <p className="text-xs text-gray-400 mt-0.5">Due {formatDate(inv.due_date)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(inv.total_cents, currency)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      inv.status === 'overdue'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-violet-100 text-violet-700'
                    }`}>
                      {inv.status === 'overdue' ? 'Overdue' : 'Due'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-400">
          Powered by <span className="font-semibold text-violet-500">Lancr</span> · Secure payments via Stripe
        </p>
      </main>
    </div>
  )
}
