import { create } from 'zustand'
import type { Tenant } from '@/types'

interface TenantStore {
  tenant: Tenant | null
  setTenant: (tenant: Tenant | null) => void
}

export const useTenantStore = create<TenantStore>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
}))
