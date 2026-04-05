import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-03-25.dahlia' as any,
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { data: tenant } = await supabase.from('tenants').select('email, plan').eq('id', user.id).single()
  if (tenant?.plan === 'pro') return NextResponse.redirect(new URL('/upgrade', request.url))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_method_types: ['card'] as any,
      line_items: [{
        price_data: {
          currency: 'sgd',
          product_data: {
            name: 'Lancr Pro',
            description: 'Unlimited clients, invoices, reports, expenses, leads & more',
          },
          unit_amount: 500, // S$5.00
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      customer_email: tenant?.email ?? user.email ?? undefined,
      metadata: { tenant_id: user.id, type: 'pro_subscription' },
      success_url: `${appUrl}/api/stripe/pro-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade`,
    })

    return NextResponse.redirect(session.url!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[pro-checkout] Stripe error:', msg)
    return NextResponse.redirect(new URL(`/upgrade?error=${encodeURIComponent(msg)}`, request.url))
  }
}
