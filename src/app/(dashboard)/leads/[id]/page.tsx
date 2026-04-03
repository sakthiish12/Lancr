import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import LeadDetail from './LeadDetail'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (!lead) notFound()

  return <LeadDetail lead={lead} />
}
