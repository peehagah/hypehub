// Server Component — fetches workspaces from Supabase for sidebar
import { Sidebar } from '@/components/sidebar'
import { getWorkspaces } from '@/lib/supabase'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const workspaces = await getWorkspaces()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      <Sidebar workspaces={workspaces} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
