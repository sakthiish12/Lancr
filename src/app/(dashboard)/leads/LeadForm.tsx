'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createLeadAction, updateLeadAction } from '../actions'

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
}

interface Props {
  lead?: Lead
}

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
const SOURCES = ['website', 'referral', 'linkedin', 'cold_outreach', 'event', 'other']

export default function LeadForm({ lead }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(lead?.name ?? '')
  const [email, setEmail] = useState(lead?.email ?? '')
  const [company, setCompany] = useState(lead?.company ?? '')
  const [phone, setPhone] = useState(lead?.phone ?? '')
  const [status, setStatus] = useState(lead?.status ?? 'new')
  const [source, setSource] = useState(lead?.source ?? '')
  const [value, setValue] = useState(lead ? String(lead.value_cents / 100) : '')
  const [notes, setNotes] = useState(lead?.notes ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError(null)

    const data = {
      name: name.trim(),
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      status,
      source: source || undefined,
      value_cents: value ? Math.round(parseFloat(value) * 100) : 0,
      notes: notes.trim() || undefined,
    }

    const result = lead
      ? await updateLeadAction(lead.id, data)
      : await createLeadAction(data)

    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    router.push(lead ? `/leads/${lead.id}` : `/leads/${'id' in result ? result.id : ''}`)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/leads" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Back to Leads
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{lead ? 'Edit Lead' : 'New Lead'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="jane@company.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Pte Ltd"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+65 9123 4567"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Select source…</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value (SGD)</label>
            <input value={value} onChange={e => setValue(e.target.value)} type="number" min="0" step="0.01" placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Background info, requirements, next steps…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/leads">
            <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </Link>
          <button type="submit" disabled={loading}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors flex items-center gap-2">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {lead ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
