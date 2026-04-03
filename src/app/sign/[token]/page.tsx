import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SigningPage } from './SigningPage'
import type { Contract, Client } from '@/types'

export default async function PublicSignPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Use supabase client (no user session required for reading by signing_token)
  const supabase = await createClient()

  const { data: contract, error } = await supabase
    .from('contracts')
    .select('id, title, content, status, signer_name, signer_email, signed_at, signing_token, client:clients(name, company)')
    .eq('signing_token', token)
    .single()

  if (error || !contract) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <SigningPage
          contract={contract as unknown as Contract & { client: Client | null; signing_token: string }}
          token={token}
        />
      </div>
    </div>
  )
}
