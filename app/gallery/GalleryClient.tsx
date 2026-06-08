'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { signOut } from '../auth/logout'

interface Generation {
  id: string
  card_id: string
  output_image_url: string | null
  output_video_url: string | null
  status: string
  created_at: string
}

interface UserInfo {
  email: string
  name?: string | null
  avatarUrl?: string | null
}

const CARD_LABELS: Record<string, string> = {
  baseball: '야구 중계샷',
  idol: '아이돌 직캠',
  show: '쇼미 관객석',
  fashion: '지브리 애니메이션', // 구버전 card_id
  anime: '지브리 애니메이션',  // 신버전 card_id
}

export default function GalleryClient({ user, generations }: { user: UserInfo; generations: Generation[] }) {
  const initial = (user.name ?? user.email).charAt(0).toUpperCase()
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? generations
    : filter === 'anime'
      ? generations.filter((g) => g.card_id === 'anime' || g.card_id === 'fashion') // 구/신 버전 모두 매칭
      : generations.filter((g) => g.card_id === filter)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ECEEF0', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .nav-link { transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease; }
        .nav-link:hover { opacity: 1 !important; background-color: #DEE0E2 !important; }
        .filter-btn { transition: background-color 0.2s ease, color 0.2s ease; cursor: pointer; }
        .filter-btn:hover { background-color: #DEE0E2 !important; }
      `}</style>

      {/* Header */}
      <header style={{ height: '64px', backgroundColor: '#ECEEF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', flexShrink: 0, borderBottom: '1px solid rgba(32,32,32,0.08)' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#202020', textDecoration: 'none' }}>
          mosaic
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#DEE0E2', padding: '4px', borderRadius: '9999px' }}>
          <Link href="/generate" className="nav-link" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#202020', opacity: 0.5, textDecoration: 'none', padding: '5px 14px', borderRadius: '9999px' }}>
            생성하기
          </Link>
          <Link href="/gallery" className="nav-link" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#202020', textDecoration: 'none', padding: '5px 14px', borderRadius: '9999px', backgroundColor: '#ECEEF0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            내 생성물
          </Link>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <form action={signOut}>
            <button type="submit" style={{ fontSize: '0.78rem', color: '#202020', opacity: 0.45, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
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

      {/* Content */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {generations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Title + filter */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#202020', letterSpacing: '-0.02em', margin: 0 }}>내 생성물</h1>
                <p style={{ fontSize: '0.8rem', color: '#202020', opacity: 0.4, marginTop: '4px' }}>{filtered.length}개</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['all', 'baseball', 'idol', 'show', 'anime'] as const).map((key) => (
                  <button
                    key={key}
                    className="filter-btn"
                    onClick={() => setFilter(key)}
                    style={{
                      padding: '6px 14px', borderRadius: '9999px', border: 'none',
                      fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                      backgroundColor: filter === key ? '#202020' : '#DEE0E2',
                      color: filter === key ? '#ECEEF0' : '#202020',
                    }}
                  >
                    {key === 'all' ? '전체' : CARD_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div style={{ columns: 'auto 180px', columnGap: '14px' }}>
              {filtered.map((gen, i) => (
                <GenerationCard key={gen.id} gen={gen} index={i} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function GenerationCard({ gen, index }: { gen: Generation; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const label = CARD_LABELS[gen.card_id] ?? gen.card_id
  const date = new Date(gen.created_at).toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 55)
    return () => clearTimeout(t)
  }, [index])

  useEffect(() => {
    if (!videoRef.current) return
    if (hovered && gen.output_video_url) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [hovered, gen.output_video_url])

  const download = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    a.click()
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        breakInside: 'avoid',
        marginBottom: '14px',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#202020',
        cursor: 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: `opacity 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${index * 55}ms, transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${index * 55}ms, box-shadow 0.3s ease`,
        boxShadow: hovered ? '0 24px 48px rgba(0,0,0,0.22)' : '0 4px 16px rgba(0,0,0,0.10)',
      }}
    >
      {/* Media */}
      {gen.output_video_url ? (
        <video
          ref={videoRef}
          src={gen.output_video_url}
          muted
          playsInline
          loop
          poster={gen.output_image_url ?? undefined}
          style={{ display: 'block', width: '100%', objectFit: 'cover' }}
        />
      ) : gen.output_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={gen.output_image_url} alt={label} style={{ display: 'block', width: '100%' }} />
      ) : null}

      {/* Top badges */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          padding: '4px 10px', borderRadius: '9999px',
          backgroundColor: 'rgba(32,32,32,0.5)', backdropFilter: 'blur(10px)',
          fontSize: '0.65rem', fontWeight: 600, color: '#ECEEF0', letterSpacing: '0.03em',
        }}>
          {label}
        </div>
        {gen.output_video_url && (
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%',
            backgroundColor: 'rgba(32,32,32,0.5)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="9" height="10" viewBox="0 0 9 10" fill="#ECEEF0">
              <path d="M0 0L9 5L0 10V0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: hovered ? 'auto' : 'none',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '14px 12px',
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}>
          <p style={{ fontSize: '0.68rem', color: '#ECEEF0', opacity: 0.5, marginBottom: '10px' }}>{date}</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {gen.output_image_url && (
              <button
                onClick={() => download(gen.output_image_url!, `mosaic-image-${gen.id}.webp`)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)',
                  backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                  color: '#ECEEF0', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                이미지
              </button>
            )}
            {gen.output_video_url && (
              <button
                onClick={() => download(gen.output_video_url!, `mosaic-video-${gen.id}.mp4`)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                  backgroundColor: '#ECEEF0',
                  color: '#202020', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
              >
                영상
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#DEE0E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#202020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.35}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#202020', letterSpacing: '-0.01em', marginBottom: '6px' }}>아직 생성물이 없어요</p>
        <p style={{ fontSize: '0.82rem', color: '#202020', opacity: 0.4, lineHeight: 1.6 }}>사진을 첨부해서 첫 영상을 만들어보세요</p>
      </div>
      <Link
        href="/generate"
        style={{ padding: '11px 28px', borderRadius: '9999px', backgroundColor: '#202020', color: '#ECEEF0', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', marginTop: '8px' }}
      >
        생성하러 가기 →
      </Link>
    </div>
  )
}
