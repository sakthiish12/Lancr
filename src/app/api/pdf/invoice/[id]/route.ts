import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { InvoicePDF } from '@/lib/pdf/InvoicePDF'
import type { Invoice, InvoiceLineItem, Client, Tenant } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), line_items:invoice_line_items(*)')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (error || !invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const typedInvoice = invoice as Invoice & { client: Client; line_items: InvoiceLineItem[] }
  const typedTenant = tenant as Tenant

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(
    createElement(InvoicePDF, { invoice: typedInvoice, tenant: typedTenant }) as any
  )

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${typedInvoice.invoice_number}.pdf"`,
    },
  })
}
