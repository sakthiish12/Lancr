import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { InvoiceDetail } from './InvoiceDetail'
import type { Invoice } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), line_items:invoice_line_items(*)')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (error || !data) notFound()

  const invoice = data as Invoice

  return (
    <div>
      <Header title={invoice.invoice_number} />
      <div className="p-6">
        <InvoiceDetail invoice={invoice} />
      </div>
    </div>
  )
}
