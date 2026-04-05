import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { InviteForm } from './InviteForm'
import { MemberRow } from './MemberRow'
import { Users } from 'lucide-react'

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = svc()
  const { data: org } = await db.from('organizations')
    .select('id, name, slug, seats_limit').eq('slug', slug).single()
  if (!org) redirect('/dashboard')

  const { data: myMembership } = await db.from('org_memberships')
    .select('role').eq('org_id', org.id).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!myMembership) redirect('/dashboard')

  const isAdmin = myMembership.role === 'admin'

  const { data: members } = await db.from('org_memberships')
    .select('id, role, status, invite_email, joined_at, tenant:tenants(id, name, email)')
    .eq('org_id', org.id)
    .order('joined_at', { ascending: false })

  const activeCount = (members ?? []).filter(m => m.status === 'active').length
  const pendingCount = (members ?? []).filter(m => m.status === 'pending').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} active · {pendingCount} pending · {org.seats_limit} seat limit
          </p>
        </div>
      </div>

      {/* Seat usage bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Seats used</span>
          <span className="text-sm text-gray-500">{activeCount} / {org.seats_limit}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${Math.min(100, (activeCount / org.seats_limit) * 100)}%` }}
          />
        </div>
        {activeCount >= org.seats_limit && (
          <p className="text-xs text-orange-600 mt-2">Seat limit reached. Upgrade to add more members.</p>
        )}
      </div>

      {/* Invite form (admin only) */}
      {isAdmin && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Invite a member</h2>
          <InviteForm orgId={org.id} orgSlug={slug} />
        </div>
      )}

      {/* Members list */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            All members
          </h2>
        </div>
        {(members ?? []).length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No members yet. Invite someone above!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(members ?? []).map(m => (
              <MemberRow
                key={m.id}
                membershipId={m.id}
                orgId={org.id}
                orgSlug={slug}
                role={m.role}
                status={m.status}
                inviteEmail={m.invite_email}
                joinedAt={m.joined_at}
                tenant={m.tenant as { id: string; name: string; email: string } | null}
                isAdmin={isAdmin}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
