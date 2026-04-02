import Link from 'next/link'
import { Plus, FileSignature } from 'lucide-react'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { Header } from '@/components/layout/Header'

export default function ContractsPage() {
  return (
    <div>
      <Header title="Contracts" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Contracts"
          description="Create and manage legally binding agreements"
          action={
            <Link href="/dashboard/contracts/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Contract
              </Button>
            </Link>
          }
        />

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <FileSignature className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No contracts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first contract from a template</p>
          <Link href="/dashboard/contracts/new" className="mt-4">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Contract
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
