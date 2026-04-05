// Free plan limits
export const FREE_CLIENT_LIMIT = 3
export const FREE_INVOICE_LIMIT = 5

export const PRO_PRICE_SGD = 5

export function isPro(plan: string | null | undefined): boolean {
  return plan === 'pro'
}

export function canCreateClient(plan: string, clientCount: number): boolean {
  if (isPro(plan)) return true
  return clientCount < FREE_CLIENT_LIMIT
}

export function canCreateInvoice(plan: string, invoiceCount: number): boolean {
  if (isPro(plan)) return true
  return invoiceCount < FREE_INVOICE_LIMIT
}

// Pro-only features
export const PRO_FEATURES = [
  'Reports & P&L',
  'Expense tracking',
  'Leads pipeline',
  'Recurring invoices',
  'Payment reminders',
  'Unlimited clients',
  'Unlimited invoices',
]

export const FREE_FEATURES = [
  `Up to ${FREE_CLIENT_LIMIT} clients`,
  `Up to ${FREE_INVOICE_LIMIT} invoices`,
  'Quotes & contracts',
  'E-signatures',
  'PayNow & Stripe payments',
  'Client payment portal',
  'PDF exports',
]
