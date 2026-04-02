import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { InvoiceForm } from '../InvoiceForm'
import type { Client } from '@/types'

export default async function NewInvoicePage() {
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
      <Header title="New Invoice" />
      <div className="p-6">
        <InvoiceForm clients={clients} />
      </div>
    </div>
  )
}
