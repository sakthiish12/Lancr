'use client'

import { useState, useTransition } from 'react'
import { Mail, Send } from 'lucide-react'
import { inviteMemberAction } from '../../actions'

export function InviteForm({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setMsg(null)
    startTransition(async () => {
      const res = await inviteMemberAction(orgId, email.trim())
      if ('error' in res) {
        setMsg({ type: 'error', text: res.error })
      } else {
        setMsg({ type: 'success', text: `Invite sent to ${email}` })
        setEmail('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="colleague@email.com"
          required
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !email}
        className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {isPending ? 'Sending…' : 'Send invite'}
      </button>

      {msg && (
        <p className={`absolute mt-10 text-xs ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg.text}
        </p>
      )}
    </form>
  )
}
