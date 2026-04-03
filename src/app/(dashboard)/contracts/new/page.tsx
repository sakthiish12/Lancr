import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContractForm } from '../ContractForm'
import type { Client } from '@/types'

export default async function NewContractPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, company, currency')
    .eq('tenant_id', user.id)
    .order('name')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, name')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <Header title="New Contract" />
      <div className="p-6 max-w-4xl">
        <PageHeader
          title="New Contract"
          description="Choose a template and customise your contract"
        />
        <div className="mt-6">
          <ContractForm
            clients={(clients ?? []) as Client[]}
            businessName={tenant?.business_name ?? tenant?.name ?? ''}
          />
        </div>
      </div>
    </div>
  )
}
