'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteLeadAction } from '../actions'
import { useRouter } from 'next/navigation'

interface Lead {
  id: string
  name: string
  email: string | null
  company: string | null
  phone: string | null
  status: string
  source: string | null
  value_cents: number
  notes: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
}

function formatCurrency(cents: number) {
  if (!cents) return '—'
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(cents / 100)
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete lead "${name}"?`)) return
    await deleteLeadAction(id)
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Company</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Source</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Est. Value</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/leads/${lead.id}`} className="font-medium text-gray-900 hover:text-violet-600">
                  {lead.name}
                </Link>
                {lead.email && <p className="text-xs text-gray-400 mt-0.5">{lead.email}</p>}
              </td>
              <td className="px-4 py-3 text-gray-600">{lead.company ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 capitalize">{lead.source ?? '—'}</td>
              <td className="px-4 py-3 text-gray-700 font-medium">{formatCurrency(lead.value_cents)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/leads/${lead.id}`}>
                    <button className="rounded p-1 text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(lead.id, lead.name)}
                    className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
