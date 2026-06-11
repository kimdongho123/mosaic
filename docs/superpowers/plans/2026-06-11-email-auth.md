# 이메일/패스워드 인증 추가 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 Google OAuth 로그인에 이메일/패스워드 로그인·회원가입을 추가하고, InsForge Auth SDK와 연동한다.

**Architecture:** `page.tsx`는 Server Component로 유지해 auth 체크와 리다이렉트를 담당하고, 탭/폼 상태는 별도 Client Component(`AuthForm.tsx`)에서 관리한다. 서버 액션은 `useActionState` 패턴으로 에러를 인라인 반환하고, 성공 시 `NextResponse`를 통해 InsForge 세션 쿠키를 설정한 뒤 `/generate`로 리다이렉트한다.

**Tech Stack:** Next.js 16 Server Actions, `useActionState` (React 19), `@insforge/sdk/ssr` (`createServerClient`, `setAuthCookies`), Tailwind CSS

---

## 파일 구조

| 파일 | 역할 |
|------|------|
| `app/auth/actions.ts` | 수정 — `signInWithPassword`, `signUp` 액션 추가 |
| `app/auth/AuthForm.tsx` | 신규 — Client Component, 탭/폼/에러 상태 관리 |
| `app/auth/page.tsx` | 수정 — Server Component 유지, `<AuthForm />` 렌더링으로 교체 |

---

## Task 1: `signInWithPassword` 서버 액션 추가

**Files:**
- Modify: `app/auth/actions.ts`

- [ ] **Step 1: `actions.ts`에 `signInWithPassword` 추가**

기존 파일 상단 import에 아래를 추가하고, 함수를 파일 끝에 추가한다.

```typescript
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient, setAuthCookies } from '@insforge/sdk/ssr'
import { NextResponse } from 'next/server'

export async function signInWithGoogle() {
  // 기존 코드 그대로 유지
}

export async function signInWithPassword(
  prevState: { error?: string },
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

  // NextResponse를 임시로 생성해 setAuthCookies 호출 후 쿠키 복사
  const fakeRes = new NextResponse()
  setAuthCookies(fakeRes.cookies, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  })
  const cookieStore = await cookies()
  fakeRes.cookies.getAll().forEach(c => {
    cookieStore.set(c.name, c.value, {
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite as 'strict' | 'lax' | 'none',
      path: c.path ?? '/',
      maxAge: c.maxAge
    })
  })

  redirect('/generate')
}
```

- [ ] **Step 2: 빌드로 타입 에러 확인**

```bash
npm run build
```

Expected: `signInWithPassword` 관련 타입 에러 없이 빌드 통과 (다른 파일 미수정 상태이므로 page.tsx 에러는 무시)

---

## Task 2: `signUp` 서버 액션 추가

**Files:**
- Modify: `app/auth/actions.ts`

- [ ] **Step 1: `signUp` 액션을 `actions.ts` 끝에 추가**

```typescript
export async function signUp(
  prevState: { error?: string; message?: string },
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
    const fakeRes = new NextResponse()
    setAuthCookies(fakeRes.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    })
    const cookieStore = await cookies()
    fakeRes.cookies.getAll().forEach(c => {
      cookieStore.set(c.name, c.value, {
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite as 'strict' | 'lax' | 'none',
        path: c.path ?? '/',
        maxAge: c.maxAge
      })
    })
    redirect('/generate')
  }

  return { message: '회원가입이 완료됐습니다. 로그인해주세요.' }
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

Expected: actions.ts 타입 에러 없이 통과

- [ ] **Step 3: 커밋**

```bash
git add app/auth/actions.ts
git commit -m "feat: 이메일/패스워드 로그인·회원가입 서버 액션 추가"
```

---

## Task 3: `AuthForm` Client Component 생성

**Files:**
- Create: `app/auth/AuthForm.tsx`

- [ ] **Step 1: `AuthForm.tsx` 생성**

```tsx
'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { signInWithPassword, signUp, signInWithGoogle } from './actions'

export default function AuthForm() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loginState, loginAction, loginPending] = useActionState(signInWithPassword, {})
  const [signupState, signupAction, signupPending] = useActionState(signUp, {})

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#ECEEF0' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{ backgroundColor: '#DEE0E2' }}
      >
        {/* 로고 */}
        <div className="text-center">
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#202020' }}>
            mosaic
          </span>
          <p className="mt-2 text-sm" style={{ color: '#202020', opacity: 0.55 }}>
            계속하려면 로그인하세요
          </p>
        </div>

        {/* 탭 */}
        <div className="flex border-b" style={{ borderColor: 'rgba(32,32,32,0.15)' }}>
          {(['login', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 pb-2 text-sm font-semibold transition-colors"
              style={{
                color: tab === t ? '#202020' : 'rgba(32,32,32,0.4)',
                borderBottom: tab === t ? '2px solid #202020' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {/* 로그인 탭 */}
        {tab === 'login' && (
          <div className="flex flex-col gap-4">
            {loginState.error && (
              <p className="text-sm text-red-500">{loginState.error}</p>
            )}
            <form action={loginAction} className="flex flex-col gap-3">
              <input
                name="email"
                type="email"
                placeholder="이메일"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#ECEEF0', color: '#202020' }}
              />
              <input
                name="password"
                type="password"
                placeholder="비밀번호"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#ECEEF0', color: '#202020' }}
              />
              <button
                type="submit"
                disabled={loginPending}
                className="w-full py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#202020', color: '#ECEEF0' }}
              >
                {loginPending ? '로그인 중...' : '로그인'}
              </button>
            </form>
            <div className="flex justify-center gap-4 text-xs" style={{ color: 'rgba(32,32,32,0.5)' }}>
              <a href="#" className="hover:opacity-80">아이디 찾기</a>
              <span>·</span>
              <a href="#" className="hover:opacity-80">비밀번호 찾기</a>
            </div>
          </div>
        )}

        {/* 회원가입 탭 */}
        {tab === 'signup' && (
          <div className="flex flex-col gap-4">
            {signupState.error && (
              <p className="text-sm text-red-500">{signupState.error}</p>
            )}
            {signupState.message && (
              <p className="text-sm text-blue-500">{signupState.message}</p>
            )}
            <form action={signupAction} className="flex flex-col gap-3">
              <input
                name="email"
                type="email"
                placeholder="이메일"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#ECEEF0', color: '#202020' }}
              />
              <input
                name="password"
                type="password"
                placeholder="비밀번호"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ backgroundColor: '#ECEEF0', color: '#202020' }}
              />
              <button
                type="submit"
                disabled={signupPending}
                className="w-full py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#202020', color: '#ECEEF0' }}
              >
                {signupPending ? '가입 중...' : '회원가입'}
              </button>
            </form>
          </div>
        )}

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(32,32,32,0.15)' }} />
          <span className="text-xs" style={{ color: 'rgba(32,32,32,0.4)' }}>또는</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(32,32,32,0.15)' }} />
        </div>

        {/* Google 로그인 */}
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#202020', color: '#ECEEF0' }}
          >
            <GoogleIcon />
            Google로 계속하기
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: '#202020', opacity: 0.4 }}>
          계속하면{' '}
          <a href="#" className="underline underline-offset-2">이용약관</a>
          {' '}및{' '}
          <a href="#" className="underline underline-offset-2">개인정보처리방침</a>
          에 동의합니다.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.532 24.553c0-1.636-.147-3.25-.41-4.8H24.48v9.08h12.964c-.56 3.004-2.24 5.548-4.77 7.26v6.04h7.72c4.513-4.16 7.138-10.29 7.138-17.58z" fill="#4285F4"/>
      <path d="M24.48 48c6.48 0 11.918-2.148 15.89-5.832l-7.72-6.04c-2.148 1.44-4.896 2.294-8.17 2.294-6.282 0-11.6-4.244-13.502-9.944H3.04v6.24C6.995 42.64 15.187 48 24.48 48z" fill="#34A853"/>
      <path d="M10.978 28.478A14.334 14.334 0 0 1 9.93 24c0-1.564.27-3.084.747-4.478v-6.24H3.04A23.932 23.932 0 0 0 .48 24c0 3.854.924 7.504 2.56 10.718l7.938-6.24z" fill="#FBBC05"/>
      <path d="M24.48 9.578c3.54 0 6.71 1.216 9.207 3.608l6.897-6.898C36.394 2.39 30.96 0 24.48 0 15.187 0 6.995 5.36 3.04 13.282l7.938 6.24c1.902-5.7 7.22-9.944 13.502-9.944z" fill="#EA4335"/>
    </svg>
  )
}
```

> `React.useState`를 사용하므로 파일 상단에 `import React, { useState } from 'react'` 추가 또는 `useState`를 직접 import해야 한다. `useActionState`는 `react` 패키지에서 import한다.

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

Expected: `AuthForm.tsx` 타입 에러 없이 통과

---

## Task 4: `page.tsx` 업데이트

**Files:**
- Modify: `app/auth/page.tsx`

- [ ] **Step 1: `page.tsx`를 아래로 교체**

Server Component는 유지하고, 인증 체크 후 `<AuthForm />`을 렌더링한다.

```tsx
import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '../lib/insforge/server'
import AuthForm from './AuthForm'

export default async function AuthPage() {
  const insforge = await createInsForgeServerClient()
  const { data } = await insforge.auth.getCurrentUser()
  if (data?.user?.id) redirect('/generate')
  return <AuthForm />
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

Expected: 전체 빌드 성공, 타입 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add app/auth/AuthForm.tsx app/auth/page.tsx
git commit -m "feat: 이메일/패스워드 로그인·회원가입 UI 추가"
```

---

## Task 5: 수동 검증

- [ ] **Step 1: 개발 서버 실행**

```bash
npm run dev
```

- [ ] **Step 2: 로그인 탭 확인**
  - `http://localhost:3000/auth` 접속
  - "로그인 | 회원가입" 탭이 보이는지 확인
  - 로그인 탭에 이메일/비밀번호 input, 로그인 버튼, 아이디·비밀번호 찾기 링크, Google 버튼이 있는지 확인

- [ ] **Step 3: 회원가입 탭 확인**
  - 회원가입 탭 클릭
  - 이메일/비밀번호 input, 회원가입 버튼, Google 버튼이 있는지 확인

- [ ] **Step 4: 잘못된 로그인 시도**
  - 로그인 탭에서 존재하지 않는 이메일/비밀번호 입력 후 로그인
  - "이메일 또는 비밀번호가 올바르지 않습니다." 에러 메시지가 폼 상단에 표시되는지 확인

- [ ] **Step 5: 회원가입 후 로그인**
  - 회원가입 탭에서 새 이메일/비밀번호로 가입
  - 성공 시 `/generate`로 이동하거나 이메일 인증 메시지 표시 확인
  - 가입한 계정으로 로그인 탭에서 로그인 → `/generate`로 이동 확인

- [ ] **Step 6: InsForge 배포**

```bash
npm run build
npx @insforge/cli deployments deploy .
```

- [ ] **Step 7: 최종 커밋 및 push**

```bash
git add .
git commit -m "feat: 이메일/패스워드 인증 완성"
git push origin main
```
