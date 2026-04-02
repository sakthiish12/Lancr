import type { Currency } from '@/types'

export const CURRENCIES: Record<Currency, { symbol: string; name: string; locale: string }> = {
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
}

export const GST_RATES: Record<string, number> = {
  SG: 9,    // Singapore GST 9%
  MY: 8,    // Malaysia SST 8%
  ID: 11,   // Indonesia PPN 11%
}

export const DEFAULT_CURRENCY: Currency = 'SGD'
export const DEFAULT_GST_RATE = 9

export const QUOTE_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  sent: { label: 'Sent', color: 'blue' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  expired: { label: 'Expired', color: 'orange' },
} as const

export const INVOICE_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  sent: { label: 'Sent', color: 'blue' },
  viewed: { label: 'Viewed', color: 'purple' },
  paid: { label: 'Paid', color: 'green' },
  overdue: { label: 'Overdue', color: 'red' },
  cancelled: { label: 'Cancelled', color: 'gray' },
} as const

export const CONTRACT_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  sent: { label: 'Sent', color: 'blue' },
  signed: { label: 'Signed', color: 'green' },
} as const

export const CONTRACT_TEMPLATES = {
  service_agreement: { label: 'Service Agreement' },
  nda: { label: 'Non-Disclosure Agreement' },
  retainer: { label: 'Retainer Agreement' },
} as const

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/quotes', label: 'Quotes', icon: 'FileText' },
  { href: '/dashboard/contracts', label: 'Contracts', icon: 'FileSignature' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: 'Receipt' },
  { href: '/dashboard/clients', label: 'Clients', icon: 'Users' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
] as const
