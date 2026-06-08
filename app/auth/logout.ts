'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { clearAuthCookies } from '@insforge/sdk/ssr'

export async function signOut() {
  const cookieStore = await cookies()
  clearAuthCookies(cookieStore)
  redirect('/')
}
