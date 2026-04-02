export type TenantStatus = 'active' | 'inactive' | 'suspended'
export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
export type ContractStatus = 'draft' | 'sent' | 'signed'
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'paynow' | 'stripe' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type ContractTemplateType = 'service_agreement' | 'nda' | 'retainer'
export type Currency = 'SGD' | 'MYR' | 'USD' | 'IDR'

export interface Tenant {
  id: string
  name: string
  business_name: string | null
  email: string
  logo_url: string | null
  currency: Currency
  gst_registered: boolean
  gst_number: string | null
  address: string | null
  created_at: string
}

export interface Client {
  id: string
  tenant_id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  currency: Currency
  notes: string | null
  created_at: string
}

export interface QuoteLineItem {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price_cents: number
  tax_rate: number
  amount_cents: number
  sort_order: number
}

export interface Quote {
  id: string
  tenant_id: string
  client_id: string
  quote_number: string
  status: QuoteStatus
  title: string
  currency: Currency
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  valid_until: string | null
  notes: string | null
  created_at: string
  updated_at: string
  client?: Client
  line_items?: QuoteLineItem[]
}

export interface Contract {
  id: string
  tenant_id: string
  client_id: string
  quote_id: string | null
  template_type: ContractTemplateType
  title: string
  content: string
  status: ContractStatus
  signer_name: string | null
  signer_email: string | null
  signed_at: string | null
  signer_ip: string | null
  signature_data: string | null
  created_at: string
  client?: Client
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price_cents: number
  tax_rate: number
  amount_cents: number
  sort_order: number
}

export interface Invoice {
  id: string
  tenant_id: string
  client_id: string
  quote_id: string | null
  invoice_number: string
  status: InvoiceStatus
  currency: Currency
  subtotal_cents: number
  tax_cents: number
  total_cents: number
  due_date: string | null
  paid_at: string | null
  payment_method: PaymentMethod | null
  stripe_payment_id: string | null
  notes: string | null
  created_at: string
  client?: Client
  line_items?: InvoiceLineItem[]
}

export interface Payment {
  id: string
  tenant_id: string
  invoice_id: string
  amount_cents: number
  currency: Currency
  method: PaymentMethod
  status: PaymentStatus
  reference: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DashboardMetrics {
  total_revenue_cents: number
  outstanding_cents: number
  quote_conversion_rate: number
  upcoming_payments: number
  currency: Currency
}
