'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'

interface Props {
  invoiceId: string
  totalFormatted: string
}

export default function PayButton({ invoiceId, totalFormatted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Pay this invoice</h2>
      <p className="text-xs text-gray-500 mb-5">
        Accepted: Card · PayNow · GrabPay · FPX · and more
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <CreditCard className="h-5 w-5" />
        {loading ? 'Redirecting to payment…' : `Pay ${totalFormatted}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        🔒 Secure payment powered by Stripe
      </p>
    </div>
  )
}
