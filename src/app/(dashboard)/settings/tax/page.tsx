import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { TaxForm } from './TaxForm'
import type { Tenant } from '@/types'

export default async function TaxSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  return (
    <div>
      <Header title="Tax & Compliance" />
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tax & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your GST registration and default currency.
          </p>
        </div>
        <TaxForm tenant={tenant as Tenant} />
      </div>
    </div>
  )
}
