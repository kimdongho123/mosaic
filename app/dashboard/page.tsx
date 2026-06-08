import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '../lib/insforge/server'

export default async function DashboardPage() {
  const insforge = await createInsForgeServerClient()
  const { data } = await insforge.auth.getCurrentUser()

  if (!data?.user) {
    redirect('/auth')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#ECEEF0', color: '#202020' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-4 text-center"
        style={{ backgroundColor: '#DEE0E2' }}
      >
        <span className="text-2xl font-bold tracking-tight">mosaic</span>
        <p className="text-sm" style={{ opacity: 0.6 }}>
          {data.user.email} 으로 로그인됨
        </p>
      </div>
    </div>
  )
}
