'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function FailContent() {
  const params = useSearchParams()
  const router = useRouter()
  const message = params.get('message') ?? '결제가 취소되었어요.'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#202020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem' }}>✕</span>
        </div>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.02em' }}>결제 실패</p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', maxWidth: '280px' }}>{message}</p>
        <button
          onClick={() => router.replace('/generate')}
          style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '9999px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          돌아가기
        </button>
      </div>
    </div>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#202020' }} />}>
      <FailContent />
    </Suspense>
  )
}
