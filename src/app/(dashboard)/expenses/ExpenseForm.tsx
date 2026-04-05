'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { createExpenseAction, updateExpenseAction } from '../actions'
import type { Expense } from '@/types'

const CURRENCY_OPTIONS = [
  { value: 'SGD', label: 'SGD' },
  { value: 'MYR', label: 'MYR' },
  { value: 'USD', label: 'USD' },
  { value: 'IDR', label: 'IDR' },
]

const CATEGORY_OPTIONS = [
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'equipment', label: 'Equipment & Hardware' },
  { value: 'travel', label: 'Travel & Transport' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
]

interface Props {
  expense?: Expense
}

export function ExpenseForm({ expense }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount] = useState(expense ? String(expense.amount_cents / 100) : '')
  const [currency, setCurrency] = useState<'SGD' | 'MYR' | 'USD' | 'IDR'>(expense?.currency ?? 'SGD')
  const [category, setCategory] = useState<'software' | 'equipment' | 'travel' | 'meals' | 'marketing' | 'office' | 'professional' | 'other'>(expense?.category ?? 'other')
  const [date, setDate] = useState(expense?.date ?? today)
  const [notes, setNotes] = useState(expense?.notes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!description.trim()) { setError('Description is required.'); return }
    const amountCents = Math.round(parseFloat(amount) * 100)
    if (!amountCents || amountCents <= 0) { setError('Enter a valid amount.'); return }

    startTransition(async () => {
      const data = {
        description: description.trim(),
        amount_cents: amountCents,
        currency: currency as 'SGD' | 'MYR' | 'USD' | 'IDR',
        category,
        date,
        notes: notes || undefined,
      }

      const result = expense
        ? await updateExpenseAction(expense.id, data)
        : await createExpenseAction(data)

      if ('error' in result) {
        setError(result.error)
      } else {
        if (expense) {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
          router.refresh()
        } else {
          router.push('/expenses')
        }
      }
    })
  }

  return (
    <div className="max-w-xl space-y-6">
      <Link href="/expenses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Expenses
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{expense ? 'Edit Expense' : 'Add Expense'}</h1>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Figma subscription, AWS hosting…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <Select label="Currency" value={currency} onChange={e => setCurrency(e.target.value as 'SGD' | 'MYR' | 'USD' | 'IDR')} options={CURRENCY_OPTIONS} />
        </div>

        <Select label="Category" value={category} onChange={e => setCategory(e.target.value as typeof category)} options={CATEGORY_OPTIONS} />

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={isPending}>
            {expense ? 'Save Changes' : 'Add Expense'}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" /> Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
