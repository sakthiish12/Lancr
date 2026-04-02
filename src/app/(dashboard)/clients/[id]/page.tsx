import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ClientEditForm } from './ClientEditForm'
import type { Client } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  const [clientRes, quotesRes, invoicesRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).eq('tenant_id', user.id).single(),
    supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('client_id', id).eq('tenant_id', user.id),
    supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('client_id', id).eq('tenant_id', user.id),
  ])

  if (clientRes.error || !clientRes.data) notFound()

  const client = clientRes.data as Client
  const quotesCount = quotesRes.count ?? 0
  const invoicesCount = invoicesRes.count ?? 0

  return (
    <div>
      <Header title={client.name} />
      <div className="p-6 max-w-2xl">
        <ClientEditForm client={client} quotesCount={quotesCount} invoicesCount={invoicesCount} />
      </div>
    </div>
  )
}
