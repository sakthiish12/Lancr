import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, CheckCircle, AlertCircle, LogIn } from 'lucide-react'
import { acceptInviteAction } from '@/app/(dashboard)/org/actions'

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Lookup the invite (public — no auth needed to view)
  const db = svc()
  const { data: invite } = await db.from('org_memberships')
    .select('id, status, invite_email, role, org:organizations(name, slug)')
    .eq('invite_token', token).single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Invalid invite link</h1>
          <p className="text-sm text-gray-500 mt-2">This invite has expired or doesn&apos;t exist.</p>
          <Link href="/login" className="mt-6 inline-block text-violet-600 hover:underline text-sm">
            Go to WorkInvoice →
          </Link>
        </div>
      </div>
    )
  }

  if (invite.status === 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Already accepted</h1>
          <p className="text-sm text-gray-500 mt-2">This invite has already been used.</p>
          <Link href="/dashboard" className="mt-6 inline-block text-violet-600 hover:underline text-sm">
            Go to dashboard →
          </Link>
        </div>
      </div>
    )
  }

  // Check if user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const org = invite.org as unknown as { name: string; slug: string } | null

  // Not logged in — show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 mb-4">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">You&apos;re invited!</h1>
            <p className="text-gray-500 mt-2">
              Join <strong>{org?.name}</strong> on WorkInvoice as a {invite.role}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <LogIn className="h-8 w-8 text-violet-500 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-6">
              Sign in or create a WorkInvoice account to accept this invitation.
            </p>
            <Link
              href={`/login?redirect=/accept-invite/${token}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Sign in to accept →
            </Link>
            <p className="mt-3 text-xs text-gray-400">
              New to WorkInvoice?{' '}
              <Link href={`/signup?redirect=/accept-invite/${token}`} className="text-violet-600 hover:underline">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // User is logged in — auto-accept
  const result = await acceptInviteAction(token)

  if ('error' in result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Couldn&apos;t accept invite</h1>
          <p className="text-sm text-gray-500 mt-2">{result.error}</p>
          <Link href="/dashboard" className="mt-6 inline-block text-violet-600 hover:underline text-sm">
            Go to dashboard →
          </Link>
        </div>
      </div>
    )
  }

  redirect(`/org/${result.slug}`)
}
