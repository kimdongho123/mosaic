import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function GET() {
  const insforge = await createInsForgeServerClient()
  const { data: authData } = await insforge.auth.getCurrentUser()
  if (!authData?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await insforge.database
    .from('user_credits')
    .select('balance')
    .eq('user_id', authData.user.id)
    .single()

  return Response.json({ balance: data?.balance ?? 0 })
}
