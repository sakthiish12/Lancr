'use client'

import { useTransition } from 'react'
import { Trash2, Clock, CheckCircle } from 'lucide-react'
import { removeMemberAction } from '../../actions'

interface Props {
  membershipId: string
  orgId: string
  orgSlug: string
  role: string
  status: string
  inviteEmail: string | null
  joinedAt: string | null
  tenant: { id: string; name: string; email: string } | null
  isAdmin: boolean
  currentUserId: string
}

export function MemberRow({ membershipId, orgId, orgSlug, role, status, inviteEmail, joinedAt, tenant, isAdmin, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition()

  const name = tenant?.name ?? inviteEmail ?? 'Unknown'
  const email = tenant?.email ?? inviteEmail ?? '—'
  const isCurrentUser = tenant?.id === currentUserId

  function handleRemove() {
    if (!confirm(`Remove ${name} from this agency?`)) return
    startTransition(async () => {
      await removeMemberAction(orgId, membershipId)
    })
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-gray-600">{name[0].toUpperCase()}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          {isCurrentUser && <span className="text-xs text-gray-400">(you)</span>}
        </div>
        <p className="text-xs text-gray-400 truncate">{email}</p>
      </div>

      {/* Role badge */}
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {role}
      </span>

      {/* Status */}
      <div className="flex items-center gap-1 text-xs shrink-0">
        {status === 'active' ? (
          <><CheckCircle className="h-3.5 w-3.5 text-green-500" /><span className="text-green-600">Active</span></>
        ) : (
          <><Clock className="h-3.5 w-3.5 text-orange-400" /><span className="text-orange-500">Pending</span></>
        )}
      </div>

      {/* Date */}
      {joinedAt && (
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(joinedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
        </span>
      )}

      {/* Remove button (admin only, not self) */}
      {isAdmin && !isCurrentUser && (
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
