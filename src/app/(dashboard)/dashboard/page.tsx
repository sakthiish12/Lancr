import { TrendingUp, FileText, Receipt, Users, ArrowUpRight, Clock } from 'lucide-react'
import { Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'

const metrics = [
  {
    label: 'Total Revenue',
    value: 'S$0.00',
    change: '+0%',
    changeType: 'neutral' as const,
    icon: TrendingUp,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Outstanding',
    value: 'S$0.00',
    change: '0 invoices',
    changeType: 'neutral' as const,
    icon: Receipt,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    label: 'Active Quotes',
    value: '0',
    change: '0% conversion',
    changeType: 'neutral' as const,
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Total Clients',
    value: '0',
    change: '+0 this month',
    changeType: 'neutral' as const,
    icon: Users,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
]

const quickActions = [
  { label: 'New Quote', href: '/dashboard/quotes/new', description: 'Create a proposal for a client' },
  { label: 'New Invoice', href: '/dashboard/invoices/new', description: 'Bill a client for work done' },
  { label: 'New Contract', href: '/dashboard/contracts/new', description: 'Draft a service agreement' },
  { label: 'Add Client', href: '/dashboard/clients/new', description: 'Add a new client record' },
]

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Welcome to Lancr"
          description="Your freelance business command center"
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{metric.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{metric.change}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${metric.iconBg}`}>
                    <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 text-base font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700">{action.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Empty State */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No activity yet</p>
              <p className="mt-1 text-xs text-gray-400">Create your first quote to get started</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Payments</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Receipt className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No upcoming payments</p>
              <p className="mt-1 text-xs text-gray-400">Send invoices to start collecting payments</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
