'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, Copy, Check, Trash2 } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { formatDate, formatDateTime } from '@/lib/utils/date'
import { sendContractAction, deleteContractAction } from '../../actions'
import type { Contract, Client } from '@/types'

const STATUS_COLORS = {
  draft: 'gray',
  sent: 'blue',
  signed: 'green',
} as const

interface Props {
  contract: Contract & { client: Client | null; signing_token: string }
}

export function ContractDetail({ contract }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim()
  const signingUrl = `${appUrl}/sign/${contract.signing_token}`

  function handleSend() {
    startTransition(async () => {
      const result = await sendContractAction(contract.id)
      if ('error' in result) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (!confirm('Delete this contract? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteContractAction(contract.id)
      if ('error' in result) {
        alert(result.error)
      } else {
        router.push('/dashboard/contracts')
      }
    })
  }

  function copySigningLink() {
    navigator.clipboard.writeText(signingUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/contracts"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 block"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Contracts
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <Badge variant={STATUS_COLORS[contract.status]} size="md">
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {contract.status === 'draft' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSend}
                loading={isPending}
              >
                <Send className="h-4 w-4" />
                Send for Signature
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                loading={isPending}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{contract.client?.name ?? '—'}</p>
          {contract.client?.company && (
            <p className="text-xs text-gray-500">{contract.client.company}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
          <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{contract.status}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(contract.created_at)}</p>
        </div>
      </div>

      {/* Signing link — shown when sent or signed */}
      {contract.status === 'sent' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-800 mb-2">Signing Link</p>
          <p className="text-xs text-blue-600 mb-3">
            Share this link with your client. They can review and sign without creating an account.
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={signingUrl}
              className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 font-mono"
            />
            <Button variant="outline" size="sm" onClick={copySigningLink}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      {/* Signed confirmation */}
      {contract.status === 'signed' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-semibold text-green-800">Contract Signed</p>
          </div>
          <div className="space-y-1 text-sm text-green-700">
            {contract.signed_at && (
              <p>Signed on <strong>{formatDateTime(contract.signed_at)}</strong></p>
            )}
            {contract.signer_name && (
              <p>By <strong>{contract.signer_name}</strong>
                {contract.signer_email ? ` (${contract.signer_email})` : ''}
              </p>
            )}
            {contract.signature_data && (
              <div className="mt-3">
                <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Signature</p>
                <div className="rounded-lg bg-white border border-green-200 p-3 font-serif text-2xl text-gray-800 italic">
                  {contract.signature_data}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
          Contract Content
        </h3>
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {contract.content}
        </pre>
      </div>
    </div>
  )
}
