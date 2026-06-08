'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { signOut } from '../auth/logout'
import PaymentModal from './PaymentModal'
import ThemeToggle from '@/components/ThemeToggle'
import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button'

interface UserInfo {
  email: string
  name?: string | null
  avatarUrl?: string | null
}

type Stage =
  | 'idle'
  | 'spreading'
  | 'generating_image'
  | 'done_image'
  | 'generating_video'
  | 'done'
  | 'error'

const CARDS = [
  {
    id: 'baseball', title: '야구 중계샷', sub: '스포츠 하이라이트', video: '/videos/1.mp4',
    accent: '#3b82f6', emoji: '⚾',
  },
  {
    id: 'idol', title: '아이돌 직캠', sub: 'K-POP 퍼포먼스', video: '/videos/2.mp4',
    accent: '#ec4899', emoji: '🎤',
  },
  {
    id: 'show', title: '쇼미더머니', sub: '힙합 무대', video: '/videos/3.mp4',
    accent: '#eab308', emoji: '🎵',
  },
  {
    id: 'anime', title: '지브리 애니메이션', sub: '2D 애니 캐릭터', video: '/videos/4.mp4',
    accent: '#34d399', emoji: '✨',
  },
] as const

type CardId = typeof CARDS[number]['id']

export default function GenerateClient({ user, initialBalance, isAdmin = false }: { user: UserInfo; initialBalance: number; isAdmin?: boolean }) {
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCard, setSelectedCard] = useState<CardId>('baseball')
  const [stage, setStage] = useState<Stage>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(initialBalance)
  const [showPayment, setShowPayment] = useState(false)
  const [insufficientTrigger, setInsufficientTrigger] = useState(false)

  useEffect(() => {
    const credited = searchParams.get('credited')
    if (credited) {
      fetch('/api/credits').then(r => r.json()).then(d => setBalance(d.balance ?? 0))
      window.history.replaceState({}, '', '/generate')
    }
  }, [searchParams])

  const initial = (user.name ?? user.email).charAt(0).toUpperCase()

  const handleFileSelected = async (file: File) => {
    if (!isAdmin && balance < 1) {
      setInsufficientTrigger(true)
      setShowPayment(true)
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
    setStage('spreading')
    await new Promise<void>((res) => setTimeout(res, 750))

    setStage('generating_image')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('cardId', selectedCard)

    let imageUrl: string
    let generationId: string
    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Image generation failed')
      imageUrl = json.url
      generationId = json.generationId
      setGeneratedImageUrl(imageUrl)
      setStage('done_image')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error')
      setStage('error')
      return
    }

    setStage('generating_video')
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationId, imageUrl, cardId: selectedCard }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Video generation failed')
      setGeneratedVideoUrl(json.url)

      if (!isAdmin) {
        const deductRes = await fetch('/api/credits/deduct', { method: 'POST' })
        if (deductRes.ok) {
          const d = await deductRes.json()
          setBalance(d.balance ?? Math.max(0, balance - 1))
        }
      }

      setStage('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unknown error')
      setStage('error')
    }
  }

  const reset = () => {
    setStage('idle')
    setPreviewUrl(null)
    setGeneratedImageUrl(null)
    setGeneratedVideoUrl(null)
    setErrorMsg(null)
    setInsufficientTrigger(false)
  }

  const isIdle = stage === 'idle'
  const activeCard = CARDS.find(c => c.id === selectedCard)

  return (
    /* 모바일: flex-col 풀스크린, 데스크탑(lg+): flex-row 사이드바+캔버스 */
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 dark:bg-[#202020]">

      {/* ── Payment Modal ── */}
      {showPayment && (
        <PaymentModal
          userId={user.email}
          userEmail={user.email}
          balance={balance}
          insufficient={insufficientTrigger}
          onClose={() => { setShowPayment(false); setInsufficientTrigger(false) }}
        />
      )}

      {/* ════════════════════════════════════════
          MOBILE HEADER (lg 이상에서 숨김)
      ════════════════════════════════════════ */}
      <header className="lg:hidden flex-shrink-0 h-14 px-4 flex items-center justify-between
        bg-white dark:bg-[#2a2a2a] border-b border-black/6 dark:border-white/6">
        <Link href="/" className="text-lg font-black tracking-tight gradient-text select-none">
          mosaic
        </Link>
        <div className="flex items-center gap-2">
          {/* 크레딧 */}
          <button
            onClick={() => !isAdmin && (setInsufficientTrigger(false), setShowPayment(true))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
              bg-black/5 dark:bg-white/6 border border-black/6 dark:border-white/8
              text-xs font-semibold text-gray-700 dark:text-white/75 cursor-pointer"
          >
            <span>🪙</span>
            <span className={!isAdmin && balance === 0 ? 'text-violet-500' : ''}>
              {isAdmin ? '∞' : balance}
            </span>
          </button>
          <ThemeToggle />
          {/* 유저 아바타 */}
          <div className="w-8 h-8 rounded-full bg-black/8 dark:bg-white/10 border border-black/8 dark:border-white/10
            flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-white/80 overflow-hidden">
            {user.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : initial}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          MOBILE 테마 선택 스트립 (lg 이상에서 숨김, idle 상태만)
      ════════════════════════════════════════ */}
      {isIdle && (
        <div className="lg:hidden flex-shrink-0 px-4 py-3
          bg-white dark:bg-[#2a2a2a] border-b border-black/4 dark:border-white/4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/28 mb-2.5">
            테마 선택
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CARDS.map((card) => {
              const isSelected = selectedCard === card.id
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card.id)}
                  className="relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
                  style={{
                    width: '80px', height: '108px',
                    outline: isSelected ? `2px solid ${card.accent}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  <video src={card.video} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: card.accent }}>
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <span className="text-[0.55rem] font-semibold text-white leading-tight block truncate">{card.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          DESKTOP SIDEBAR (모바일에서 숨김)
      ════════════════════════════════════════ */}
      <aside className="hidden lg:flex w-80 flex-shrink-0 flex-col
        bg-white dark:bg-[#2a2a2a] border-r border-black/6 dark:border-white/6 overflow-hidden">

        {/* Brand header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-black/6 dark:border-white/6 flex-shrink-0">
          <Link href="/" className="text-lg font-black tracking-tight gradient-text select-none">
            mosaic
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Nav tabs */}
        <div className="px-4 py-3 flex gap-1.5 border-b border-black/4 dark:border-white/4 flex-shrink-0">
          <Link href="/generate" className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 select-none">
            생성하기
          </Link>
          <Link href="/gallery" className="text-xs font-medium px-3.5 py-1.5 rounded-full text-gray-500 dark:text-white/40 hover:bg-black/4 dark:hover:bg-white/6 transition-colors select-none">
            내 생성물
          </Link>
        </div>

        {/* Theme grid */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/28 mb-3 px-1">
            테마 선택
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {CARDS.map((card) => {
              const isSelected = selectedCard === card.id
              return (
                <button
                  key={card.id}
                  onClick={() => isIdle && setSelectedCard(card.id)}
                  disabled={!isIdle}
                  className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer transition-all duration-200 disabled:cursor-default"
                  style={{
                    outline: isSelected ? `2px solid ${card.accent}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  <video src={card.video} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: card.accent }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[0.62rem] font-semibold text-white leading-tight block truncate">{card.title}</span>
                    <span className="text-[0.55rem] text-white/55 leading-tight block">{card.sub}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom area */}
        <div className="px-4 pb-5 pt-3 border-t border-black/6 dark:border-white/6 flex-shrink-0 space-y-3">
          {/* Credits */}
          <button
            onClick={() => !isAdmin && (setInsufficientTrigger(false), setShowPayment(true))}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl
              bg-black/4 dark:bg-white/5 border border-black/6 dark:border-white/8
              hover:bg-black/7 dark:hover:bg-white/8 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🪙</span>
              <span className="text-xs text-gray-500 dark:text-white/45">크레딧</span>
            </div>
            <span className={`text-sm font-bold ${!isAdmin && balance === 0 ? 'text-violet-600 dark:text-violet-400' : 'text-gray-800 dark:text-white/80'}`}>
              {isAdmin ? '∞' : balance}
            </span>
          </button>

          {/* Upload CTA */}
          <GlassButton
            className="w-full"
            onClick={() => isIdle && fileInputRef.current?.click()}
            disabled={!isIdle}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            사진 첨부하기
          </GlassButton>

          {/* User row */}
          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-7 h-7 rounded-full bg-black/8 dark:bg-white/10 border border-black/8 dark:border-white/10
              flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-white/80 overflow-hidden flex-shrink-0">
              {user.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : initial}
            </div>
            <span className="text-xs text-gray-500 dark:text-white/38 truncate flex-1 min-w-0" title={user.name ?? user.email}>
              {user.name ?? user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-[0.65rem] text-gray-400 dark:text-white/28 hover:text-gray-600 dark:hover:text-white/55 transition-colors cursor-pointer bg-transparent border-none p-0">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          CANVAS
      ════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto">

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); e.target.value = '' }}
        />

        {/* ── Idle state ── */}
        {isIdle && (
          <div className="flex flex-col items-center gap-5 text-center w-full max-w-sm">
            {/* Upload zone */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-[220px] aspect-square rounded-3xl flex flex-col items-center justify-center gap-4
                cursor-pointer transition-all duration-300 group
                border-2 border-dashed border-black/12 dark:border-white/12
                hover:border-black/25 dark:hover:border-white/25
                bg-white dark:bg-white/3 hover:bg-black/2 dark:hover:bg-white/5"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                bg-black/4 dark:bg-white/6 border border-black/6 dark:border-white/8
                group-hover:scale-110 transition-transform duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-white/50">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-white/70">사진을 드래그하거나</p>
                <p className="text-xs text-gray-400 dark:text-white/35 mt-0.5">클릭해서 업로드</p>
              </div>
            </button>

            {/* Selected theme indicator */}
            {activeCard && (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full
                border border-black/6 dark:border-white/8 bg-white dark:bg-white/4">
                <span className="text-base">{activeCard.emoji}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-white/70">{activeCard.title}</span>
                <span className="text-[0.6rem] text-gray-400 dark:text-white/35">선택됨</span>
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-white/28 leading-relaxed">
              얼굴이 잘 나온 사진을 첨부하면<br />
              AI가 <strong className="text-gray-600 dark:text-white/55">{activeCard?.title}</strong> 테마로 변환합니다.
            </p>
          </div>
        )}

        {/* ── Generation flow ── */}
        {!isIdle && (
          <div
            className="w-full max-w-3xl flex flex-col items-center gap-5 sm:gap-7"
            style={{ opacity: stage === 'spreading' ? 0 : 1, transition: 'opacity 0.4s ease 0.3s' }}
          >
            {/* Step badges — 모바일에서 wrap 허용 */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <StepBadge label="사진 첨부" done />
              <StepArrow />
              <StepBadge
                label="이미지 생성"
                loading={stage === 'generating_image'}
                done={['done_image', 'generating_video', 'done'].includes(stage) || (stage === 'error' && !!generatedImageUrl)}
                error={stage === 'error' && !generatedImageUrl}
              />
              <StepArrow />
              <StepBadge
                label="영상 생성"
                loading={stage === 'generating_video'}
                done={stage === 'done'}
                error={stage === 'error' && !!generatedImageUrl}
                disabled={['generating_image', 'done_image'].includes(stage)}
              />
            </div>

            {/* Image panels
                모바일: 세로 스택 (flex-col)
                sm 이상: 가로 배치 (flex-row)
            */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full justify-center">
              <ImagePanel label="첨부한 사진">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="uploaded" className="w-full h-full object-cover rounded-2xl" />
                )}
              </ImagePanel>

              {/* 모바일에서는 아래 화살표, sm+에서는 오른쪽 화살표 */}
              <PanelArrow active />

              <ImagePanel label="생성된 이미지">
                {stage === 'generating_image' && <LoadingSpinner label="이미지 생성 중..." />}
                {generatedImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={generatedImageUrl} alt="generated" className="w-full h-full object-cover rounded-2xl" />
                )}
                {stage === 'error' && !generatedImageUrl && <ErrorIcon msg={errorMsg} />}
              </ImagePanel>

              <PanelArrow active={!!generatedImageUrl} />

              <ImagePanel label="생성된 영상">
                {stage === 'generating_video' && <LoadingSpinner label="영상 생성 중..." />}
                {generatedVideoUrl && (
                  <video src={generatedVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover rounded-2xl" />
                )}
                {stage === 'error' && generatedImageUrl && !generatedVideoUrl && <ErrorIcon msg={errorMsg} />}
                {['generating_image', 'done_image'].includes(stage) && !generatedVideoUrl && (
                  <span className="text-xs text-gray-400 dark:text-white/25">대기 중...</span>
                )}
              </ImagePanel>
            </div>

            {/* Done / error actions */}
            {(stage === 'done' || stage === 'error') && (
              <div className="flex flex-wrap gap-3 justify-center mt-1">
                {stage === 'done' && generatedVideoUrl && (
                  <a
                    href={generatedVideoUrl}
                    download="mosaic-video.mp4"
                    className="btn-glow inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    영상 다운로드
                  </a>
                )}
                {stage === 'done' && (
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-full
                      border border-black/10 dark:border-white/15 text-gray-700 dark:text-white/70
                      hover:bg-black/4 dark:hover:bg-white/6 transition-colors"
                  >
                    갤러리에서 보기
                  </Link>
                )}
                <button
                  onClick={reset}
                  className="text-sm font-medium px-6 py-3 rounded-full
                    border border-black/8 dark:border-white/10
                    text-gray-500 dark:text-white/45 hover:bg-black/4 dark:hover:bg-white/5
                    transition-colors cursor-pointer"
                >
                  다시 만들기
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════
          MOBILE 하단 액션 바 (idle 상태, lg 이상에서 숨김)
      ════════════════════════════════════════ */}
      {isIdle && (
        <div className="lg:hidden flex-shrink-0 px-4 pb-safe py-3
          bg-white dark:bg-[#2a2a2a] border-t border-black/6 dark:border-white/6">
          <div className="flex items-center gap-3">
            <GlassButton
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              사진 첨부하기
            </GlassButton>
            <Link href="/gallery"
              className="flex items-center justify-center w-11 h-11 rounded-xl
                border border-black/8 dark:border-white/10
                text-gray-500 dark:text-white/45 hover:bg-black/4 dark:hover:bg-white/5
                transition-colors flex-shrink-0"
              title="내 생성물"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </Link>
          </div>
          {/* 모바일 로그아웃 */}
          <div className="mt-2 flex justify-end">
            <form action={signOut}>
              <button type="submit"
                className="text-[0.65rem] text-gray-400 dark:text-white/25 bg-transparent border-none cursor-pointer">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────── */

function StepBadge({ label, done, loading, error, disabled }: {
  label: string; done?: boolean; loading?: boolean; error?: boolean; disabled?: boolean
}) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all
      ${error
        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500'
        : done
          ? 'bg-black/6 dark:bg-white/10 border-black/10 dark:border-white/15 text-gray-700 dark:text-white/80'
          : loading
            ? 'bg-black/4 dark:bg-white/6 border-black/8 dark:border-white/10 text-gray-600 dark:text-white/65'
            : 'bg-black/3 dark:bg-white/4 border-black/6 dark:border-white/8 text-gray-400 dark:text-white/40'
      }
      ${disabled ? 'opacity-30' : ''}
    `}>
      {loading && <LoadingDot />}
      {done && !error && <span className="text-[0.6rem]">✓</span>}
      {label}
    </div>
  )
}

function StepArrow() {
  return <span className="text-gray-300 dark:text-white/20 text-lg leading-none">›</span>
}

function PanelArrow({ active }: { active?: boolean }) {
  return (
    <>
      {/* 모바일: ↓, sm+: → */}
      <div className={`flex-shrink-0 transition-opacity duration-300 text-gray-400 dark:text-white/35
        ${active ? 'opacity-100' : 'opacity-25'}
        text-xl sm:hidden`}>↓</div>
      <div className={`flex-shrink-0 transition-opacity duration-300 text-gray-400 dark:text-white/35
        ${active ? 'opacity-100' : 'opacity-25'}
        text-2xl hidden sm:block`}>→</div>
    </>
  )
}

function ImagePanel({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-2xl
        bg-black/4 dark:bg-white/5 border border-black/8 dark:border-white/8
        overflow-hidden flex items-center justify-center shadow-sm dark:shadow-black/30">
        {children}
      </div>
      <span className="text-xs text-gray-400 dark:text-white/40">{label}</span>
    </div>
  )
}

function LoadingSpinner({ label = '생성 중...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 rounded-full border-[3px] border-black/8 dark:border-white/10 border-t-gray-600 dark:border-t-white/70 animate-spin" />
      <span className="text-xs text-gray-400 dark:text-white/45 text-center px-2">{label}</span>
    </div>
  )
}

function LoadingDot() {
  return <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
}

function ErrorIcon({ msg }: { msg: string | null }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 text-center">
      <span className="text-xl">⚠️</span>
      <span className="text-xs text-red-400 leading-relaxed">{msg}</span>
    </div>
  )
}
