import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ExpenseForm } from '../ExpenseForm'
import type { Expense } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExpenseDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data } = await supabase.from('expenses').select('*').eq('id', id).eq('tenant_id', user.id).single()
  if (!data) notFound()

  return (
    <div>
      <Header title="Edit Expense" />
      <div className="p-6">
        <ExpenseForm expense={data as Expense} />
      </div>
    </div>
  )
}
