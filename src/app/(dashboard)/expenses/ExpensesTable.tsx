'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { deleteExpenseAction } from '../actions'
import type { Expense } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  software: 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700',
  travel: 'bg-yellow-100 text-yellow-700',
  meals: 'bg-orange-100 text-orange-700',
  marketing: 'bg-pink-100 text-pink-700',
  office: 'bg-cyan-100 text-cyan-700',
  professional: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-600',
}

const CATEGORY_LABELS: Record<string, string> = {
  software: 'Software', equipment: 'Equipment', travel: 'Travel',
  meals: 'Meals', marketing: 'Marketing', office: 'Office',
  professional: 'Professional', other: 'Other',
}

interface Props { expenses: Expense[] }

export function ExpensesTable({ expenses }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    startTransition(async () => {
      await deleteExpenseAction(id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Date', 'Description', 'Category', 'Amount', ''].map((h) => (
              <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${h === '' || h === 'Amount' ? 'text-right' : 'text-left'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{exp.date}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                <Link href={`/expenses/${exp.id}`} className="hover:text-violet-700">{exp.description}</Link>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[exp.category] ?? CATEGORY_COLORS.other}`}>
                  {CATEGORY_LABELS[exp.category] ?? exp.category}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                -{formatCurrency(exp.amount_cents, exp.currency)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/expenses/${exp.id}`} className="rounded p-1 text-gray-400 hover:text-violet-600 hover:bg-violet-50">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={isPending}
                    className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
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
