'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const called = useRef(false)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (called.current) return
    called.current = true

    const paymentKey = params.get('paymentKey')
    const orderId = params.get('orderId')
    const amount = Number(params.get('amount'))

    if (!paymentKey || !orderId || !amount) {
      setStatus('error')
      setErrorMsg('결제 정보가 올바르지 않아요.')
      return
    }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? '결제 확인에 실패했어요.')
        setStatus('success')
        setTimeout(() => {
          router.replace(`/generate?credited=${json.credits}`)
        }, 1800)
      })
      .catch((e) => {
        setStatus('error')
        setErrorMsg(e.message)
      })
  }, [params, router])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#202020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {status === 'loading' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#a78bfa', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f0f0' }}>결제 확인 중...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.02em' }}>크레딧 충전 완료!</p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>잠시 후 생성 페이지로 이동합니다</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠</span>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f0f0' }}>결제 확인 실패</p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', maxWidth: '280px' }}>{errorMsg}</p>
            <button
              onClick={() => router.replace('/generate')}
              style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '9999px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#202020' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
