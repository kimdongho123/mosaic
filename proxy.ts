import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@insforge/sdk/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  await updateSession({
    requestCookies: request.cookies,
    responseCookies: response.cookies
  })

  return response
}
