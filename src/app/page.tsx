import Link from 'next/link'
import { Zap, ArrowRight, CheckCircle, X, BarChart2, Receipt, Target, RefreshCw, Bell, Users } from 'lucide-react'

const FREE_FEATURES = [
  'Up to 3 clients',
  'Up to 5 invoices',
  'Quotes & contracts',
  'E-signatures',
  'PayNow & Stripe payments',
  'Client payment portal',
  'PDF exports',
]

const FREE_NOT_INCLUDED = [
  'Reports & P&L dashboard',
  'Expense tracking',
  'Leads pipeline',
  'Recurring invoices',
  'Payment reminders',
  'Unlimited clients & invoices',
]

const PRO_FEATURES_ALL = [
  'Unlimited clients',
  'Unlimited invoices',
  'Quotes & contracts',
  'E-signatures',
  'PayNow & Stripe payments',
  'Client payment portal',
  'PDF exports',
  'Reports & P&L dashboard',
  'Expense tracking',
  'Leads pipeline (CRM)',
  'Recurring invoices',
  'Payment reminders',
]

const proFeatureCards = [
  {
    icon: BarChart2,
    title: 'Reports & P&L',
    desc: 'Monthly revenue vs expenses chart, YTD net profit, top clients, tax summary — everything your accountant needs.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Receipt,
    title: 'Expense Tracking',
    desc: 'Log business costs by category. See your true net profit, not just revenue.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Target,
    title: 'Leads Pipeline',
    desc: 'Track prospects from first contact to signed contract. Never lose a lead.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Invoices',
    desc: 'Set monthly retainers once. Lancr auto-generates the next invoice on schedule.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Bell,
    title: 'Payment Reminders',
    desc: 'One-click reminder email with Pay Now button. Chase payments without the awkward messages.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Users,
    title: 'Unlimited Everything',
    desc: 'No caps on clients or invoices. Grow your business without hitting a wall.',
    color: 'bg-cyan-100 text-cyan-600',
  },
]

// Browser mockup wrapper
function BrowserMockup({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-2xl">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400 font-mono truncate">
          {url}
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  )
}

// Fake dashboard screenshot
function DashboardMockup() {
  return (
    <BrowserMockup url="app.lancr.io/dashboard">
      <div className="flex h-80">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-100 bg-gray-50 p-3 flex flex-col gap-1 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-3 px-2 pt-1">
            <div className="h-5 w-5 rounded bg-violet-600 flex items-center justify-center"><Zap className="h-3 w-3 text-white" /></div>
            <span className="text-xs font-bold text-gray-900">Lancr</span>
          </div>
          {['Dashboard', 'Quotes', 'Contracts', 'Invoices', 'Clients', 'Leads', 'Expenses', 'Reports'].map((item, i) => (
            <div key={item} className={`rounded-md px-2 py-1.5 text-xs font-medium ${i === 0 ? 'bg-violet-100 text-violet-700' : 'text-gray-500'}`}>{item}</div>
          ))}
          <div className="mt-auto rounded-lg bg-violet-50 p-2">
            <p className="text-[10px] font-bold text-violet-800">Lancr Pro</p>
            <p className="text-[10px] text-violet-600 mt-0.5">S$5/month</p>
          </div>
        </div>
        {/* Main */}
        <div className="flex-1 p-4 overflow-hidden">
          <p className="text-xs font-semibold text-gray-900 mb-3">Dashboard</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[['S$12,450', 'Revenue', 'text-green-600'], ['S$3,200', 'Outstanding', 'text-orange-500'], ['4', 'Active Quotes', 'text-blue-600'], ['8', 'Clients', 'text-violet-600']].map(([v, l, c]) => (
              <div key={l} className="rounded-lg border border-gray-100 bg-white p-2.5">
                <p className={`text-sm font-bold ${c}`}>{v}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-100 bg-white p-3">
              <p className="text-[10px] font-semibold text-gray-500 mb-2">Recent Activity</p>
              {[['INV-0012 paid', 'Acme Corp', 'text-green-600'], ['INV-0011 sent', 'ByteWorks', 'text-blue-600'], ['QT-0005 approved', 'Designify', 'text-violet-600']].map(([a, b, c]) => (
                <div key={a} className="flex items-center gap-2 mb-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${c.replace('text-', 'bg-')}`} />
                  <div><p className={`text-[10px] font-medium ${c}`}>{a}</p><p className="text-[10px] text-gray-400">{b}</p></div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-3">
              <p className="text-[10px] font-semibold text-gray-500 mb-2">Upcoming Payments</p>
              {[['INV-0013', 'S$2,400', 'Due in 3d'], ['INV-0010', 'S$800', 'Overdue 2d']].map(([inv, amt, due]) => (
                <div key={inv} className="flex items-center justify-between mb-1.5">
                  <div><p className="text-[10px] font-medium text-gray-700">{inv}</p><p className={`text-[10px] ${due.includes('Overdue') ? 'text-red-500' : 'text-gray-400'}`}>{due}</p></div>
                  <p className="text-[10px] font-bold text-gray-900">{amt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserMockup>
  )
}

// Fake reports screenshot
function ReportsMockup() {
  const bars = [30, 55, 40, 80, 65, 90, 45, 70, 85, 60, 95, 100]
  const exps = [15, 20, 18, 25, 30, 22, 19, 28, 35, 24, 40, 38]
  return (
    <BrowserMockup url="app.lancr.io/reports">
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-900 mb-3">Reports — 2026</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[['S$28,400', 'YTD Revenue', 'text-green-600'], ['S$6,200', 'YTD Expenses', 'text-red-500'], ['S$22,200', 'Net Profit', 'text-violet-700'], ['S$2,556', 'Tax Collected', 'text-blue-600']].map(([v, l, c]) => (
            <div key={l} className="rounded-lg border border-gray-100 bg-white p-2.5">
              <p className={`text-sm font-bold ${c}`}>{v}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-gray-100 bg-white p-3 mb-2">
          <p className="text-[10px] font-semibold text-gray-500 mb-2">Revenue vs Expenses (12 months)</p>
          <div className="flex items-end gap-1 h-20">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex items-end gap-0.5 h-full">
                <div className="flex-1 bg-violet-300 rounded-t" style={{ height: `${h}%` }} />
                <div className="flex-1 bg-red-200 rounded-t" style={{ height: `${exps[i]}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <p className="text-[10px] font-semibold text-gray-500 mb-2">Top Clients</p>
            {[['Acme Corp', 'S$8,200'], ['ByteWorks', 'S$6,400'], ['Designify', 'S$4,100']].map(([c, v]) => (
              <div key={c} className="flex justify-between mb-1.5">
                <p className="text-[10px] text-gray-600">{c}</p>
                <p className="text-[10px] font-semibold text-gray-900">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <p className="text-[10px] font-semibold text-gray-500 mb-2">Expenses by Category</p>
            {[['Software', 'S$2,400'], ['Travel', 'S$1,800'], ['Marketing', 'S$1,200']].map(([c, v]) => (
              <div key={c} className="flex justify-between mb-1.5">
                <p className="text-[10px] text-gray-600">{c}</p>
                <p className="text-[10px] font-semibold text-red-600">-{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserMockup>
  )
}

// Fake invoice+portal screenshot
function InvoiceMockup() {
  return (
    <BrowserMockup url="lancr-indol.vercel.app/portal/yourslug/invoice/inv-001">
      <div className="p-5 max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded bg-violet-600 flex items-center justify-center"><Zap className="h-3 w-3 text-white" /></div>
          <span className="text-xs font-bold text-gray-900">Freelancer Studio</span>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 mb-3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] text-gray-400">Invoice from Freelancer Studio</p>
              <p className="text-sm font-bold text-gray-900">INV-0012</p>
              <p className="text-[10px] text-gray-500">To: Acme Corp</p>
            </div>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Payment due</span>
          </div>
          <div className="border-t border-gray-100 pt-2 space-y-1">
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Web Design</span><span className="text-gray-700">S$2,000</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">GST 9%</span><span className="text-gray-700">S$180</span></div>
            <div className="flex justify-between text-[10px] font-bold pt-1 border-t border-gray-100"><span>Total due</span><span>S$2,180</span></div>
          </div>
        </div>
        <button className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white">
          Pay S$2,180 →
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">🔒 Secure · PayNow · Card · GrabPay</p>
      </div>
    </BrowserMockup>
  )
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Lancr</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href="/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Built for Singapore & Southeast Asian freelancers
        </div>
        <h1 className="max-w-3xl mx-auto text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Quotes → Contracts → Invoices →{' '}
          <span className="text-violet-600">Paid.</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-gray-500 mb-10">
          The only freelance tool built for Southeast Asia. GST-compliant, PayNow-ready,
          and designed to get you paid faster — starting at S$0.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup" className="flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 font-semibold text-white hover:bg-violet-700 transition-colors text-base">
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="rounded-xl border border-gray-300 px-7 py-3.5 font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-base">
            Sign in
          </Link>
        </div>

        {/* Dashboard screenshot */}
        <div className="mx-auto max-w-4xl">
          <DashboardMockup />
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-5">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <span>✓ GST & InvoiceNow ready</span>
          <span>✓ PayNow · GrabPay · Stripe · FPX</span>
          <span>✓ SGD · MYR · IDR · USD</span>
          <span>✓ E-signatures included</span>
          <span>✓ Client payment portal</span>
        </div>
      </section>

      {/* Client portal feature */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Client Payment Portal
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your clients pay online — you just get the money
            </h2>
            <p className="text-gray-500 mb-6">
              Every invoice gets a unique payment link. Clients click, choose PayNow, card, or GrabPay,
              and pay in seconds. Invoice auto-marks as paid. No reconciliation needed.
            </p>
            <ul className="space-y-3">
              {['PayNow QR — scan from any SG bank app', 'Credit & debit card payments', 'GrabPay (SG & MY)', 'FPX online banking (Malaysia)', 'Auto-reconcile — no manual marking'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <InvoiceMockup />
        </div>
      </section>

      {/* Pro features */}
      <section id="features" className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 mb-4">
              <Zap className="h-3 w-3" />
              Lancr Pro — S$5/month
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything to run a real freelance business</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Pro unlocks the tools that turn your freelance work into an actual business — reports, expense tracking, leads, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {proFeatureCards.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Reports mockup */}
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Reports Dashboard</p>
          </div>
          <ReportsMockup />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing. No surprises.</h2>
            <p className="text-gray-500">Start free. Upgrade when you grow.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">S$0</span>
                  <span className="text-sm text-gray-400">/ forever</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">Perfect for getting started</p>
              </div>
              <Link href="/signup" className="block w-full rounded-xl border border-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-violet-600 hover:bg-violet-50 transition-colors mb-8">
                Get started free
              </Link>
              <ul className="space-y-3">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
                {FREE_NOT_INCLUDED.map(f => (
                  <li key={f} className="flex items-center gap-3 opacity-40">
                    <X className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="text-sm text-gray-400">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-violet-600 bg-white p-8 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">MOST POPULAR</span>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-violet-600 mb-2">Pro</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">S$5</span>
                  <span className="text-sm text-gray-400">/ month</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">For serious freelancers</p>
              </div>
              <Link href="/signup?plan=pro" className="block w-full rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700 transition-colors mb-8">
                Start free trial
              </Link>
              <ul className="space-y-3">
                {PRO_FEATURES_ALL.map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-violet-500" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-center text-xs text-gray-400">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-violet-600 px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to get paid faster?</h2>
        <p className="text-violet-200 mb-8 max-w-md mx-auto">
          Join freelancers across Singapore, Malaysia, and Indonesia using Lancr to run their business.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-violet-700 hover:bg-violet-50 transition-colors">
          Start for free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-violet-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Lancr</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <span>Built for Singapore & Southeast Asia</span>
            <Link href="/login" className="hover:text-gray-700">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-700">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
