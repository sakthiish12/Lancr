import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? '').trim(), {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-03-25.dahlia' as any,
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orgSlug = searchParams.get('org')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim()

  try {
    let orgId: string | null = null

    // If upgrading an existing org
    if (orgSlug) {
      const svc = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: org } = await svc.from('organizations').select('id, stripe_subscription_id').eq('slug', orgSlug).single()
      if (org?.stripe_subscription_id) {
        return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
      }
      orgId = org?.id ?? null
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_method_types: ['card'] as any,
      line_items: [{
        price_data: {
          currency: 'sgd',
          product_data: {
            name: 'WorkInvoice Agency',
            description: 'Up to 10 freelancer seats · Admin dashboard · White-label portal',
          },
          unit_amount: 4900, // S$49/month
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      customer_email: user.email ?? undefined,
      metadata: {
        tenant_id: user.id,
        type: 'agency_subscription',
        ...(orgId ? { org_id: orgId } : {}),
        ...(orgSlug ? { org_slug: orgSlug } : {}),
      },
      success_url: orgSlug
        ? `${appUrl}/org/${orgSlug}?upgraded=true`
        : `${appUrl}/org/new?payment=success`,
      cancel_url: orgSlug ? `${appUrl}/org/${orgSlug}` : `${appUrl}/upgrade`,
    })

    return NextResponse.redirect(session.url!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[agency-checkout] Stripe error:', msg)
    return NextResponse.redirect(new URL(`/upgrade?error=${encodeURIComponent(msg)}`, request.url))
  }
}
