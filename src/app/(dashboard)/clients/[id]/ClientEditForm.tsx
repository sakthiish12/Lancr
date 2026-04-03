'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Receipt } from 'lucide-react'
import { Button, Input, Select, Badge } from '@/components/ui'
import { updateClientAction, deleteClientAction } from '../../actions'
import type { Client, Currency } from '@/types'

const CURRENCY_OPTIONS = [
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
]

interface Props {
  client: Client
  quotesCount: number
  invoicesCount: number
}

export function ClientEditForm({ client, quotesCount, invoicesCount }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: client.name,
    email: client.email,
    company: client.company ?? '',
    phone: client.phone ?? '',
    address: client.address ?? '',
    currency: client.currency,
    notes: client.notes ?? '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await updateClientAction(client.id, {
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        currency: form.currency as Currency,
        notes: form.notes || undefined,
      })
      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Delete ${client.name}? This cannot be undone.`)) return
    startDeleteTransition(async () => {
      const result = await deleteClientAction(client.id)
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/clients')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <Button variant="danger" size="sm" onClick={handleDelete} loading={isDeleting}>
          Delete Client
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
        {client.company && <p className="text-sm text-gray-500 mt-0.5">{client.company}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{quotesCount}</p>
            <p className="text-xs text-gray-500">Quotes</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{invoicesCount}</p>
            <p className="text-xs text-gray-500">Invoices</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Client updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Name *"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          <Input
            label="Email *"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label="Company"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Address</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            rows={3}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>

        <Select
          label="Currency"
          value={form.currency}
          onChange={(e) => set('currency', e.target.value as Currency)}
          options={CURRENCY_OPTIONS}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Badge variant="gray">Added {new Date(client.created_at).toLocaleDateString()}</Badge>
          <Button type="submit" loading={isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
