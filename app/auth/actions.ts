'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@insforge/sdk/ssr'

export async function signInWithGoogle() {
  const client = createServerClient()
  const { data, error } = await client.auth.signInWithOAuth('google', {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    skipBrowserRedirect: true
  })

  if (error || !data?.url || !data?.codeVerifier) {
    throw new Error(error?.message ?? 'Google 로그인 초기화 실패')
  }

  const cookieStore = await cookies()
  cookieStore.set('insforge_code_verifier', data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  })

  redirect(data.url)
}
