'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Building2, Globe, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Currency } from '@/types'

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
]

const STEPS = ['Your details', 'Business info', 'Tax & currency']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    business_name: '',
    currency: 'SGD' as Currency,
    gst_registered: false,
    gst_number: '',
    address: '',
  })

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (step < 2) setStep(s => s + 1)
    else handleSubmit()
  }

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Session expired. Please sign in again.'); return }

      const slugBase = (form.business_name || form.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const portal_slug = `${slugBase}-${user.id.slice(0, 6)}`

      const { error: insertError } = await supabase.from('tenants').insert({
        id: user.id,
        name: form.name,
        business_name: form.business_name || null,
        email: user.email!,
        currency: form.currency,
        gst_registered: form.gst_registered,
        gst_number: form.gst_registered ? form.gst_number || null : null,
        address: form.address || null,
        portal_slug,
      })

      if (insertError) { setError(insertError.message); return }
      router.push('/dashboard')
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Set up your workspace</h1>
          <p className="mt-1 text-sm text-gray-500">Just a few details to get you started</p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step ? 'bg-violet-600 text-white' :
                i === step ? 'bg-violet-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleNext}>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Step 0 — Your details */}
            {step === 0 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                    <Building2 className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Your details</p>
                    <p className="text-xs text-gray-500">How you appear to clients</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={e => update('business_name', e.target.value)}
                    placeholder="Acme Design Studio"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business address <span className="text-gray-400">(optional)</span></label>
                  <textarea
                    value={form.address}
                    onChange={e => update('address', e.target.value)}
                    placeholder="123 Orchard Rd, Singapore 238863"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                  />
                </div>
              </>
            )}

            {/* Step 1 — Business info (placeholder, merged into step 0) */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                    <Globe className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Default currency</p>
                    <p className="text-xs text-gray-500">Used for new quotes and invoices</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency *</label>
                  <select
                    value={form.currency}
                    onChange={e => update('currency', e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Step 2 — Tax */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                    <CheckCircle className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Tax & GST</p>
                    <p className="text-xs text-gray-500">For GST-compliant invoices</p>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-violet-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.gst_registered}
                    onChange={e => update('gst_registered', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">I am GST/SST registered</p>
                    <p className="text-xs text-gray-500 mt-0.5">Enables GST on invoices and adds your registration number to tax documents</p>
                  </div>
                </label>
                {form.gst_registered && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Registration Number *</label>
                    <input
                      type="text"
                      value={form.gst_number}
                      onChange={e => update('gst_number', e.target.value)}
                      placeholder="M90000001A"
                      required={form.gst_registered}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isPending || (step === 0 && !form.name)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : step < 2 ? 'Continue' : 'Launch my workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
