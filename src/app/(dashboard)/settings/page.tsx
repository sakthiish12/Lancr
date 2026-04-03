import { Header } from '@/components/layout/Header'
import { PageHeader } from '@/components/layout/PageHeader'
import { Building2, CreditCard, Bell, Shield, Globe } from 'lucide-react'

const settingsSections = [
  {
    icon: Building2,
    title: 'Business Profile',
    description: 'Update your business name, logo, and contact details',
    href: '/settings/business',
  },
  {
    icon: Globe,
    title: 'Tax & Compliance',
    description: 'Configure GST registration, tax rates, and InvoiceNow settings',
    href: '/settings/tax',
  },
  {
    icon: CreditCard,
    title: 'Payment Methods',
    description: 'Connect Stripe, set up PayNow QR, and manage bank details',
    href: '/settings/payments',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure email reminders for invoices and quotes',
    href: '/settings/notifications',
  },
  {
    icon: Shield,
    title: 'Account & Security',
    description: 'Manage your password, sessions, and account settings',
    href: '/settings/account',
  },
]

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your account and business preferences"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <a
                key={section.title}
                href={section.href}
                className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-violet-50">
                  <Icon className="h-5 w-5 text-gray-500 group-hover:text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-violet-700">{section.title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{section.description}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
