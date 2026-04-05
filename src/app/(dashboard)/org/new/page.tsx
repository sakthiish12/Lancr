'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Zap, Users, Globe, CheckCircle } from 'lucide-react'
import { createOrgAction } from '../actions'

export default function NewOrgPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(v: string) {
    setName(v)
    if (!slugManual) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    setError('')
    startTransition(async () => {
      const res = await createOrgAction({ name: name.trim(), slug: slug.trim() })
      if ('error' in res) { setError(res.error ?? 'Something went wrong'); return }
      router.push(`/org/${res.slug}`)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 mb-4">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your Agency</h1>
          <p className="mt-2 text-gray-500">One workspace for your whole freelancer network</p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Users, label: 'Invite your team', sub: 'Up to 10 freelancers' },
            { icon: Globe, label: 'White-label portal', sub: 'Your brand, your URL' },
            { icon: Zap, label: 'Admin dashboard', sub: 'See all activity' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <Icon className="h-5 w-5 text-violet-600 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Agency / Company name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="TechCorp Agency"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL slug
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 overflow-hidden">
              <span className="pl-3 pr-1 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0">
                lancr.app/org/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugManual(true) }}
                placeholder="techcorp"
                required
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Only lowercase letters, numbers, and hyphens</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-violet-900">Agency plan — S$49/month</p>
              <p className="text-xs text-violet-600 mt-0.5">Up to 10 seats. Includes white-label portal, admin dashboard, and all Pro features.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !name || !slug}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? 'Creating…' : 'Create Agency →'}
          </button>

          <p className="text-center text-xs text-gray-400">
            14-day free trial · Cancel anytime
          </p>
        </form>
      </div>
    </div>
  )
}
