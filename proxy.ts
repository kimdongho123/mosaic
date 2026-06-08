import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@insforge/sdk/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  await updateSession({
    requestCookies: { get: (name: string) => request.cookies.get(name) },
    responseCookies: response.cookies,
  })

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|videos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
