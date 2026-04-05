import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, ArrowLeft } from 'lucide-react'

function svc() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = svc()
  const { data: org } = await db.from('organizations').select('id, name, slug').eq('slug', slug).single()
  if (!org) redirect('/dashboard')

  const { data: membership } = await db.from('org_memberships')
    .select('role').eq('org_id', org.id).eq('tenant_id', user.id).eq('status', 'active').single()
  if (!membership) redirect('/dashboard')

  const isAdmin = membership.role === 'admin'

  const nav = [
    { href: `/org/${slug}`, label: 'Overview', icon: LayoutDashboard },
    { href: `/org/${slug}/members`, label: 'Members', icon: Users },
    ...(isAdmin ? [{ href: `/org/${slug}/settings`, label: 'Settings', icon: Settings }] : []),
  ]

  return (
    <div className="flex min-h-screen">
      {/* Agency sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-3">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{org.name[0]}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{org.name}</p>
              <p className="text-xs text-violet-600 capitalize">{membership.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto bg-gray-50">
        {children}
      </div>
    </div>
  )
}
