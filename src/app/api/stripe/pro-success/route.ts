import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2026-03-25.dahlia' as any,
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (!sessionId) return NextResponse.redirect(new URL('/upgrade', request.url))

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const tenantId = session.metadata?.tenant_id

    if (tenantId && session.payment_status === 'paid') {
      const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await supabase.from('tenants').update({ plan: 'pro' }).eq('id', tenantId)
    }
  } catch {
    // still redirect
  }

  return NextResponse.redirect(new URL('/upgrade?upgraded=true', request.url))
}
