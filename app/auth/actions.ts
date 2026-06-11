'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'

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

export async function signInWithPassword(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  const client = createServerClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })

  if (error || !data?.accessToken) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  const cookieStore = await cookies()
  setAuthCookies(cookieStore, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  })

  redirect('/generate')
}

export async function signUp(
  _prevState: { error?: string; message?: string },
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  const client = createServerClient()
  const { data, error } = await client.auth.signUp({ email, password })

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('already') || msg.includes('exist')) {
      return { error: '이미 사용 중인 이메일입니다.' }
    }
    return { error: '회원가입에 실패했습니다. 다시 시도해주세요.' }
  }

  if (data?.requireEmailVerification) {
    return { message: '인증 이메일을 발송했습니다. 이메일을 확인해주세요.' }
  }

  if (data?.accessToken) {
    const cookieStore = await cookies()
    setAuthCookies(cookieStore, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    })
    redirect('/generate')
  }

  return { message: '회원가입이 완료됐습니다. 로그인해주세요.' }
}
