import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CheckCircle, X, Zap, Building2 } from 'lucide-react'
import { FREE_FEATURES, PRO_FEATURES, FREE_CLIENT_LIMIT, FREE_INVOICE_LIMIT } from '@/lib/plan'

export default async function UpgradePage(props: { searchParams?: Promise<{ error?: string; upgraded?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase.from('tenants').select('plan').eq('id', user.id).single()
  const isPro = tenant?.plan === 'pro'
  const searchParams = await (props.searchParams ?? Promise.resolve({})) as { error?: string; upgraded?: string }
  const stripeError = searchParams?.error
  const justUpgraded = searchParams?.upgraded === 'true'

  return (
    <div>
      <Header title="Upgrade to Pro" />
      <div className="p-6 max-w-3xl space-y-8">

        {stripeError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Payment setup error</p>
            <p className="text-xs text-red-600 mt-1">{stripeError}</p>
          </div>
        )}

        {justUpgraded && !isPro && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Payment received! Activating your Pro plan…</p>
            <p className="text-xs text-blue-600 mt-1">Your account will upgrade in a moment. Refresh the page if it doesn&apos;t update.</p>
          </div>
        )}

        {isPro && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">You&apos;re on Lancr Pro</p>
                <p className="text-sm text-green-600 mt-0.5">All features are unlocked. Thank you for your support!</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Plans &amp; Pricing</h1>
          <p className="mt-2 text-gray-500">From solo freelancer to full agency — Lancr scales with you.</p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">S$0</span>
              <span className="text-sm text-gray-400">/ forever</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Great for getting started</p>

            <ul className="space-y-2.5 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 opacity-35">
                  <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{f}</span>
                </li>
              ))}
            </ul>

            <div className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-400">
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-violet-600 bg-white p-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">RECOMMENDED</span>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-2">Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">S$5</span>
              <span className="text-sm text-gray-400">/ month</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">For serious freelancers</p>

            <ul className="space-y-2.5 mb-8">
              {[...FREE_FEATURES.map(f =>
                f.includes(`${FREE_CLIENT_LIMIT} clients`) ? 'Unlimited clients' :
                f.includes(`${FREE_INVOICE_LIMIT} invoices`) ? 'Unlimited invoices' : f
              ), ...PRO_FEATURES].filter((v, i, a) => a.indexOf(v) === i).map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-violet-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{f}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="w-full rounded-xl bg-green-100 py-3 text-center text-sm font-semibold text-green-700">
                ✓ Active
              </div>
            ) : (
              <a
                href="/api/stripe/pro-checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Upgrade now — S$5/mo
              </a>
            )}

            <p className="mt-3 text-center text-xs text-gray-400">Cancel anytime. No contracts.</p>
          </div>

          {/* Agency */}
          <div className="rounded-2xl border-2 border-gray-800 bg-gray-900 p-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white">FOR AGENCIES</span>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">Agency</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">S$49</span>
              <span className="text-sm text-gray-400">/ month</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">For freelance studios &amp; small agencies</p>

            <ul className="space-y-2.5 mb-8">
              {[
                'Everything in Pro',
                'Up to 10 freelancer seats',
                'Unified admin dashboard',
                'Revenue across all team members',
                'White-label client portal',
                'Invite members by email',
                'Team member management',
                'Agency branding & slug',
              ].map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-200">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="/org/new"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              Create your agency
            </a>

            <p className="mt-3 text-center text-xs text-gray-500">Includes Stripe checkout · Cancel anytime</p>
          </div>
        </div>

        {/* Feature breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Free</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-violet-600 uppercase tracking-wide">Pro</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-800 uppercase tracking-wide">Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Clients', `Up to ${FREE_CLIENT_LIMIT}`, 'Unlimited', 'Unlimited'],
                ['Invoices per month', `Up to ${FREE_INVOICE_LIMIT}`, 'Unlimited', 'Unlimited'],
                ['Quotes & contracts', '✓', '✓', '✓'],
                ['E-signatures', '✓', '✓', '✓'],
                ['PayNow & Stripe payments', '✓', '✓', '✓'],
                ['Client payment portal', '✓', '✓', '✓'],
                ['PDF exports', '✓', '✓', '✓'],
                ['Reports & P&L dashboard', '—', '✓', '✓'],
                ['Expense tracking', '—', '✓', '✓'],
                ['Leads pipeline (CRM)', '—', '✓', '✓'],
                ['Recurring invoices', '—', '✓', '✓'],
                ['Payment reminders', '—', '✓', '✓'],
                ['Team seats', '—', '—', 'Up to 10'],
                ['Admin dashboard (all members)', '—', '—', '✓'],
                ['White-label portal URL', '—', '—', '✓'],
                ['Member invite & management', '—', '—', '✓'],
              ].map(([feature, free, pro, agency]) => (
                <tr key={feature}>
                  <td className="px-6 py-3 text-sm text-gray-700">{feature}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-400">{free}</td>
                  <td className="px-6 py-3 text-center text-sm font-medium text-violet-700">{pro}</td>
                  <td className="px-6 py-3 text-center text-sm font-medium text-gray-800">{agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
