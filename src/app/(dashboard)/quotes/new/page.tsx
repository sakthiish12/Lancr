import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { QuoteForm } from '../QuoteForm'
import type { Client } from '@/types'

export default async function NewQuotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let clients: Client[] = []
  if (user) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', user.id)
      .order('name')
    clients = data ?? []
  }

  return (
    <div>
      <Header title="New Quote" />
      <div className="p-6">
        <QuoteForm clients={clients} />
      </div>
    </div>
  )
}
