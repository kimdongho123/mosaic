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

  return (
    <GenerateClient
      user={{
        email: user.email,
        name: profile?.name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      }}
    />
  )
}
