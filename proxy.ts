import { updateSession, type CookieStore } from '@insforge/sdk/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1단계: 갱신된 토큰을 응답 쿠키에 쓸 임시 response 생성
  const tempResponse = NextResponse.next({ request })

  const { accessToken } = await updateSession({
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: tempResponse.cookies as unknown as CookieStore,
    refreshLeewaySeconds: 600,
  })

  if (accessToken) {
    // 2단계: 갱신된 토큰을 요청 헤더에도 심어서
    //        같은 요청 내 서버 컴포넌트/API route가 새 토큰을 볼 수 있게 함
    const newHeaders = new Headers(request.headers)
    newHeaders.set('x-insforge-access-token', accessToken)

    const finalResponse = NextResponse.next({
      request: { headers: newHeaders },
    })

    // 임시 response에 세팅된 set-cookie 헤더를 최종 응답으로 복사 (브라우저 쿠키 갱신)
    tempResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        finalResponse.headers.append('set-cookie', value)
      }
    })

    return finalResponse
  }

  return tempResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|videos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}
