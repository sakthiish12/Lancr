import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'
import { QuotesTable } from './QuotesTable'
import type { Quote } from '@/types'

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let quotes: Quote[] = []
  if (user) {
    const { data } = await supabase
      .from('quotes')
      .select('*, client:clients(name, company)')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false })
    quotes = (data ?? []) as Quote[]
  }

  return (
    <div>
      <Header title="Quotes" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Quotes"
          description="Create and manage your client proposals"
          action={
            <Link href="/dashboard/quotes/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Quote
              </Button>
            </Link>
          }
        />

        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No quotes yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first quote to send to a client</p>
            <Link href="/dashboard/quotes/new" className="mt-4">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create Quote
              </Button>
            </Link>
          </div>
        ) : (
          <QuotesTable quotes={quotes} />
        )}
      </div>
    </div>
  )
}
