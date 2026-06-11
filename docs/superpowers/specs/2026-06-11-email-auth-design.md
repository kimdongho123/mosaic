# 이메일/패스워드 인증 추가 설계

**날짜:** 2026-06-11  
**상태:** 승인됨

## 목표

기존 Google OAuth 로그인 외에 이메일/패스워드 로그인 및 회원가입 기능을 추가한다. InsForge Auth SDK와 연동하며, 아이디/비밀번호 찾기 UI도 포함한다(기능 미구현).

---

## UI 구조

### `/app/auth/page.tsx`

- **Client Component**로 전환 (`'use client'`)
- `useState`로 `tab: 'login' | 'signup'` 관리
- `useState`로 `error: string | null`, `message: string | null` 관리

**레이아웃:**

```
[ mosaic 로고 ]
[ 로그인 | 회원가입 ]  ← 탭 (active 탭: 하단 border 표시)

─── 로그인 탭 ───
  이메일 input
  비밀번호 input
  [ 로그인 ] 버튼
  아이디 찾기 · 비밀번호 찾기  (UI만, href="#")
  ── 또는 ──
  [ Google로 계속하기 ]

─── 회원가입 탭 ───
  이메일 input
  비밀번호 input
  [ 회원가입 ] 버튼
  ── 또는 ──
  [ Google로 계속하기 ]

에러/성공 메시지: 폼 상단 인라인 표시
```

**기존 스타일 유지:**
- 배경: `#ECEEF0` / 카드: `#DEE0E2`
- 텍스트: `#202020`
- 버튼: `backgroundColor: #202020`, `color: #ECEEF0`
- Tailwind CSS 사용

---

## 서버 액션 (`app/auth/actions.ts`)

### 기존

```typescript
export async function signInWithGoogle()
```

### 추가

```typescript
export async function signInWithPassword(formData: FormData): Promise<{ error?: string }>
export async function signUp(formData: FormData): Promise<{ error?: string; requireEmailVerification?: boolean }>
```

#### `signInWithPassword` 흐름

1. `formData`에서 `email`, `password` 추출
2. `createServerClient().auth.signInWithPassword({ email, password })` 호출
3. 성공: `setAuthCookies`로 세션 저장 → `/generate` redirect
4. 실패: `{ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }` 반환

#### `signUp` 흐름

1. `formData`에서 `email`, `password` 추출
2. `createServerClient().auth.signUp({ email, password })` 호출
3. `requireEmailVerification === true`: `{ requireEmailVerification: true }` 반환 → 클라이언트에서 "인증 이메일을 확인해주세요" 메시지 표시
4. `accessToken` 있음 (이메일 인증 불필요): `setAuthCookies` → `/generate` redirect
5. 실패: `{ error: '회원가입에 실패했습니다.' }` 반환

#### 세션 쿠키 처리

Server Action 내에서 `NextResponse`를 직접 생성하고 `setAuthCookies(response.cookies, { accessToken, refreshToken })`를 호출한 뒤, `cookies()` API로 복사하는 방식을 사용한다. 이는 기존 OAuth callback(`/api/auth/callback/route.ts`)과 동일한 `@insforge/sdk/ssr`의 `setAuthCookies` 헬퍼를 재사용한다.

---

## 에러 처리

| 상황 | 표시 방식 |
|------|-----------|
| 로그인 실패 (이메일/PW 불일치) | 폼 상단 빨간 텍스트 |
| 회원가입 실패 (이미 존재하는 이메일 등) | 폼 상단 빨간 텍스트 |
| 이메일 인증 필요 | 폼 상단 파란 텍스트 ("이메일을 확인해주세요") |
| 회원가입 성공 (인증 불필요) | `/generate` 리다이렉트 |

에러는 URL query string 방식이 아닌 **Server Action 반환값** 기반 인라인 처리.

---

## ID/PW 찾기 UI

- 로그인 탭 하단에 `아이디 찾기 · 비밀번호 찾기` 링크 텍스트 표시
- `href="#"`, `onClick` 없음
- 기능 미구현 (추후 별도 스펙)

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `app/auth/page.tsx` | Client Component 전환, 탭/폼 UI 추가 |
| `app/auth/actions.ts` | `signInWithPassword`, `signUp` 추가 |

신규 파일 없음.
