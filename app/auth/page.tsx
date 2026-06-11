import { redirect } from 'next/navigation'
import { createInsForgeServerClient } from '../lib/insforge/server'
import AuthForm from './AuthForm'

export default async function AuthPage() {
  const insforge = await createInsForgeServerClient()
  const { data } = await insforge.auth.getCurrentUser()
  if (data?.user?.id) redirect('/generate')
  return <AuthForm />
}
