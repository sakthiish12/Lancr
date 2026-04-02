import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { QuoteDetail } from './QuoteDetail'
import type { Quote } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(*), line_items:quote_line_items(*)')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (error || !data) notFound()

  const quote = data as Quote

  return (
    <div>
      <Header title={quote.quote_number} />
      <div className="p-6">
        <QuoteDetail quote={quote} />
      </div>
    </div>
  )
}
