'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { createInvoiceAction } from '../actions'
import type { Client, Currency } from '@/types'

const CURRENCY_OPTIONS = [
  { value: 'SGD', label: 'SGD' },
  { value: 'MYR', label: 'MYR' },
  { value: 'USD', label: 'USD' },
  { value: 'IDR', label: 'IDR' },
]

interface LineItem {
  description: string
  quantity: string
  unit_price: string
  tax_rate: string
}

function emptyItem(): LineItem {
  return { description: '', quantity: '1', unit_price: '0.00', tax_rate: '9' }
}

interface InvoiceFormProps {
  clients: Client[]
}

export function InvoiceForm({ clients }: InvoiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [currency, setCurrency] = useState<Currency>('SGD')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem()])

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.company ? `${c.name} (${c.company})` : c.name,
  }))

  function updateItem(idx: number, field: keyof LineItem, value: string) {
    setLineItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setLineItems((prev) => [...prev, emptyItem()])
  }

  function removeItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const parsedItems = lineItems.map((item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = Math.round((parseFloat(item.unit_price) || 0) * 100)
    const tax = parseFloat(item.tax_rate) || 0
    const amount = Math.round(qty * price)
    return { qty, price, tax, amount }
  })

  const subtotal = parsedItems.reduce((sum, item) => sum + item.amount, 0)
  const taxTotal = parsedItems.reduce((sum, item) => sum + Math.round(item.amount * (item.tax / 100)), 0)
  const total = subtotal + taxTotal

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!clientId) { setError('Please select a client.'); return }

    startTransition(async () => {
      const items = lineItems.map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price_cents: Math.round((parseFloat(item.unit_price) || 0) * 100),
        tax_rate: parseFloat(item.tax_rate) || 0,
      }))

      const result = await createInvoiceAction({
        client_id: clientId,
        currency,
        due_date: dueDate || undefined,
        notes: notes || undefined,
        line_items: items,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/invoices')
      }
    })
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="mb-2">
        <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Select
              label="Client *"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={clientOptions}
              placeholder="Select client…"
            />
          </div>
          <div>
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              options={CURRENCY_OPTIONS}
            />
          </div>
          <div>
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-900">Line Items</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-full">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap w-20">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap w-32">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap w-24">Tax %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap w-32">Amount</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineItems.map((item, idx) => {
                  const qty = parseFloat(item.quantity) || 0
                  const price = Math.round((parseFloat(item.unit_price) || 0) * 100)
                  const amount = Math.round(qty * price)
                  return (
                    <tr key={idx}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          placeholder="Service or product description"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-right text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-right text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          value={item.unit_price}
                          onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-right text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          value={item.tax_rate}
                          onChange={(e) => updateItem(idx, 'tax_rate', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(amount, currency)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={lineItems.length === 1}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add line item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(taxTotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Notes</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, bank details, notes…"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/invoices">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={isPending}>
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  )
}
