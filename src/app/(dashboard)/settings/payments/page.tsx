import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArrowLeft, CheckCircle, CreditCard, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('portal_slug, currency')
    .eq('id', user.id)
    .single()

  const portalUrl = tenant?.portal_slug
    ? `${process.env.NEXT_PUBLIC_APP_URL}/portal/${tenant.portal_slug}`
    : null

  const stripeConnected = !!process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key'

  return (
    <div>
      <Header title="Payment Methods" />
      <div className="p-6 max-w-2xl space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        {/* Stripe status */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
              <CreditCard className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-gray-900">Stripe</h2>
                {stripeConnected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Not connected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Accept card payments, PayNow (SGD), GrabPay, and FPX (MYR) through Stripe.
                Payments are automatically reconciled — invoices are marked paid the moment funds land.
              </p>

              {stripeConnected ? (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                  ✓ Stripe is active. Your clients can pay invoices online via the client portal.
                </div>
              ) : (
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Connect Stripe →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Enabled payment methods */}
        {stripeConnected && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Enabled payment methods</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Credit / Debit Card', currencies: 'All currencies', active: true },
                { name: 'PayNow', currencies: 'SGD only', active: true },
                { name: 'GrabPay', currencies: 'SGD, MYR', active: true },
                { name: 'FPX (Malaysia)', currencies: 'MYR only', active: true },
              ].map((method) => (
                <div key={method.name} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.currencies}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Payment methods shown to clients depend on the invoice currency. Manage methods in your{' '}
              <a href="https://dashboard.stripe.com/settings/payment_methods" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                Stripe dashboard →
              </a>
            </p>
          </div>
        )}

        {/* Client portal */}
        {portalUrl && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <Zap className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Your client portal</h2>
                <p className="text-sm text-gray-500 mb-3">
                  Clients click the link in their invoice email to view and pay. Share this URL directly if needed.
                </p>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 break-all">
                    {portalUrl}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank transfer info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Bank transfer</h2>
          <p className="text-sm text-gray-500">
            For clients who prefer bank transfer, add your bank details to invoice notes.
            You can manually mark invoices as paid in the Invoices section once payment is received.
          </p>
        </div>
      </div>
    </div>
  )
}
