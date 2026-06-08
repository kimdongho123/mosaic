import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '../lib/insforge/server'
import GenerateClient from './GenerateClient'

export default async function GeneratePage() {
  const insforge = await createInsForgeServerClient()
  const { data, error } = await insforge.auth.getCurrentUser()
  const user = data?.user

  if (error || !user?.id || !user?.email) {
    redirect('/auth')
  }

  const profile = (user as { profile?: { name?: string; avatar_url?: string } }).profile

  const isAdmin = user.email === process.env.ADMIN_EMAIL

  const { data: creditsData } = await insforge.database
    .from('user_credits')
    .select('balance')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <GenerateClient
      user={{
        email: user.email,
        name: profile?.name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      }}
      initialBalance={creditsData?.balance ?? 0}
      isAdmin={isAdmin}
    />
  )
}
