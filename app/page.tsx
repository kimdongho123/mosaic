import { createInsForgeServerClient } from './lib/insforge/server'
import LandingPage from './LandingPage'

export default async function Home() {
  const insforge = await createInsForgeServerClient()
  const { data } = await insforge.auth.getCurrentUser()
  const isLoggedIn = !!data?.user?.id

  return <LandingPage isLoggedIn={isLoggedIn} />
}
