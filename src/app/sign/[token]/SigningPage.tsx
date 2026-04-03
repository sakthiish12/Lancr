'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, FileSignature } from 'lucide-react'
import { Button } from '@/components/ui'
import { signContractAction } from '@/app/(dashboard)/actions'
import { formatDateTime } from '@/lib/utils/date'
import type { Contract, Client } from '@/types'

interface Props {
  contract: Contract & { client: Client | null; signing_token: string }
  token: string
}

export function SigningPage({ contract, token }: Props) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(contract.status === 'signed')
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signature, setSignature] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [signedAt, setSignedAt] = useState<string | null>(null)
  const [confirmedName, setConfirmedName] = useState<string | null>(null)
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null)

  function handleSign() {
    if (!signerName || !signerEmail || !signature || !agreed) {
      setError('Please fill in all fields and agree to the terms.')
      return
    }
    setError('')

    startTransition(async () => {
      const result = await signContractAction(token, {
        signer_name: signerName,
        signer_email: signerEmail,
        signature_data: signature,
      })

      if ('error' in result) {
        setError(result.error)
      } else {
        setSignedAt(new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }))
        setConfirmedName(signerName)
        setConfirmedEmail(signerEmail)
        setDone(true)
      }
    })
  }

  // Already signed view
  if (done) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contract Signed</h1>
            <p className="text-sm text-gray-500">Thank you for signing this contract.</p>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
          {(signedAt ?? contract.signed_at) && (
            <p>Signed on <strong>{signedAt ?? formatDateTime(contract.signed_at!)}</strong></p>
          )}
          {(confirmedName ?? contract.signer_name) && (
            <p className="mt-1">By <strong>{confirmedName ?? contract.signer_name}</strong>
              {(confirmedEmail ?? contract.signer_email) ? ` (${confirmedEmail ?? contract.signer_email})` : ''}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
            {contract.title}
          </h3>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
            {contract.content}
          </pre>
        </div>
      </div>
    )
  }

  // Already signed (loaded from DB)
  if (contract.status === 'signed') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-green-800">This contract has already been signed.</h2>
        <p className="text-sm text-green-600 mt-2">No further action is required.</p>
      </div>
    )
  }

  // Not yet sent — invalid
  if (contract.status === 'draft') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900">This contract is not ready for signing yet.</h2>
        <p className="text-sm text-gray-500 mt-2">Please contact the sender for an updated link.</p>
      </div>
    )
  }

  // Active signing form
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
          <FileSignature className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{contract.title}</h1>
          <p className="text-sm text-gray-500">
            {contract.client?.name}
            {contract.client?.company ? ` · ${contract.client.company}` : ''}
          </p>
        </div>
      </div>

      {/* Contract body */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 max-h-[500px] overflow-y-auto">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {contract.content}
        </pre>
      </div>

      {/* Signature form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Sign this contract</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={signerEmail}
              onChange={e => setSignerEmail(e.target.value)}
              placeholder="john@company.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type your name as signature <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Type your full name exactly as it appears above. This constitutes your electronic signature.
          </p>
          <input
            type="text"
            value={signature}
            onChange={e => setSignature(e.target.value)}
            placeholder="John Smith"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-serif text-lg italic text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          {signature && (
            <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 font-serif text-2xl italic text-gray-800">
              {signature}
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-gray-600">
            I have read and agree to the terms of this contract. I understand that my typed name
            constitutes a legally binding electronic signature.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button
          onClick={handleSign}
          loading={isPending}
          disabled={!signerName || !signerEmail || !signature || !agreed}
          className="w-full justify-center"
        >
          <CheckCircle className="h-4 w-4" />
          Sign Contract
        </Button>
      </div>
    </div>
  )
}
