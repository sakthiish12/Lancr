'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { updateTenantAction } from '../../actions'
import type { Tenant, Currency } from '@/types'

interface Props {
  tenant: Tenant
}

const CURRENCIES: { value: Currency; label: string; flag: string }[] = [
  { value: 'SGD', label: 'Singapore Dollar (SGD)', flag: '🇸🇬' },
  { value: 'MYR', label: 'Malaysian Ringgit (MYR)', flag: '🇲🇾' },
  { value: 'USD', label: 'US Dollar (USD)', flag: '🇺🇸' },
  { value: 'IDR', label: 'Indonesian Rupiah (IDR)', flag: '🇮🇩' },
]

export function TaxForm({ tenant }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [currency, setCurrency] = useState<Currency>(tenant.currency)
  const [gstRegistered, setGstRegistered] = useState(tenant.gst_registered)
  const [gstNumber, setGstNumber] = useState(tenant.gst_number ?? '')

  function handleSave() {
    setError('')
    setSaved(false)

    if (gstRegistered && !gstNumber.trim()) {
      setError('Please enter your GST registration number.')
      return
    }

    startTransition(async () => {
      const result = await updateTenantAction({
        currency,
        gst_registered: gstRegistered,
        gst_number: gstRegistered ? gstNumber.trim() : null,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-5">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
          <p className="text-xs text-gray-500 mb-2">
            Used as default on new invoices and quotes.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CURRENCIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCurrency(c.value)}
                className={`text-left flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all ${
                  currency === c.value
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 bg-white hover:border-violet-300'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="text-sm font-medium text-gray-900">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GST */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">GST Registered</p>
              <p className="text-xs text-gray-500">
                Enables 9% GST on invoices and adds your GST number to documents
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={gstRegistered}
              onClick={() => setGstRegistered(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                gstRegistered ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  gstRegistered ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {gstRegistered && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Registration Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
                placeholder="e.g. M12345678X (Singapore) or 123456789012 (Malaysia)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will appear on all invoices and quotes you issue.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={isPending}>
            Save Changes
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
