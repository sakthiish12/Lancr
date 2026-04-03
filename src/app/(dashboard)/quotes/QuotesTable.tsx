'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { deleteQuoteAction } from '../actions'
import { QUOTE_STATUSES } from '@/lib/constants'
import type { Quote, QuoteStatus } from '@/types'

const STATUS_TABS: { label: string; value: QuoteStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Approved', value: 'approved' },
  { label: 'Expired', value: 'expired' },
]

interface QuotesTableProps {
  quotes: Quote[]
}

export function QuotesTable({ quotes }: QuotesTableProps) {
  const [activeTab, setActiveTab] = useState<QuoteStatus | 'all'>('all')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const filtered = activeTab === 'all' ? quotes : quotes.filter((q) => q.status === activeTab)

  function handleDelete(id: string) {
    if (!confirm('Delete this quote? This cannot be undone.')) return
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteQuoteAction(id)
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
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              activeTab === tab.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Quote #', 'Title', 'Client', 'Status', 'Total', 'Valid Until', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                  No quotes found.
                </td>
              </tr>
            ) : (
              filtered.map((quote) => {
                const statusInfo = QUOTE_STATUSES[quote.status]
                return (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{quote.quote_number}</td>
                    <td className="px-4 py-3">
                      <Link href={`/quotes/${quote.id}`} className="font-medium text-gray-900 hover:text-violet-700">
                        {quote.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {quote.client ? (
                        <div>
                          <p className="font-medium text-gray-800">{quote.client.name}</p>
                          {quote.client.company && <p className="text-xs text-gray-500">{quote.client.company}</p>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusInfo.color as 'gray' | 'blue' | 'green' | 'red' | 'orange'}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(quote.total_cents, quote.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {quote.valid_until ? formatDate(quote.valid_until) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(quote.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(quote.id)}
                          loading={isPending && deletingId === quote.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
