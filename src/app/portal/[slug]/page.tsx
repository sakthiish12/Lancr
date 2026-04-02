import { Zap } from 'lucide-react'

interface PortalPageProps {
  params: Promise<{ slug: string }>
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { slug } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Client Portal</span>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to your portal</h1>
          <p className="mt-2 text-gray-500">Portal: {slug}</p>
        </div>
      </main>
    </div>
  )
}
