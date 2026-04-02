import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'

export default function ClientsPage() {
  return (
    <div>
      <Header title="Clients" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Clients"
          description="Manage your client relationships"
          action={
            <Link href="/dashboard/clients/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </Link>
          }
        />

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No clients yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first client to get started</p>
          <Link href="/dashboard/clients/new" className="mt-4">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
