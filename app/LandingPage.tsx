'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button'

interface Props { isLoggedIn: boolean }

const THEMES = [
  {
    id: 'baseball', emoji: '⚾', title: '야구 중계샷', sub: 'KBO 하이라이트',
    desc: '한국 프로야구 현장 그 자체. 응원하는 팬, 타석에 선 선수, 생생한 중계 카메라 앵글.',
    video: '/videos/1.mp4', accent: '#3b82f6',
    rotation: '-3deg', translateY: '-8px',
  },
  {
    id: 'idol', emoji: '🎤', title: '아이돌 직캠', sub: 'K-POP 퍼포먼스',
    desc: '화려한 K-POP 무대 위. 역동적인 조명과 함께 퍼포먼스하는 아이돌 직캠 스타일.',
    video: '/videos/2.mp4', accent: '#ec4899',
    rotation: '3deg', translateY: '12px',
  },
  {
    id: 'show', emoji: '🎵', title: '쇼미더머니', sub: '힙합 배틀',
    desc: '한국 대표 힙합 서바이벌 쇼의 현장. 예선 무대 위 래퍼, 관객석의 뜨거운 반응.',
    video: '/videos/3.mp4', accent: '#eab308',
    rotation: '2deg', translateY: '-4px',
  },
  {
    id: 'anime', emoji: '✨', title: '지브리 애니메이션', sub: '2D 애니화',
    desc: '스튜디오 지브리 특유의 2D 세계관. 이웃집 토토로, 센과 치히로 스타일의 따뜻한 장면.',
    video: '/videos/4.mp4', accent: '#34d399',
    rotation: '-4deg', translateY: '6px',
  },
]

const SHOWCASE_ITEMS = [
  { title: '야구 중계샷', tag: 'Sports', video: '/videos/1.mp4', color: 'rgba(59,130,246,0.72)' },
  { title: '아이돌 직캠', tag: 'K-POP', video: '/videos/2.mp4', color: 'rgba(236,72,153,0.72)' },
  { title: '쇼미더머니', tag: 'Hip-Hop', video: '/videos/3.mp4', color: 'rgba(234,179,8,0.72)' },
  { title: '지브리 애니', tag: 'Anime', video: '/videos/4.mp4', color: 'rgba(52,211,153,0.72)' },
  { title: 'KBO 현장', tag: 'Sports', video: '/videos/1.mp4', color: 'rgba(99,102,241,0.68)' },
  { title: 'K-POP 무대', tag: 'K-POP', video: '/videos/2.mp4', color: 'rgba(168,85,247,0.68)' },
  { title: '힙합 배틀', tag: 'Hip-Hop', video: '/videos/3.mp4', color: 'rgba(239,68,68,0.68)' },
  { title: '판타지 세계', tag: 'Anime', video: '/videos/4.mp4', color: 'rgba(6,182,212,0.68)' },
  { title: '스포츠 순간', tag: 'Sports', video: '/videos/1.mp4', color: 'rgba(14,165,233,0.68)' },
  { title: '아이돌 콘서트', tag: 'K-POP', video: '/videos/2.mp4', color: 'rgba(244,63,94,0.68)' },
  { title: '쇼 퍼포먼스', tag: 'Hip-Hop', video: '/videos/3.mp4', color: 'rgba(245,158,11,0.68)' },
  { title: '애니 캐릭터', tag: 'Anime', video: '/videos/4.mp4', color: 'rgba(16,185,129,0.68)' },
]

function ShowcaseCard({ title, tag, video, color }: { title: string; tag: string; video: string; color: string }) {
  return (
    <div className="relative flex-shrink-0 rounded-2xl overflow-hidden" style={{ width: '160px', height: '216px', background: '#202020' }}>
      <video src={video} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${color} 0%, rgba(0,0,0,0.12) 55%, transparent 100%)` }} />
      <div className="absolute bottom-3 left-3 right-3">
        <span className="inline-block text-[0.58rem] font-semibold tracking-wide mb-1.5 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.82)' }}>
          {tag}
        </span>
        <p className="text-[0.78rem] font-semibold text-white leading-tight">{title}</p>
      </div>
    </div>
  )
}

export default function LandingPage({ isLoggedIn }: Props) {
  const ctaHref = isLoggedIn ? '/generate' : '/auth'

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target) }
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const row1 = SHOWCASE_ITEMS
  const row2 = [...SHOWCASE_ITEMS.slice(4), ...SHOWCASE_ITEMS.slice(0, 4)]

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-[#202020] text-gray-900 dark:text-[#f0f0f0]">

      {/* ───────────────────────────────────────
          NAVBAR
      _______________________________________________ */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/85 dark:bg-[#202020]/85 border-b border-black/6 dark:border-white/6">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight select-none gradient-text">mosaic</span>

          <nav className="hidden md:flex items-center gap-8">
            {[{ label: '작동 원리', href: '#how' }, { label: '테마', href: '#themes' }, { label: '갤러리', href: '/gallery' }].map(({ label, href }) => (
              <a key={label} href={href} className="text-sm text-gray-500 dark:text-white/38 hover:text-gray-900 dark:hover:text-white/85 transition-colors duration-200">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/generate" className="btn-glow text-white text-sm font-bold px-5 py-2.5 rounded-full">영상 만들기 →</Link>
            ) : (
              <>
                <Link href="/auth" className="hidden sm:block text-sm text-gray-500 dark:text-white/38 hover:text-gray-900 dark:hover:text-white transition-colors">로그인</Link>
                <Link href="/auth" className="btn-glow text-white text-sm font-bold px-5 py-2.5 rounded-full">무료 시작 →</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────
          HERO — split layout
      _______________________________________________ */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">

        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-30 dark:opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(80px)' }} />
          <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)', filter: 'blur(80px)' }} />
          <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 w-full grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">

          {/* ── Left: text ── */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-7">
              <span className="glass text-xs font-semibold px-4 py-2 rounded-full tracking-widest text-gray-500 dark:text-white/45">
                ✦ &nbsp;AI 바이럴 영상 생성 플랫폼
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-black leading-[1.2] tracking-tight mb-6" style={{ fontSize: 'clamp(44px, 4.2vw, 75px)' }}>
              <span className="block text-gray-900 dark:text-white">내 사진을</span>
              <span className="block gradient-text mt-1">주제별 영상으로</span>
              <span className="block gradient-text">만들어봐요</span>
            </h1>

            <p className="text-base lg:text-lg leading-relaxed text-gray-500 dark:text-white/44 max-w-lg mb-8">
              야구 중계샷, K-POP 직캠, 힙합 무대, 지브리 애니메이션 — <br />
              원하는 테마를 선택하면 사진 한 장이 바이럴 영상이 됩니다.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href={ctaHref}>
                <GlassButton size="lg">지금 무료로 시작하기 →</GlassButton>
              </Link>
              <a href="#themes" className="text-sm font-medium text-gray-400 dark:text-white/38 hover:text-gray-700 dark:hover:text-white/72 transition-colors">
                4가지 테마 보기 ↓
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-7 border-t border-black/8 dark:border-white/8 w-full">
              {[
                { value: '50K+', label: '생성된 영상' },
                { value: '12K+', label: '크리에이터' },
                { value: '320만', label: '평균 조회수' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</span>
                  <span className="text-xs text-gray-400 dark:text-white/32">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: 2×2 scattered video cards ── */}
          <div className="hidden lg:grid grid-cols-2 gap-5 relative" style={{ perspective: '1200px' }}>
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                className="relative rounded-3xl overflow-hidden cursor-pointer group"
                style={{
                  aspectRatio: '3/4',
                  transform: `rotate(${theme.rotation}) translateY(${theme.translateY})`,
                  boxShadow: `0 20px 60px -10px rgba(0,0,0,0.22), 0 8px 20px -8px ${theme.accent}30`,
                  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `rotate(0deg) translateY(-4px) scale(1.03)`
                  e.currentTarget.style.boxShadow = `0 32px 80px -10px rgba(0,0,0,0.3), 0 12px 30px -6px ${theme.accent}50`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${theme.rotation}) translateY(${theme.translateY})`
                  e.currentTarget.style.boxShadow = `0 20px 60px -10px rgba(0,0,0,0.22), 0 8px 20px -8px ${theme.accent}30`
                }}
              >
                <video src={theme.video} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />

                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)` }} />

                {/* Accent glow border */}
                <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `inset 0 0 0 2px ${theme.accent}60` }} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${theme.accent}25`, color: theme.accent, border: `1px solid ${theme.accent}40` }}>
                      {theme.sub}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{theme.title}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────
          PLATFORM MARQUEE
      _______________________________________________ */}
      <div className="border-y border-black/6 dark:border-white/6 bg-black/[0.015] dark:bg-white/[0.015] overflow-hidden py-4">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 px-5">
              {[
                { icon: '▶', label: 'YouTube Shorts' },
                { icon: '♪', label: 'TikTok' },
                { icon: '◈', label: 'Instagram Reels' },
                { icon: '⚾', label: '야구 중계샷' },
                { icon: '🎤', label: '아이돌 직캠' },
                { icon: '✨', label: '지브리 애니메이션' },
                { icon: '⚡', label: 'Google Veo 3.1' },
                { icon: '◎', label: 'GPT-image-2' },
                { icon: '🎵', label: '쇼미더머니' },
                { icon: '→', label: '원클릭 제작' },
              ].map((item) => (
                <span key={`${i}-${item.label}`} className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-gray-400 dark:text-white/22">
                  <span className="text-gray-300 dark:text-white/12">{item.icon}</span>
                  {item.label}
                  <span className="ml-2 text-gray-200 dark:text-white/8">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────
          HOW IT WORKS
      _____________________________________________── */}
      <section id="how" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex glass text-xs font-semibold px-4 py-2 rounded-full tracking-widest text-gray-500 dark:text-white/40 mb-5">
              사용 방법
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              3단계만으로 완성
            </h2>
            <p className="mt-4 text-base text-gray-500 dark:text-white/38 max-w-sm mx-auto">
              복잡한 편집 도구 없이, 사진 한 장으로 시작하세요
            </p>
          </div>

          {/* Steps — horizontal connected */}
          <div className="relative">

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: '01', emoji: '📷', color: '#7c3aed',
                  title: '사진 첨부',
                  desc: '얼굴이 잘 보이는 사진 한 장을 업로드하세요. 셀카, 증명사진, 어떤 사진도 괜찮습니다.',
                },
                {
                  num: '02', emoji: '🤖', color: '#4f46e5',
                  title: '테마 선택 & AI 생성',
                  desc: '4가지 테마 중 원하는 스타일을 선택하면 AI가 이미지를 자동으로 생성합니다.',
                },
                {
                  num: '03', emoji: '🎬', color: '#2563eb',
                  title: '영상 다운로드',
                  desc: '생성된 이미지를 기반으로 8초 영상이 완성됩니다. 바로 SNS에 올려보세요.',
                },
              ].map((step, i) => (
                <div key={step.num} className={`reveal reveal-delay-${i + 1} relative`}>
                  <div className="glass-card rounded-3xl p-8 flex flex-col gap-5 h-full">
                    {/* Step number bubble */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${step.color}14`, border: `1px solid ${step.color}25` }}>
                        {step.emoji}
                      </div>
                      <span className="text-5xl font-black leading-none" style={{ color: `${step.color}12` }}>
                        {step.num}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-white/44">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          SHOWCASE — "이런 영상이 만들어집니다"
      _______________________________________________ */}
      <section className="py-16 overflow-hidden bg-black/[0.018] dark:bg-white/[0.015]">
        <div className="text-center mb-10 reveal px-6">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            이런 영상들이 만들어집니다
          </h2>
          <p className="text-sm text-gray-400 dark:text-white/32 mt-2">실제 AI 생성 결과물</p>
        </div>

        {/* Side fade masks */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 z-10 w-40 pointer-events-none bg-gradient-to-r from-white dark:from-[#202020] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 z-10 w-40 pointer-events-none bg-gradient-to-l from-white dark:from-[#202020] to-transparent" />

          <div className="flex flex-col gap-3">
            <div style={{ display: 'flex', gap: '10px', width: 'max-content', animation: 'showcaseScrollLeft 55s linear infinite' }}>
              {[...row1, ...row1].map((item, j) => <ShowcaseCard key={j} {...item} />)}
            </div>
            <div style={{ display: 'flex', gap: '10px', width: 'max-content', animation: 'showcaseScrollRight 45s linear infinite' }}>
              {[...row2, ...row2].map((item, j) => <ShowcaseCard key={j} {...item} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          4 THEMES — with video backgrounds
      _______________________________________________ */}
      <section id="themes" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex glass text-xs font-semibold px-4 py-2 rounded-full tracking-widest text-gray-500 dark:text-white/40 mb-5">
              4가지 테마
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              <span className="text-gray-900 dark:text-white">원하는 세계로</span>
              <br />
              <span className="gradient-text">변신시켜드립니다</span>
            </h2>
          </div>

          {/* 2×2 large theme cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {THEMES.map((theme, i) => (
              <div
                key={theme.id}
                className={`reveal reveal-delay-${(i % 2) + 1} relative rounded-3xl overflow-hidden group cursor-pointer`}
                style={{ height: '340px' }}
              >
                {/* Video background */}
                <video src={theme.video} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

                {/* Accent glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at bottom left, ${theme.accent}20 0%, transparent 60%)` }} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{theme.emoji}</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${theme.accent}22`, color: theme.accent, border: `1px solid ${theme.accent}35` }}>
                      {theme.sub}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{theme.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed max-w-xs">{theme.desc}</p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Link href={ctaHref} className="text-sm font-semibold" style={{ color: theme.accent }}>
                      이 테마로 만들기 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          STATS
      _______________________________________________ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto reveal">
          <div className="glass-strong rounded-3xl p-12 md:p-16">
            <p className="text-center text-sm font-semibold tracking-widest text-gray-400 dark:text-white/30 mb-10 uppercase">실제 수치</p>
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '50,000+', label: '생성된 영상', icon: '🎬' },
                { value: '12,000+', label: '활성 크리에이터', icon: '🧑‍🎨' },
                { value: '평균 320만', label: '영상당 조회수', icon: '👀' },
              ].map((stat, i) => (
                <div key={stat.label} className={`flex flex-col items-center gap-2 reveal reveal-delay-${i + 1}`}>
                  <span className="text-3xl mb-1">{stat.icon}</span>
                  <span className="text-3xl md:text-4xl font-black gradient-text">{stat.value}</span>
                  <span className="text-sm text-gray-500 dark:text-white/38">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          FINAL CTA
      _______________________________________________ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto reveal">
          <div className="relative rounded-[2rem] overflow-hidden text-center p-14 md:p-20"
            style={{ background: 'linear-gradient(135deg, #2d1a4a 0%, #231557 35%, #1a2060 70%, #1a2040 100%)' }}>

            {/* Decorative glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 65%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-0 right-10 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 65%)', filter: 'blur(40px)' }} />

            {/* Content */}
            <div className="relative">
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8 bg-white/8 border border-white/12 text-white/55 tracking-widest">
                ✦ &nbsp;무료로 시작할 수 있어요
              </span>
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-5">
                <span className="text-white">지금 바로</span>
                <br />
                <span className="gradient-text">바이럴 영상을 만드세요</span>
              </h2>
              <p className="text-base text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
                회원가입만 하면 무료로 시작할 수 있어요.
                <br />
                신용카드 없이도 첫 영상을 바로 만들어보세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ctaHref}>
                  <GlassButton size="lg">{isLoggedIn ? '영상 만들러 가기' : '무료로 시작하기'} →</GlassButton>
                </Link>
                {!isLoggedIn && (
                  <Link href="/gallery" className="text-sm text-white/35 hover:text-white/65 transition-colors">
                    갤러리 먼저 보기
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────
          FOOTER
      _______________________________________________ */}
      <footer className="border-t border-black/6 dark:border-white/6 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black gradient-text select-none">mosaic</span>
            <div className="hidden md:flex gap-6">
              {['이용약관', '개인정보처리방침'].map((link) => (
                <a key={link} href="#" className="text-xs text-gray-400 dark:text-white/28 hover:opacity-70 transition-opacity">{link}</a>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-white/20">© 2025 Mosaic. Powered by AI.</p>
          <div className="flex gap-6 md:hidden">
            {['이용약관', '개인정보처리방침'].map((link) => (
              <a key={link} href="#" className="text-xs text-gray-400 dark:text-white/28 hover:opacity-70 transition-opacity">{link}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
