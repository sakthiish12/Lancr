import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ContractDetail } from './ContractDetail'
import type { Contract, Client } from '@/types'

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contract, error } = await supabase
    .from('contracts')
    .select('*, client:clients(id, name, company, email)')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (error || !contract) notFound()

  return (
    <div>
      <Header title={contract.title} />
      <div className="p-6">
        <ContractDetail contract={contract as Contract & { client: Client | null; signing_token: string }} />
      </div>
    </div>
  )
}
