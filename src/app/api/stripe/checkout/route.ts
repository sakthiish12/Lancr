import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? '').trim(), {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-03-25.dahlia' as any,
})

function getPaymentMethods(currency: string): string[] {
  const c = currency.toUpperCase()
  if (c === 'SGD') return ['card', 'paynow', 'grabpay']
  if (c === 'MYR') return ['card', 'fpx', 'grabpay']
  return ['card']
}

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, client:clients(*), tenant:tenants(*)')
      .eq('id', invoiceId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    const tenant = invoice.tenant as { business_name: string | null; name: string; portal_slug: string }
    const client = invoice.client as { email: string; name: string } | null
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim()
    const portalSlug = tenant.portal_slug

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_method_types: getPaymentMethods(invoice.currency) as any,
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment to ${tenant.business_name ?? tenant.name}`,
            },
            unit_amount: invoice.total_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        tenant_id: invoice.tenant_id,
      },
      ...(client?.email ? { customer_email: client.email } : {}),
      success_url: `${appUrl}/portal/${portalSlug}/invoice/${invoice.id}?success=true`,
      cancel_url: `${appUrl}/portal/${portalSlug}/invoice/${invoice.id}?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
