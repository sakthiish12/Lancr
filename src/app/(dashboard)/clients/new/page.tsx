'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { Header } from '@/components/layout/Header'
import { createClientAction } from '../../actions'
import type { Currency } from '@/types'

const CURRENCY_OPTIONS = [
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
]

export default function NewClientPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    currency: 'SGD' as Currency,
    notes: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createClientAction({
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        currency: form.currency,
        notes: form.notes || undefined,
      })
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/dashboard/clients')
      }
    })
  }

  return (
    <div>
      <Header title="New Client" />
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Client</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Name *"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Jane Smith"
            />
            <Input
              label="Email *"
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="jane@company.com"
            />
            <Input
              label="Company"
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="Acme Pte Ltd"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+65 9123 4567"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              rows={3}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="123 Orchard Road, Singapore 123456"
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
              placeholder="Any notes about this client…"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/clients">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" loading={isPending}>
              Add Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
