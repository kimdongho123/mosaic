'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { signOut } from '../auth/logout'

interface UserInfo {
  email: string
  name?: string | null
  avatarUrl?: string | null
}

type Stage = 'idle' | 'spreading' | 'generating' | 'done' | 'error'

const CARDS = [
  {
    id: 'baseball',
    title: '야구 중계샷',
    sub: '스포츠 하이라이트, 생생한 현장감',
    video: '/videos/1.mp4',
    // clock position
    posLeft: '18%', posTop: '28%',
    defaultTransform: 'translate(-50%, -50%) perspective(900px) rotateX(18deg) rotateY(26deg) rotateZ(-13deg)',
    hoverTransform: 'translate(-50%, -50%) perspective(900px) rotateX(5deg) rotateY(11deg) rotateZ(-4deg) scale(1.07)',
    // corner position
    cornerLeft: '10%', cornerTop: '12%',
  },
  {
    id: 'idol',
    title: '아이돌 직캠',
    sub: '무대 위 퍼포먼스, 가까이서',
    video: '/videos/2.mp4',
    posLeft: '82%', posTop: '28%',
    defaultTransform: 'translate(-50%, -50%) perspective(900px) rotateX(18deg) rotateY(-26deg) rotateZ(13deg)',
    hoverTransform: 'translate(-50%, -50%) perspective(900px) rotateX(5deg) rotateY(-11deg) rotateZ(4deg) scale(1.07)',
    cornerLeft: '90%', cornerTop: '12%',
  },
  {
    id: 'show',
    title: '쇼미 관객석',
    sub: '뜨겁게 달아오른 열기',
    video: '/videos/3.mp4',
    posLeft: '18%', posTop: '72%',
    defaultTransform: 'translate(-50%, -50%) perspective(900px) rotateX(-18deg) rotateY(26deg) rotateZ(13deg)',
    hoverTransform: 'translate(-50%, -50%) perspective(900px) rotateX(-5deg) rotateY(11deg) rotateZ(4deg) scale(1.07)',
    cornerLeft: '10%', cornerTop: '88%',
  },
  {
    id: 'fashion',
    title: '스트릿 패션',
    sub: '거리 위 개성 넘치는 스타일',
    video: '/videos/4.mp4',
    posLeft: '82%', posTop: '72%',
    defaultTransform: 'translate(-50%, -50%) perspective(900px) rotateX(-18deg) rotateY(-26deg) rotateZ(-13deg)',
    hoverTransform: 'translate(-50%, -50%) perspective(900px) rotateX(-5deg) rotateY(-11deg) rotateZ(-4deg) scale(1.07)',
    cornerLeft: '90%', cornerTop: '88%',
  },
] as const

export default function GenerateClient({ user }: { user: UserInfo }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const initial = (user.name ?? user.email).charAt(0).toUpperCase()
  const isIdle = stage === 'idle'

  const handleFileSelected = async (cardId: string, file: File) => {
    setActiveCardId(cardId)
    setPreviewUrl(URL.createObjectURL(file))
    setStage('spreading')

    // generating 단계 진입 후 API 호출
    await new Promise<void>((res) => setTimeout(res, 750))
    setStage('generating')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('cardId', cardId)

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Generation failed')
      setGeneratedUrl(json.url)
      setStage('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error')
      setStage('error')
    }
  }

  return (
    <div style={{ height: '100vh', backgroundColor: '#ECEEF0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ height: '64px', backgroundColor: '#ECEEF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', flexShrink: 0 }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#202020', textDecoration: 'none' }}>
          mosaic
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <form action={signOut}>
            <button
              type="submit"
              style={{ fontSize: '0.78rem', color: '#202020', opacity: 0.45, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            >
              로그아웃
            </button>
          </form>
          <div
            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DEE0E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#202020', overflow: 'hidden' }}
            title={user.name ?? user.email}
          >
            {user.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initial}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ position: 'relative', flex: 1 }}>

        {/* 4 Cards */}
        {CARDS.map((card) => {
          const isHovered = isIdle && hoveredId === card.id
          const isSpreading = stage === 'spreading'
          const isSpinning = stage === 'generating' || stage === 'done' || stage === 'error'

          const left = isIdle ? card.posLeft : card.cornerLeft
          const top = isIdle ? card.posTop : card.cornerTop

          let transform: string | undefined
          let transition: string
          let className = ''

          if (isIdle) {
            transform = isHovered ? card.hoverTransform : card.defaultTransform
            transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          } else if (isSpreading) {
            transform = 'translate(-50%, -50%) scale(0.5)'
            transition = 'left 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
          } else if (isSpinning) {
            transform = undefined // CSS animation이 제어
            transition = 'none'
            className = 'card-corner-spin'
          } else {
            transform = 'translate(-50%, -50%) scale(0.5)'
            transition = 'none'
          }

          return (
            <div
              key={card.id}
              className={className}
              onMouseEnter={() => isIdle && setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => isIdle && fileInputRefs.current[card.id]?.click()}
              style={{
                position: 'absolute',
                left,
                top,
                width: '220px',
                height: '300px',
                transform,
                transition,
                cursor: isIdle ? 'pointer' : 'default',
                willChange: 'transform, left, top',
                zIndex: isHovered ? 10 : 1,
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 8px 20px -8px rgba(0,0,0,0.25)', backgroundColor: isHovered ? '#ffffff' : '#202020', transition: 'background-color 0.3s ease' }}>

                {/* Default state: video + text */}
                <div style={{ position: 'absolute', inset: 0, opacity: isHovered ? 0 : 1, transition: 'opacity 0.3s ease' }}>
                  <video src={card.video} autoPlay loop muted playsInline
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ECEEF0', lineHeight: 1.3 }}>{card.title}</span>
                    <span style={{ fontSize: '0.7rem', color: '#DEE0E2', opacity: 0.65, lineHeight: 1.4 }}>{card.sub}</span>
                  </div>
                </div>

                {/* Hover state: 사진 첨부 */}
                {isIdle && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: isHovered ? 'auto' : 'none' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ECEEF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#202020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#202020' }}>사진 첨부</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={(el) => { fileInputRefs.current[card.id] = el }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelected(card.id, file)
                }}
              />
            </div>
          )
        })}

        {/* Central generation UI */}
        {!isIdle && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            opacity: stage === 'spreading' ? 0 : 1,
            transition: 'opacity 0.4s ease 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}>
            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StepBadge label="사진 첨부됨" done />
              <StepArrow />
              <StepBadge label="이미지 생성" done={stage === 'done' || stage === 'error'} loading={stage === 'generating'} error={stage === 'error'} />
              <StepArrow />
              <StepBadge label="영상 생성" done={false} disabled />
            </div>

            {/* Image panels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Input photo */}
              <ImagePanel label="첨부한 사진">
                {previewUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={previewUrl} alt="uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  : null}
              </ImagePanel>

              <div style={{ color: '#202020', opacity: 0.3, fontSize: '1.5rem' }}>→</div>

              {/* Generated image */}
              <ImagePanel label="생성된 이미지">
                {stage === 'generating' && <LoadingSpinner />}
                {stage === 'done' && generatedUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={generatedUrl} alt="generated" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                )}
                {stage === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <span style={{ fontSize: '0.75rem', color: '#202020', opacity: 0.6, textAlign: 'center' }}>{errorMsg}</span>
                  </div>
                )}
              </ImagePanel>

              <div style={{ color: '#202020', opacity: 0.15, fontSize: '1.5rem' }}>→</div>

              {/* Video panel (coming soon) */}
              <ImagePanel label="생성된 영상" muted>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.5rem', opacity: 0.25 }}>🎬</span>
                  <span style={{ fontSize: '0.7rem', color: '#202020', opacity: 0.3 }}>준비 중</span>
                </div>
              </ImagePanel>
            </div>

            {/* Reset button (done/error state) */}
            {(stage === 'done' || stage === 'error') && (
              <button
                onClick={() => {
                  setStage('idle')
                  setActiveCardId(null)
                  setPreviewUrl(null)
                  setGeneratedUrl(null)
                  setErrorMsg(null)
                }}
                style={{ marginTop: '4px', padding: '10px 24px', borderRadius: '9999px', border: '1px solid #202020', background: 'transparent', color: '#202020', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
              >
                다시 만들기
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

/* ─── Sub-components ───────────────────────────────────────── */

function StepBadge({ label, done, loading, error, disabled }: { label: string; done?: boolean; loading?: boolean; error?: boolean; disabled?: boolean }) {
  const bg = error ? '#fef2f2' : done ? '#202020' : loading ? '#ECEEF0' : '#DEE0E2'
  const color = error ? '#dc2626' : done ? '#ECEEF0' : '#202020'
  const opacity = disabled ? 0.35 : 1

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: bg, opacity }}>
      {loading && <LoadingDot />}
      {done && !error && <span style={{ color: '#ECEEF0', fontSize: '0.7rem' }}>✓</span>}
      <span style={{ fontSize: '0.78rem', fontWeight: 500, color, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

function StepArrow() {
  return <span style={{ color: '#202020', opacity: 0.25, fontSize: '0.9rem' }}>›</span>
}

function ImagePanel({ label, children, muted }: { label: string; children?: React.ReactNode; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '14px',
        backgroundColor: '#DEE0E2',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: muted ? 0.4 : 1,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        {children}
      </div>
      <span style={{ fontSize: '0.72rem', color: '#202020', opacity: muted ? 0.35 : 0.55 }}>{label}</span>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '3px solid #DEE0E2',
        borderTopColor: '#202020',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '0.72rem', color: '#202020', opacity: 0.5 }}>생성 중...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function LoadingDot() {
  return (
    <>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#202020', animation: 'pulse-dot 1s ease-in-out infinite' }} />
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </>
  )
}
