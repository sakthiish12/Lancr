'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Save } from 'lucide-react'
import { updateLeadAction, deleteLeadAction } from '../../actions'

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
  created_at: string
}

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
const SOURCES = ['website', 'referral', 'linkedin', 'cold_outreach', 'event', 'other']

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  proposal: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-100 text-gray-500',
}

export default function LeadDetail({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(lead.name)
  const [email, setEmail] = useState(lead.email ?? '')
  const [company, setCompany] = useState(lead.company ?? '')
  const [phone, setPhone] = useState(lead.phone ?? '')
  const [status, setStatus] = useState(lead.status)
  const [source, setSource] = useState(lead.source ?? '')
  const [value, setValue] = useState(lead.value_cents ? String(lead.value_cents / 100) : '')
  const [notes, setNotes] = useState(lead.notes ?? '')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setSaved(false)
    const result = await updateLeadAction(lead.id, {
      name, email: email || undefined, company: company || undefined,
      phone: phone || undefined, status, source: source || undefined,
      value_cents: value ? Math.round(parseFloat(value) * 100) : 0,
      notes: notes || undefined,
    })
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (!confirm(`Delete lead "${lead.name}"?`)) return
    await deleteLeadAction(lead.id)
    router.push('/leads')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/leads" className="text-sm text-gray-500 hover:text-gray-700">← Back to Leads</Link>
        <button onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[lead.status]}`}>
          {lead.status}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {saved && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Changes saved!</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select value={source} onChange={e => setSource(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Select source…</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Value (SGD)</label>
            <input value={value} onChange={e => setValue(e.target.value)} type="number" min="0" step="0.01" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y" />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
