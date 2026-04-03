import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { QuotePDF } from '@/lib/pdf/QuotePDF'
import type { Quote, QuoteLineItem, Client, Tenant } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('*, client:clients(*), line_items:quote_line_items(*)')
    .eq('id', id)
    .eq('tenant_id', user.id)
    .single()

  if (error || !quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const typedQuote = quote as Quote & { client: Client; line_items: QuoteLineItem[] }
  const typedTenant = tenant as Tenant

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stream = await renderToStream(
    createElement(QuotePDF, { quote: typedQuote, tenant: typedTenant }) as any
  )

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${typedQuote.quote_number}.pdf"`,
    },
  })
}
