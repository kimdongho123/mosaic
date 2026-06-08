'use client'

import { useState } from 'react'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'

interface Props {
  userId: string
  userEmail: string
  balance: number
  insufficient?: boolean
  onClose: () => void
}

const PACKAGES = [
  { key: '10c' as const, credits: 10, price: 4900, label: '10 크레딧', perCredit: 490, popular: false },
  { key: '25c' as const, credits: 25, price: 9900, label: '25 크레딧', perCredit: 396, popular: true },
]

export default function PaymentModal({ userId, userEmail, balance, insufficient, onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (pkg: typeof PACKAGES[number]) => {
    setLoading(pkg.key)
    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
      const tossPayments = await loadTossPayments(clientKey)
      const payment = tossPayments.payment({ customerKey: userId })
      const orderId = `mosaic-${pkg.key}-${Date.now()}`

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: pkg.price },
        orderId,
        orderName: `모자이크 ${pkg.credits} 크레딧`,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
        customerEmail: userEmail,
      })
    } catch (e) {
      console.error('[PaymentModal] error:', e)
      setLoading(null)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .pkg-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .pkg-card:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.5) !important; }
        .buy-btn { transition: opacity 0.18s ease; }
        .buy-btn:hover:not(:disabled) { opacity: 0.82; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#242424',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '32px 28px',
          width: '100%',
          maxWidth: '420px',
          animation: 'slideUp 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.02em' }}>
              크레딧 충전
            </span>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
          {insufficient ? (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              크레딧이 부족해요. 충전 후 영상을 생성할 수 있어요.
            </p>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              영상 1개 생성 시 1 크레딧이 소모돼요.
            </p>
          )}
        </div>

        {/* Current balance */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '12px 16px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>🪙</span>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)' }}>현재 잔액</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginLeft: 'auto' }}>
            {balance} 크레딧
          </span>
        </div>

        {/* Packages */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.key}
              className="pkg-card"
              style={{
                flex: 1,
                backgroundColor: pkg.popular ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${pkg.popular ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '16px',
                padding: '20px 16px',
                position: 'relative',
                boxShadow: pkg.popular ? '0 8px 32px rgba(124,58,237,0.2)' : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff',
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
                  padding: '3px 10px', borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                }}>
                  베스트
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.02em' }}>
                  {pkg.credits}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                  크레딧
                </p>
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '4px' }}>
                {pkg.price.toLocaleString()}원
              </p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)', marginBottom: '16px' }}>
                {pkg.perCredit}원/개
              </p>
              <button
                className="buy-btn"
                onClick={() => handlePurchase(pkg)}
                disabled={loading !== null}
                style={{
                  width: '100%', padding: '9px 0', borderRadius: '9999px', border: 'none',
                  background: pkg.popular
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.78rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading && loading !== pkg.key ? 0.35 : 1,
                }}
              >
                {loading === pkg.key ? '처리 중...' : '구매하기'}
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', textAlign: 'center', lineHeight: 1.5 }}>
          결제는 토스페이먼츠를 통해 안전하게 처리돼요.
        </p>
      </div>
    </div>
  )
}
