'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { updateTenantAction } from '../../actions'
import type { Tenant } from '@/types'

interface Props {
  tenant: Tenant
}

export function BusinessForm({ tenant }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState(tenant.name)
  const [businessName, setBusinessName] = useState(tenant.business_name ?? '')
  const [address, setAddress] = useState(tenant.address ?? '')

  function handleSave() {
    setError('')
    setSaved(false)

    startTransition(async () => {
      const result = await updateTenantAction({
        name,
        business_name: businessName || null,
        address: address || null,
      } as Parameters<typeof updateTenantAction>[0])

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
        href="/dashboard/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business / Trading Name</label>
          <input
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Leave blank to use your name"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            placeholder="123 Orchard Road, Singapore 238888"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
          <input
            type="email"
            value={tenant.email}
            readOnly
            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email is tied to your login account and cannot be changed here.</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
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
