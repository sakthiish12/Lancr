import Link from 'next/link'
import { Zap, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  'Smart quoting with GST auto-calculation',
  'Contract generation & e-signatures',
  'Invoicing with PayNow & Stripe',
  'GST-compliant & InvoiceNow ready',
  'Multi-currency: SGD, MYR, USD, IDR',
  'Client portal with one-click payment',
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Lancr</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Built for Southeast Asian freelancers
        </div>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900">
          Run your freelance business{' '}
          <span className="text-violet-600">without the admin chaos</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-500">
          Quotes, contracts, invoices, and payments — all in one place.
          GST-compliant and InvoiceNow ready for Singapore & Southeast Asia.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 text-left max-w-lg">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-violet-500 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
