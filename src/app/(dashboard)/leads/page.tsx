import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Target } from 'lucide-react'
import LeadsTable from './LeadsTable'
import { isPro } from '@/lib/plan'
import { ProGate } from '@/components/ProGate'
import { Header } from '@/components/layout/Header'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase.from('tenants').select('plan').eq('id', user.id).single()
  if (!isPro(tenant?.plan)) {
    return (
      <div>
        <Header title="Leads" />
        <div className="p-6">
          <ProGate feature="Leads Pipeline" description="Track prospects from first contact to won deal. Never let a lead fall through the cracks." />
        </div>
      </div>
    )
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your sales pipeline</p>
        </div>
        <Link href="/leads/new">
          <button className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
            <Plus className="h-4 w-4" />
            New Lead
          </button>
        </Link>
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No leads yet</p>
          <p className="text-sm text-gray-400 mt-1">Start tracking your sales pipeline</p>
          <Link href="/leads/new">
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Lead
            </button>
          </Link>
        </div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  )
}
