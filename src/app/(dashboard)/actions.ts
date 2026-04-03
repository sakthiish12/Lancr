'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendInvoiceEmail, sendQuoteEmail } from '@/lib/email/resend'
import type { Currency, QuoteStatus, InvoiceStatus, Invoice, Quote, Tenant, Client, InvoiceLineItem, QuoteLineItem } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItemInput {
  description: string
  quantity: number
  unit_price_cents: number
  tax_rate: number
}

interface CreateClientData {
  name: string
  email: string
  company?: string
  phone?: string
  address?: string
  currency?: Currency
  notes?: string
}

interface CreateQuoteData {
  client_id: string
  title: string
  currency: Currency
  valid_until?: string
  notes?: string
  line_items: LineItemInput[]
}

interface CreateInvoiceData {
  client_id: string
  title?: string
  currency: Currency
  due_date?: string
  notes?: string
  line_items: LineItemInput[]
}

type ActionResult = { error: string } | { success: true; id?: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTotals(line_items: LineItemInput[]) {
  let subtotal_cents = 0
  let tax_cents = 0

  for (const item of line_items) {
    const amount = Math.round(item.quantity * item.unit_price_cents)
    subtotal_cents += amount
    tax_cents += Math.round(amount * (item.tax_rate / 100))
  }

  return {
    subtotal_cents,
    tax_cents,
    total_cents: subtotal_cents + tax_cents,
  }
}

// ─── CLIENT ACTIONS ───────────────────────────────────────────────────────────

export async function createClientAction(data: CreateClientData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      tenant_id: user.id,
      name: data.name,
      email: data.email,
      company: data.company ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      currency: data.currency ?? 'SGD',
      notes: data.notes ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  return { success: true, id: client.id }
}

export async function updateClientAction(id: string, data: Partial<CreateClientData>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${id}`)
  return { success: true }
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  return { success: true }
}

// ─── QUOTE ACTIONS ────────────────────────────────────────────────────────────

export async function createQuoteAction(data: CreateQuoteData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // Generate quote number
  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', user.id)

  const quoteNumber = `QT-${String((count ?? 0) + 1).padStart(4, '0')}`
  const totals = calcTotals(data.line_items)

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      tenant_id: user.id,
      client_id: data.client_id,
      quote_number: quoteNumber,
      status: 'draft',
      title: data.title,
      currency: data.currency,
      subtotal_cents: totals.subtotal_cents,
      tax_cents: totals.tax_cents,
      total_cents: totals.total_cents,
      valid_until: data.valid_until ?? null,
      notes: data.notes ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  if (data.line_items.length > 0) {
    const lineItems = data.line_items.map((item, idx) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      tax_rate: item.tax_rate,
      amount_cents: Math.round(item.quantity * item.unit_price_cents),
      sort_order: idx,
    }))

    const { error: lineError } = await supabase.from('quote_line_items').insert(lineItems)
    if (lineError) return { error: lineError.message }
  }

  revalidatePath('/dashboard/quotes')
  return { success: true, id: quote.id }
}

export async function updateQuoteAction(
  id: string,
  data: Partial<Omit<CreateQuoteData, 'line_items'>>
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('quotes')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/quotes')
  revalidatePath(`/dashboard/quotes/${id}`)
  return { success: true }
}

export async function deleteQuoteAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/quotes')
  return { success: true }
}

export async function updateQuoteStatusAction(id: string, status: QuoteStatus): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/quotes')
  revalidatePath(`/dashboard/quotes/${id}`)
  return { success: true }
}

// ─── INVOICE ACTIONS ──────────────────────────────────────────────────────────

export async function createInvoiceAction(data: CreateInvoiceData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', user.id)

  const invoiceNumber = `INV-${String((count ?? 0) + 1).padStart(4, '0')}`
  const totals = calcTotals(data.line_items)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      tenant_id: user.id,
      client_id: data.client_id,
      invoice_number: invoiceNumber,
      status: 'draft',
      currency: data.currency,
      subtotal_cents: totals.subtotal_cents,
      tax_cents: totals.tax_cents,
      total_cents: totals.total_cents,
      due_date: data.due_date ?? null,
      notes: data.notes ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  if (data.line_items.length > 0) {
    const lineItems = data.line_items.map((item, idx) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      tax_rate: item.tax_rate,
      amount_cents: Math.round(item.quantity * item.unit_price_cents),
      sort_order: idx,
    }))

    const { error: lineError } = await supabase.from('invoice_line_items').insert(lineItems)
    if (lineError) return { error: lineError.message }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true, id: invoice.id }
}

export async function createInvoiceFromQuoteAction(quoteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // Fetch the quote with line items
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*, line_items:quote_line_items(*)')
    .eq('id', quoteId)
    .eq('tenant_id', user.id)
    .single()

  if (quoteError || !quote) return { error: quoteError?.message ?? 'Quote not found' }

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', user.id)

  const invoiceNumber = `INV-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      tenant_id: user.id,
      client_id: quote.client_id,
      quote_id: quoteId,
      invoice_number: invoiceNumber,
      status: 'draft',
      currency: quote.currency,
      subtotal_cents: quote.subtotal_cents,
      tax_cents: quote.tax_cents,
      total_cents: quote.total_cents,
      notes: quote.notes,
    })
    .select('id')
    .single()

  if (invoiceError) return { error: invoiceError.message }

  if (quote.line_items && quote.line_items.length > 0) {
    const lineItems = quote.line_items.map((item: {
      description: string
      quantity: number
      unit_price_cents: number
      tax_rate: number
      amount_cents: number
      sort_order: number
    }) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      tax_rate: item.tax_rate,
      amount_cents: item.amount_cents,
      sort_order: item.sort_order,
    }))

    const { error: lineError } = await supabase.from('invoice_line_items').insert(lineItems)
    if (lineError) return { error: lineError.message }
  }

  revalidatePath('/dashboard/invoices')
  return { success: true, id: invoice.id }
}

export async function updateInvoiceAction(
  id: string,
  data: Partial<Omit<CreateInvoiceData, 'line_items'>>
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/invoices')
  revalidatePath(`/dashboard/invoices/${id}`)
  return { success: true }
}

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/invoices')
  return { success: true }
}

export async function updateInvoiceStatusAction(id: string, status: InvoiceStatus): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const updateData: Record<string, unknown> = { status }
  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/invoices')
  revalidatePath(`/dashboard/invoices/${id}`)
  return { success: true }
}

// ─── Contract Actions ──────────────────────────────────────────────────────────

interface CreateContractData {
  client_id: string
  quote_id?: string
  template_type: 'service_agreement' | 'nda' | 'retainer'
  title: string
  content: string
}

export async function createContractAction(data: CreateContractData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      tenant_id: user.id,
      client_id: data.client_id,
      quote_id: data.quote_id ?? null,
      template_type: data.template_type,
      title: data.title,
      content: data.content,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contracts')
  return { success: true, id: contract.id }
}

export async function updateContractAction(
  id: string,
  data: { title?: string; content?: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('contracts')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contracts')
  revalidatePath(`/dashboard/contracts/${id}`)
  return { success: true }
}

export async function sendContractAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'sent' })
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contracts')
  revalidatePath(`/dashboard/contracts/${id}`)
  return { success: true }
}

export async function deleteContractAction(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contracts')
  return { success: true }
}

export async function signContractAction(
  signingToken: string,
  data: { signer_name: string; signer_email: string; signature_data: string }
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contracts')
    .update({
      status: 'signed',
      signer_name: data.signer_name,
      signer_email: data.signer_email,
      signature_data: data.signature_data,
      signed_at: new Date().toISOString(),
    })
    .eq('signing_token', signingToken)
    .eq('status', 'sent')

  if (error) return { error: error.message }
  return { success: true }
}

// ─── TENANT ACTIONS ───────────────────────────────────────────────────────────

interface UpdateTenantData {
  name?: string
  business_name?: string
  address?: string
  currency?: Currency
  gst_registered?: boolean
  gst_number?: string | null
}

export async function updateTenantAction(data: UpdateTenantData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('tenants')
    .update(data)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/business')
  revalidatePath('/dashboard/settings/tax')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── EMAIL ACTIONS ────────────────────────────────────────────────────────────

export async function sendInvoiceEmailAction(invoiceId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const [{ data: invoice }, { data: tenant }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, client:clients(*), line_items:invoice_line_items(*)')
      .eq('id', invoiceId)
      .eq('tenant_id', user.id)
      .single(),
    supabase
      .from('tenants')
      .select('*')
      .eq('id', user.id)
      .single(),
  ])

  if (!invoice || !invoice.client) return { error: 'Invoice or client not found' }
  if (!tenant) return { error: 'Tenant not found' }

  try {
    await sendInvoiceEmail({
      invoice: invoice as Invoice & { line_items: InvoiceLineItem[] },
      tenant: tenant as Tenant,
      client: invoice.client as Client,
    })

    // Mark as sent if still draft
    if (invoice.status === 'draft') {
      await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId)
        .eq('tenant_id', user.id)
      revalidatePath(`/dashboard/invoices/${invoiceId}`)
      revalidatePath('/dashboard/invoices')
    }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to send email' }
  }
}

export async function sendQuoteEmailAction(quoteId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const [{ data: quote }, { data: tenant }] = await Promise.all([
    supabase
      .from('quotes')
      .select('*, client:clients(*), line_items:quote_line_items(*)')
      .eq('id', quoteId)
      .eq('tenant_id', user.id)
      .single(),
    supabase
      .from('tenants')
      .select('*')
      .eq('id', user.id)
      .single(),
  ])

  if (!quote || !quote.client) return { error: 'Quote or client not found' }
  if (!tenant) return { error: 'Tenant not found' }

  try {
    await sendQuoteEmail({
      quote: quote as Quote & { line_items: QuoteLineItem[] },
      tenant: tenant as Tenant,
      client: quote.client as Client,
    })

    // Mark as sent if still draft
    if (quote.status === 'draft') {
      await supabase
        .from('quotes')
        .update({ status: 'sent' })
        .eq('id', quoteId)
        .eq('tenant_id', user.id)
      revalidatePath(`/dashboard/quotes/${quoteId}`)
      revalidatePath('/dashboard/quotes')
    }

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to send email' }
  }
}
