import { createInsForgeServerClient } from '@/app/lib/insforge/server'

// 패키지 정의 — orderId 접두사로 검증
const PACKAGES: Record<string, { credits: number; amount: number }> = {
  '10c': { credits: 10, amount: 4900 },
  '25c': { credits: 25, amount: 9900 },
}

function parsePackage(orderId: string) {
  for (const [key, pkg] of Object.entries(PACKAGES)) {
    if (orderId.startsWith(`mosaic-${key}-`)) return pkg
  }
  return null
}

export async function POST(request: Request) {
  const insforge = await createInsForgeServerClient()
  const { data: authData } = await insforge.auth.getCurrentUser()
  if (!authData?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = authData.user.id

  const { paymentKey, orderId, amount } = await request.json() as {
    paymentKey: string
    orderId: string
    amount: number
  }

  if (!paymentKey || !orderId || !amount) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const pkg = parsePackage(orderId)
  if (!pkg) {
    return Response.json({ error: 'Invalid orderId' }, { status: 400 })
  }

  // 금액 검증 — 클라이언트 값 절대 신뢰 금지
  if (amount !== pkg.amount) {
    return Response.json({ error: 'Amount mismatch' }, { status: 400 })
  }

  // 중복 결제 방지 (maybeSingle: 행 없으면 null, 에러 아님)
  const { data: existing, error: existingErr } = await insforge.database
    .from('payment_records')
    .select('id, status')
    .eq('order_id', orderId)
    .maybeSingle()

  if (existingErr) {
    console.error('[payments/confirm] DB check error:', existingErr)
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
  if (existing?.status === 'completed') {
    return Response.json({ error: 'Already processed' }, { status: 409 })
  }

  // 결제 기록 생성 (pending)
  await insforge.database.from('payment_records').upsert([{
    user_id: userId,
    order_id: orderId,
    payment_key: paymentKey,
    amount: pkg.amount,
    credits: pkg.credits,
    status: 'pending',
    updated_at: new Date().toISOString(),
  }], { onConflict: 'order_id' })

  // 토스페이먼츠 서버 승인
  const secretKey = process.env.TOSS_SECRET_KEY!
  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount: pkg.amount }),
  })

  const tossData = await tossRes.json()

  if (!tossRes.ok) {
    console.error('[payments/confirm] Toss error:', tossData)
    await insforge.database.from('payment_records')
      .update({ status: 'failed', toss_response: tossData, updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
    return Response.json({ error: tossData.message ?? 'Payment confirmation failed' }, { status: 400 })
  }

  // 크레딧 충전 (원자적)
  const { data: newBalance, error: rpcError } = await insforge.database
    .rpc('add_credits', { p_user_id: userId, p_credits: pkg.credits })

  if (rpcError || newBalance === null || newBalance === undefined) {
    console.error('[payments/confirm] add_credits error:', rpcError)
    return Response.json({ error: 'Failed to add credits' }, { status: 500 })
  }

  // 결제 기록 완료 처리
  await insforge.database.from('payment_records')
    .update({
      status: 'completed',
      toss_response: tossData,
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)

  return Response.json({ balance: newBalance, credits: pkg.credits })
}
