import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Globe, CreditCard } from 'lucide-react'

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://workinvoice.app').trim()

export default async function OrgSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = svc()
  const { data: org } = await db.from('organizations')
    .select('id, name, slug, plan, seats_limit, branding, custom_domain').eq('slug', slug).single()
  if (!org) redirect('/dashboard')

  const { data: membership } = await db.from('org_memberships')
    .select('role').eq('org_id', org.id).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!membership || membership.role !== 'admin') redirect(`/org/${slug}`)

  const portalUrl = `${APP_URL}/portal/${slug}`

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Agency Settings</h1>

      {/* Portal URL */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Client Payment Portal</h2>
        </div>
        <p className="text-xs text-gray-500">Your branded portal where clients view and pay invoices</p>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <code className="flex-1 text-sm text-gray-700 break-all">{portalUrl}</code>
          <button
            onClick={() => {}}
            className="shrink-0 text-xs text-violet-600 hover:underline"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Custom domain support coming soon — you&apos;ll be able to use <code>pay.yourcompany.com</code>
        </p>
      </div>

      {/* Plan */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">Plan &amp; Billing</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 capitalize">{org.plan} Plan</p>
            <p className="text-xs text-gray-500">{org.seats_limit} seats · S$49/month</p>
          </div>
          <span className="rounded-full bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 capitalize">
            {org.plan}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            Need more seats or a custom domain?{' '}
            <Link href="mailto:hello@workinvoice.app" className="text-violet-600 hover:underline">
              Contact us for Enterprise pricing →
            </Link>
          </p>
        </div>
      </div>

      {/* Danger */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h2>
        <p className="text-xs text-red-600 mb-3">Deleting your agency removes all members and cannot be undone.</p>
        <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors">
          Delete agency
        </button>
      </div>
    </div>
  )
}
