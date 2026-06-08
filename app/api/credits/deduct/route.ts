import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export async function POST() {
  const insforge = await createInsForgeServerClient()
  const { data: authData } = await insforge.auth.getCurrentUser()
  if (!authData?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await insforge.database
    .rpc('deduct_credit', { p_user_id: authData.user.id })

  if (error) {
    console.error('[deduct] RPC error:', error)
    return Response.json({ error: 'Failed to deduct credit' }, { status: 500 })
  }

  // deduct_credit returns -1 when balance is insufficient
  if (data === -1) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  return Response.json({ balance: data })
}
