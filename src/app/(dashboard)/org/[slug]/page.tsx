import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, DollarSign, FileText, TrendingUp, UserPlus, Settings, Crown } from 'lucide-react'

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function fmt(cents: number, currency = 'SGD') {
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency }).format(cents / 100)
}

export default async function OrgDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = svc()

  const { data: org } = await db.from('organizations')
    .select('id, name, slug, plan, seats_limit').eq('slug', slug).single()
  if (!org) redirect('/dashboard')

  const { data: membership } = await db.from('org_memberships')
    .select('role').eq('org_id', org.id).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!membership) redirect('/dashboard')

  // Get all active members
  const { data: members } = await db.from('org_memberships')
    .select('id, role, status, tenant_id, joined_at, tenant:tenants(id, name, email, currency)')
    .eq('org_id', org.id).eq('status', 'active')
    .order('joined_at', { ascending: false })

  const memberTenantIds = (members ?? [])
    .map(m => (m.tenant as { id: string } | null)?.id)
    .filter(Boolean) as string[]

  // Aggregate stats across all members
  let totalRevenueCents = 0
  let totalOutstandingCents = 0
  let totalInvoices = 0
  let recentInvoices: Array<{
    id: string; invoice_number: string; status: string;
    total_cents: number; currency: string; created_at: string;
    client_name: string; member_name: string
  }> = []

  if (memberTenantIds.length > 0) {
    const { data: invoices } = await db.from('invoices')
      .select('id, invoice_number, status, total_cents, currency, created_at, tenant_id, client:clients(name), tenant:tenants(name)')
      .in('tenant_id', memberTenantIds)
      .order('created_at', { ascending: false })
      .limit(200)

    for (const inv of invoices ?? []) {
      totalInvoices++
      if (inv.status === 'paid') totalRevenueCents += inv.total_cents
      if (['sent', 'viewed', 'overdue'].includes(inv.status)) totalOutstandingCents += inv.total_cents
    }

    recentInvoices = ((invoices ?? []).slice(0, 8)).map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      status: inv.status,
      total_cents: inv.total_cents,
      currency: inv.currency,
      created_at: inv.created_at,
      client_name: (inv.client as { name: string } | null)?.name ?? '—',
      member_name: (inv.tenant as { name: string } | null)?.name ?? '—',
    }))
  }

  const activeCount = (members ?? []).length
  const isAdmin = membership.role === 'admin'

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    viewed: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-violet-600" />
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 capitalize">{org.plan}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{activeCount} of {org.seats_limit} seats used</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/org/${slug}/members`}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              <UserPlus className="h-4 w-4" /> Invite member
            </Link>
            <Link href={`/org/${slug}/settings`}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenueCents), icon: DollarSign, color: 'text-green-600' },
          { label: 'Outstanding', value: fmt(totalOutstandingCents), icon: TrendingUp, color: 'text-orange-600' },
          { label: 'Total Invoices', value: totalInvoices.toString(), icon: FileText, color: 'text-blue-600' },
          { label: 'Active Members', value: activeCount.toString(), icon: Users, color: 'text-violet-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent invoices */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Invoices — All Members</h2>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No invoices yet across your team</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inv.invoice_number} · {inv.client_name}</p>
                    <p className="text-xs text-gray-400 truncate">by {inv.member_name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {inv.status}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {fmt(inv.total_cents, inv.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Members</h2>
            <Link href={`/org/${slug}/members`} className="text-xs text-violet-600 hover:underline">Manage →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(members ?? []).map(m => {
              const t = m.tenant as { name: string; email: string } | null
              return (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-violet-700">{(t?.name ?? '?')[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t?.name ?? 'Pending'}</p>
                    <p className="text-xs text-gray-400 truncate">{t?.email ?? '—'}</p>
                  </div>
                  {m.role === 'admin' && (
                    <span className="text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">Admin</span>
                  )}
                </div>
              )
            })}
            {activeCount === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-400 mb-3">No members yet</p>
                {isAdmin && (
                  <Link href={`/org/${slug}/members`}
                    className="text-xs font-medium text-violet-600 hover:underline">
                    Invite your first member →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
