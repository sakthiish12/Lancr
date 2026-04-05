import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'

interface Props {
  feature: string
  description?: string
}

export function ProGate({ feature, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 py-20 text-center px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 mb-4">
        <Lock className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{feature} is a Pro feature</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        {description ?? `Upgrade to WorkInvoice Pro to unlock ${feature} and more — just S$5/month.`}
      </p>
      <Link
        href="/upgrade"
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
      >
        <Zap className="h-4 w-4" />
        Upgrade to Pro — S$5/mo
      </Link>
    </div>
  )
}
