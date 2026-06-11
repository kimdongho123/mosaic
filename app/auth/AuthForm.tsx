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
