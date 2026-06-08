import { cookies, headers } from 'next/headers'
import { createServerClient } from '@insforge/sdk/ssr'

export async function createInsForgeServerClient() {
  const headersList = await headers()

  // 미들웨어가 토큰을 갱신했으면 헤더에 새 토큰이 담겨 있음
  // 만료된 쿠키 토큰 대신 갱신된 토큰을 직접 사용
  const freshToken = headersList.get('x-insforge-access-token')
  if (freshToken) {
    return createServerClient({ accessToken: freshToken })
  }

  return createServerClient({ cookies: await cookies() })
}
