'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenantStore } from '@/stores/tenant'

export function useTenant() {
  const { tenant, setTenant } = useTenantStore()
  const supabase = createClient()

  useEffect(() => {
    async function fetchTenant() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) setTenant(data)
    }

    if (!tenant) fetchTenant()
  }, [tenant, setTenant, supabase])

  return tenant
}
