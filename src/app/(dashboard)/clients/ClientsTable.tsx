'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { formatDate } from '@/lib/utils/date'
import { deleteClientAction } from '../actions'
import type { Client } from '@/types'

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company?.toLowerCase().includes(q) ?? false)
    )
  })

  function handleDelete(id: string) {
    if (!confirm('Delete this client? This cannot be undone.')) return
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteClientAction(id)
      setDeletingId(null)
      if ('error' in result) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name, email, or company…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Company', 'Email', 'Phone', 'Currency', 'Date Added', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                  No clients match your search.
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-gray-900 hover:text-violet-700">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{client.company ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{client.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{client.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="gray">{client.currency}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(client.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/clients/${client.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(client.id)}
                        loading={isPending && deletingId === client.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
