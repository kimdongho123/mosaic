import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'
import GalleryClient from './GalleryClient'

export default async function GalleryPage() {
  const insforge = await createInsForgeServerClient()
  const { data: authData, error } = await insforge.auth.getCurrentUser()
  const user = authData?.user
  if (error || !user?.id || !user?.email) {
    redirect('/auth')
  }

  const { data: rows } = await insforge.database
    .from('generations')
    .select('id, card_id, output_image_url, output_video_url, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const generations = (rows ?? []).filter((g: { output_image_url: string | null }) => g.output_image_url)

  return (
    <GalleryClient
      user={{
        email: user.email,
        name: user.profile?.name ?? null,
        avatarUrl: user.profile?.avatar_url ?? null,
      }}
      generations={generations}
    />
  )
}
