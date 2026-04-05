import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? '').trim(), {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-03-25.dahlia' as any,
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const invoiceId = session.metadata?.invoice_id
      const tenantId = session.metadata?.tenant_id

      if (invoiceId && session.payment_status === 'paid') {
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null

        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'stripe',
            stripe_payment_id: paymentIntentId,
          })
          .eq('id', invoiceId)
          .neq('status', 'paid')

        if (tenantId) {
          await supabase.from('payments').insert({
            tenant_id: tenantId,
            invoice_id: invoiceId,
            amount_cents: session.amount_total ?? 0,
            currency: (session.currency ?? 'sgd').toUpperCase(),
            method: 'stripe',
            status: 'completed',
            reference: paymentIntentId,
            metadata: { stripe_session_id: session.id },
          })
        }
      }
    }

    // Pro subscription activated
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.type === 'pro_subscription' && session.metadata?.tenant_id) {
        await supabase.from('tenants').update({ plan: 'pro' }).eq('id', session.metadata.tenant_id)
      }
    }

    // Pro subscription cancelled / lapsed
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const tenantId = sub.metadata?.tenant_id
      if (tenantId) {
        await supabase.from('tenants').update({ plan: 'free' }).eq('id', tenantId)
      }
    }

    // Backup handler — fires after checkout.session.completed for card payments
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata?.invoice_id
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_method: 'stripe',
            stripe_payment_id: pi.id,
          })
          .eq('id', invoiceId)
          .neq('status', 'paid')
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true })
}
