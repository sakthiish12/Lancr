import Link from 'next/link'
import { Plus, FileSignature } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'
import { formatDate } from '@/lib/utils/date'
import { CONTRACT_TEMPLATES } from '@/lib/contracts/templates'
import type { Contract, Client } from '@/types'

const STATUS_COLORS = { draft: 'gray', sent: 'blue', signed: 'green' } as const

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, client:clients(name, company)')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  const typed = (contracts ?? []) as (Contract & { client: Client | null })[]

  return (
    <div>
      <Header title="Contracts" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Contracts"
          description="Create and manage legally binding agreements"
          action={
            <Link href="/contracts/new">
              <Button><Plus className="h-4 w-4" />New Contract</Button>
            </Link>
          }
        />

        {typed.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <FileSignature className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No contracts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first contract from a template</p>
            <Link href="/contracts/new" className="mt-4">
              <Button size="sm"><Plus className="h-4 w-4" />New Contract</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Client', 'Type', 'Status', 'Created', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {typed.map(contract => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/contracts/${contract.id}`} className="text-sm font-medium text-gray-900 hover:text-violet-600">
                        {contract.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {contract.client?.name ?? '—'}
                      {contract.client?.company && <span className="block text-xs text-gray-400">{contract.client.company}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {CONTRACT_TEMPLATES[contract.template_type as keyof typeof CONTRACT_TEMPLATES]?.label ?? contract.template_type}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_COLORS[contract.status]}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(contract.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/contracts/${contract.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
